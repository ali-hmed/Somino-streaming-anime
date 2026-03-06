"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Bookmark, Trash2, Heart, MoreVertical, Subtitles, Mic, Play, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type WatchlistStatus = 'All' | 'Watching' | 'On-Hold' | 'Plan to Watch' | 'Dropped' | 'Completed';

export default function WatchListPage() {
    const { user, setWatchlist } = useAuthStore();
    const [activeTab, setActiveTab] = useState<WatchlistStatus>('All');
    const [isPublic, setIsPublic] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const watchlist = user?.watchlist || [];

    // Filter out duplicates based on animeId to prevent React key errors
    const uniqueWatchlist = Array.from(new Map(watchlist.map(item => [item.animeId, item])).values());

    const mapStatus = (status: string): WatchlistStatus => {
        if (status === 'Planned' || status === 'Plan to Watch') return 'Plan to Watch';
        return status as WatchlistStatus;
    };

    const filteredList = activeTab === 'All'
        ? uniqueWatchlist
        : uniqueWatchlist.filter(item => mapStatus(item.status) === activeTab);

    const handleRemove = async (animeId: string) => {
        if (!user?.token) return;
        const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030') + '/api/v1';

        try {
            const res = await fetch(`${BASE_URL}/auth/watchlist/${animeId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setWatchlist(data.data);
                }
            }
        } catch (error) {
            console.error("Error removing from watchlist:", error);
        }
    };

    const tabs: WatchlistStatus[] = ['All', 'Watching', 'On-Hold', 'Plan to Watch', 'Dropped', 'Completed'];

    if (!mounted) return null;

    return (
        <div className="space-y-6 pb-12 overflow-hidden">
            {/* Header: Title and Compact Public Toggle */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Heart size={24} className="text-white fill-white" />
                    <h2 className="text-[22px] font-black text-white tracking-tight">Watch List</h2>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Public</span>
                    <div className="flex items-center bg-[#1a1b20] border border-white/10 rounded-[4px] overflow-hidden">
                        <span className="px-2 py-0.5 text-[9px] font-black text-white/30 uppercase cursor-pointer hover:text-white transition-colors">ON</span>
                        <span className={`px-2 py-0.5 text-[9px] font-black text-white uppercase bg-primary`}>ON</span>
                    </div>
                </div>
            </div>

            {/* Compact Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 rounded-[5px] text-[10px] font-black tracking-wider uppercase transition-all whitespace-nowrap ${activeTab === tab
                            ? 'bg-primary text-white'
                            : 'bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Grid Content: 6 columns on large screens to match density */}
            {!watchlist || watchlist.length === 0 ? (
                <div className="rounded-3xl p-16 flex flex-col items-center justify-center text-center space-y-4 bg-[#141519]/40 border border-white/5">
                    <Bookmark size={32} className="text-white/10" />
                    <div className="space-y-1">
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">List Empty</h3>
                        <p className="text-[10px] font-medium text-white/20">Add some anime to your watchlist</p>
                    </div>
                </div>
            ) : filteredList.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">No items in this category</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
                    <AnimatePresence mode="popLayout">
                        {filteredList.map((item) => (
                            <motion.div
                                key={item.animeId}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group flex flex-col"
                            >
                                {/* Poster Area */}
                                <div className="relative aspect-[16/23] rounded-[4px] overflow-hidden bg-[#1a1b20] border border-white/5 mb-2.5">
                                    <Link href={`/watch/${item.animeId}`} className="block w-full h-full">
                                        <img
                                            src={item.animeImage || "/placeholder.png"}
                                            alt={item.animeTitle}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                        />

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60" />

                                        {/* Top Icons */}
                                        <div className="absolute top-1.5 right-1.5 flex flex-col gap-1">
                                            <button className="p-1 rounded-[3px] bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all">
                                                <MoreVertical size={12} />
                                            </button>
                                        </div>

                                        {/* Status Badge (if any) */}
                                        <div className="absolute top-1.5 left-1.5">
                                            <div className="px-1 py-0.5 rounded-[2px] bg-[#FFB800] text-[8px] font-black text-black uppercase">18+</div>
                                        </div>

                                        {/* Removal Option (Overlay) */}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleRemove(item.animeId);
                                            }}
                                            className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        >
                                            <div className="p-2 rounded-full bg-red-500/20 border border-red-500/50 text-red-500">
                                                <Trash2 size={16} />
                                            </div>
                                        </button>

                                        {/* Bottom Labels (Mini version from image) */}
                                        <div className="absolute bottom-2 left-1.5 flex items-center gap-1 scale-[0.85] origin-left">
                                            <div className="flex items-center gap-0.5 bg-black/70 px-1 rounded-[2px] border border-white/10">
                                                <Subtitles size={9} className="text-primary" />
                                                <span className="text-[9px] font-bold text-white uppercase">12</span>
                                            </div>
                                            <div className="flex items-center gap-0.5 bg-black/70 px-1 rounded-[2px] border border-white/10">
                                                <Mic size={9} className="text-primary" />
                                                <span className="text-[9px] font-bold text-white uppercase">12</span>
                                            </div>
                                            <div className="flex items-center gap-0.5 bg-black/70 px-1 rounded-[2px] border border-white/10">
                                                <span className="text-[9px] font-bold text-white uppercase">24</span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>

                                {/* Title & Stats (Much smaller text) */}
                                <div className="space-y-0.5">
                                    <Link href={`/watch/${item.animeId}`}>
                                        <h3 className="text-[12px] font-bold text-white leading-[1.3] group-hover:text-primary transition-colors line-clamp-1">
                                            {item.animeTitle}
                                        </h3>
                                    </Link>
                                    <div className="flex items-center gap-1.5 text-[9px] font-medium text-white/30 uppercase tracking-tighter">
                                        <span>TV</span>
                                        <span className="w-0.5 h-0.5 rounded-full bg-white/20" />
                                        <span>24m</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Pagination Mockup (Matches image style) */}
            {watchlist.length > 0 && (
                <div className="flex items-center justify-center gap-1.5 pt-8">
                    <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white/40 hover:text-white transition-colors">
                        <ChevronLeft size={16} />
                    </button>
                    <button className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-white text-[11px] font-black">1</button>
                    <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white/40 hover:text-white text-[11px] font-black">2</button>
                    <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white/40 hover:text-white text-[11px] font-black">3</button>
                    <div className="w-8 h-8 flex items-center justify-center text-white/20 text-[10px]">...</div>
                    <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white/40 hover:text-white transition-colors">
                        <ChevronRight size={16} />
                    </button>
                    <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white/40 hover:text-white transition-colors">
                        <ChevronRight size={16} className="-ml-2" />
                    </button>
                </div>
            )}
        </div>
    );
}
