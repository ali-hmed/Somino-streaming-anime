"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { Heart, Bookmark, ChevronLeft, ChevronRight, MoreVertical, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnimeCard from "@/components/AnimeCard";

type WatchlistStatus = 'All' | 'Watching' | 'On-Hold' | 'Plan to Watch' | 'Dropped' | 'Completed';
const STATUS_OPTIONS: Exclude<WatchlistStatus, 'All'>[] = ['Watching', 'On-Hold', 'Plan to Watch', 'Dropped', 'Completed'];
const ITEMS_PER_PAGE = 30;

// ── Three-dot status menu overlaid on top of AnimeCard ─────────────────────
function StatusMenu({
    animeId,
    currentStatus,
    onStatusChange,
    onRemove,
}: {
    animeId: string;
    currentStatus: string;
    onStatusChange: (id: string, status: Exclude<WatchlistStatus, 'All'>) => void;
    onRemove: (id: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="absolute top-2 right-2 z-30">
            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(o => !o); }}
                className="w-7 h-7 rounded-md bg-white/90 backdrop-blur flex items-center justify-center text-black shadow hover:bg-white transition-colors"
            >
                <MoreVertical size={14} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97 }}
                        transition={{ duration: 0.12 }}
                        className="absolute top-full right-0 mt-1 w-44 bg-white rounded-xl shadow-2xl overflow-hidden z-50 py-1"
                    >
                        {STATUS_OPTIONS.map(s => (
                            <button
                                key={s}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onStatusChange(animeId, s); setOpen(false); }}
                                className="w-full flex items-center justify-between px-4 py-2.5 text-[13px] text-gray-800 hover:bg-gray-100 transition-colors"
                            >
                                <span className={currentStatus === s ? 'font-black text-black' : 'font-medium'}>{s}</span>
                                {currentStatus === s && <Check size={14} className="text-black shrink-0" strokeWidth={3} />}
                            </button>
                        ))}
                        <div className="h-px bg-gray-200 mx-2 my-1" />
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(animeId); setOpen(false); }}
                            className="w-full flex items-center px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors font-bold"
                        >
                            Remove
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function WatchListPage() {
    const { user, setWatchlist } = useAuthStore();
    const [activeTab, setActiveTab] = useState<WatchlistStatus>('All');
    const [page, setPage] = useState(1);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const watchlist = user?.watchlist || [];
    const uniqueWatchlist = Array.from(new Map(watchlist.map(item => [item.animeId, item])).values());

    const mapStatus = (status: string): WatchlistStatus => {
        if (status === 'Planned') return 'Plan to Watch';
        return status as WatchlistStatus;
    };

    const filteredList = activeTab === 'All'
        ? uniqueWatchlist
        : uniqueWatchlist.filter(item => mapStatus(item.status) === activeTab);

    const totalPages = Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE));
    const safePage = Math.min(page, totalPages);
    const pagedList = filteredList.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

    const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030') + '/api/v1';

    const handleRemove = async (animeId: string) => {
        if (!user?.token) return;
        try {
            const res = await fetch(`${BASE_URL}/auth/watchlist/${animeId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success) setWatchlist(data.data);
            }
        } catch (e) { console.error(e); }
    };

    const handleStatusChange = async (animeId: string, newStatus: Exclude<WatchlistStatus, 'All'>) => {
        if (!user?.token) return;
        const item = uniqueWatchlist.find(i => i.animeId === animeId);
        if (!item) return;
        try {
            const res = await fetch(`${BASE_URL}/auth/watchlist`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${user.token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ animeId: item.animeId, animeTitle: item.animeTitle, animeImage: item.animeImage, status: newStatus })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success) setWatchlist(data.data);
            }
        } catch (e) { console.error(e); }
    };

    // Map watchlist items to the exact shape AnimeCard uses across the site
    const toAnimeShape = (item: typeof uniqueWatchlist[0]) => ({
        id: item.animeId,
        title: { english: item.animeTitle, romaji: item.animeTitle, userPreferred: item.animeTitle },
        image: item.animeImage,
        type: 'TV',
        subEpisodes: 13,   // placeholder — real value would come from full anime data
        dubEpisodes: 13,
        totalEpisodes: 13,
        score: null,
        rating: '',
    });

    const tabs: WatchlistStatus[] = ['All', 'Watching', 'On-Hold', 'Plan to Watch', 'Dropped', 'Completed'];

    if (!mounted) return null;

    return (
        <div className="space-y-8 pb-16">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Heart size={24} className="text-white fill-white" />
                <h2 className="text-[22px] font-black text-white tracking-tight">Watch List</h2>
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-black border border-primary/20">
                    {filteredList.length}
                </span>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {tabs.map(tab => (
                    <button key={tab} onClick={() => { setActiveTab(tab); setPage(1); }}
                        className={`px-4 py-2 rounded-[6px] text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${activeTab === tab
                            ? 'bg-primary text-white shadow-[0_0_15px_rgba(83,204,184,0.3)]'
                            : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            {uniqueWatchlist.length === 0 ? (
                <div className="rounded-3xl p-24 flex flex-col items-center justify-center text-center space-y-4 bg-[#141519]/40 border border-white/5">
                    <Bookmark size={40} className="text-white/10" />
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Your list is empty</h3>
                        <p className="text-[11px] text-white/20 mt-1">Start browsing and add anime to your watchlist!</p>
                    </div>
                </div>
            ) : filteredList.length === 0 ? (
                <div className="py-20 text-center">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">No titles in this category</p>
                </div>
            ) : (
                <>
                    {/* Same grid as filter/popular pages: 2 → 3 → 4 → 5 → 6 cols */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
                        <AnimatePresence mode="popLayout">
                            {pagedList.map(item => (
                                <motion.div
                                    key={item.animeId}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="relative"
                                >
                                    {/* Exact same AnimeCard used everywhere else in the site */}
                                    <AnimeCard
                                        anime={toAnimeShape(item)}
                                        variant="portrait"
                                        showEpisode={false}
                                        showScore={false}
                                        showPG13={false}
                                    />

                                    {/* ⋮ Status menu overlaid on the card image */}
                                    <StatusMenu
                                        animeId={item.animeId}
                                        currentStatus={mapStatus(item.status)}
                                        onStatusChange={handleStatusChange}
                                        onRemove={handleRemove}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-1.5 pt-6">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white/40 hover:text-white disabled:opacity-30">
                                <ChevronLeft size={16} />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                                .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                                    acc.push(p); return acc;
                                }, [])
                                .map((p, idx) => p === '...'
                                    ? <span key={`d${idx}`} className="w-8 h-8 flex items-center justify-center text-white/20 text-[11px]">…</span>
                                    : <button key={p} onClick={() => setPage(p as number)}
                                        className={`w-8 h-8 rounded-full text-[11px] font-black transition-all ${safePage === p ? 'bg-primary text-white' : 'bg-white/5 text-white/40 hover:text-white'}`}>{p}</button>
                                )}

                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white/40 hover:text-white disabled:opacity-30">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
