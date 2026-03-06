"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Heart, Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnimeCard from "@/components/AnimeCard";

type WatchlistStatus = 'All' | 'Watching' | 'On-Hold' | 'Plan to Watch' | 'Dropped' | 'Completed';

const ITEMS_PER_PAGE = 30;

export default function WatchListPage() {
    const { user, setWatchlist } = useAuthStore();
    const [activeTab, setActiveTab] = useState<WatchlistStatus>('All');
    const [page, setPage] = useState(1);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const watchlist = user?.watchlist || [];

    // De-dupe by animeId
    const uniqueWatchlist = Array.from(new Map(watchlist.map(item => [item.animeId, item])).values());

    const mapStatus = (status: string): WatchlistStatus => {
        if (status === 'Planned') return 'Plan to Watch';
        return status as WatchlistStatus;
    };

    const filteredList = activeTab === 'All'
        ? uniqueWatchlist
        : uniqueWatchlist.filter(item => mapStatus(item.status) === activeTab);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE));
    const safePage = Math.min(page, totalPages);
    const pagedList = filteredList.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

    const handleRemove = async (animeId: string) => {
        if (!user?.token) return;
        const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030') + '/api/v1';
        try {
            const res = await fetch(`${BASE_URL}/auth/watchlist/${animeId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success) setWatchlist(data.data);
            }
        } catch (e) {
            console.error("Error removing from watchlist:", e);
        }
    };

    // Map watchlist item ➜ shape AnimeCard expects
    const toAnimeShape = (item: typeof uniqueWatchlist[0]) => ({
        id: item.animeId,
        title: { english: item.animeTitle, romaji: item.animeTitle, userPreferred: item.animeTitle },
        image: item.animeImage,
        type: 'TV',
        subEpisodes: 0,
        dubEpisodes: 0,
        score: null,
        rating: '',
    });

    const tabs: WatchlistStatus[] = ['All', 'Watching', 'On-Hold', 'Plan to Watch', 'Dropped', 'Completed'];

    if (!mounted) return null;

    return (
        <div className="space-y-8 pb-16">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <Heart size={24} className="text-white fill-white" />
                    <h2 className="text-[22px] font-black text-white tracking-tight">Watch List</h2>
                    <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-black border border-primary/20">
                        {filteredList.length}
                    </span>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setPage(1); }}
                        className={`px-4 py-2 rounded-[6px] text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${activeTab === tab
                                ? 'bg-primary text-white shadow-[0_0_15px_rgba(83,204,184,0.3)]'
                                : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Empty States */}
            {uniqueWatchlist.length === 0 ? (
                <div className="rounded-3xl p-24 flex flex-col items-center justify-center text-center space-y-5 bg-[#141519]/40 border border-white/5 backdrop-blur-md">
                    <Bookmark size={40} className="text-white/10" />
                    <div className="space-y-1">
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Your list is empty</h3>
                        <p className="text-[11px] font-medium text-white/20">Start browsing and add anime to your watchlist!</p>
                    </div>
                </div>
            ) : filteredList.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">No titles in this category</p>
                </div>
            ) : (
                <>
                    {/* Anime Card Grid — same 5-col grid used across the site */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
                        <AnimatePresence mode="popLayout">
                            {pagedList.map(item => (
                                <motion.div
                                    key={item.animeId}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="relative group/card"
                                >
                                    {/* Site's standard AnimeCard */}
                                    <AnimeCard
                                        anime={toAnimeShape(item)}
                                        variant="portrait"
                                        showEpisode={false}
                                        showScore={false}
                                    />

                                    {/* Remove button layered on top */}
                                    <button
                                        onClick={() => handleRemove(item.animeId)}
                                        title="Remove from list"
                                        className="absolute top-2 right-2 z-20 w-6 h-6 rounded-[3px] bg-black/60 backdrop-blur-md border border-white/10 text-white/60 hover:text-white hover:bg-red-500/80 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all text-[10px] font-black"
                                    >
                                        ✕
                                    </button>

                                    {/* Status badge */}
                                    <div className="absolute top-2 left-2 z-20 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                        <span className="px-1.5 py-0.5 rounded-[3px] bg-primary/80 backdrop-blur-md text-[8px] font-black text-white uppercase tracking-wide">
                                            {mapStatus(item.status)}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-1.5 pt-6">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={safePage === 1}
                                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white/40 hover:text-white disabled:opacity-30 transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                                .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((p, idx) =>
                                    p === '...' ? (
                                        <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-white/20 text-[11px]">…</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p as number)}
                                            className={`w-8 h-8 rounded-full text-[11px] font-black transition-all ${safePage === p ? 'bg-primary text-white' : 'bg-white/5 text-white/40 hover:text-white'}`}
                                        >
                                            {p}
                                        </button>
                                    )
                                )}

                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={safePage === totalPages}
                                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white/40 hover:text-white disabled:opacity-30 transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
