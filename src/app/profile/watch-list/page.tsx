"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Bookmark, ListFilter, Trash2, Heart, MoreVertical, Subtitles, Mic, Play, Clock } from "lucide-react";
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

    // Map existing statuses to the new tab names if necessary
    const mapStatus = (status: string): WatchlistStatus => {
        if (status === 'Planned') return 'Plan to Watch';
        return status as WatchlistStatus;
    };

    const filteredList = activeTab === 'All'
        ? watchlist
        : watchlist.filter(item => mapStatus(item.status) === activeTab);

    const handleRemove = async (animeId: string) => {
        if (!user?.token) return;

        const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://somino-backend.vercel.app') + '/api/v1';

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
        <div className="space-y-10 pb-10">
            {/* Header with Title and Public Toggle */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <Heart size={32} className="text-white fill-white" />
                    <h2 className="text-2xl font-black text-white tracking-tight">Watch List</h2>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Public</span>
                    <button
                        onClick={() => setIsPublic(!isPublic)}
                        className={`relative w-11 h-5 rounded-md transition-colors ${isPublic ? 'bg-[#FF6E9F]' : 'bg-white/10'}`}
                    >
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-[4px] bg-white transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-0'}`} />
                        <span className="absolute right-1 text-[8px] font-black text-white/40 uppercase leading-5">OFF</span>
                        <span className="absolute left-1.5 text-[8px] font-black text-white uppercase leading-5">ON</span>
                    </button>
                    <div className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase text-white ${isPublic ? 'bg-[#FF6E9F]' : 'bg-white/10'}`}>
                        {isPublic ? 'ON' : 'OFF'}
                    </div>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2 rounded-[6px] text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap ${activeTab === tab
                                ? 'bg-primary text-white shadow-[0_0_15px_rgba(83,204,184,0.3)]'
                                : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Grid Content */}
            {!watchlist || watchlist.length === 0 ? (
                <div className="rounded-3xl p-24 flex flex-col items-center justify-center text-center space-y-6 bg-[#141519]/40 border border-white/5 backdrop-blur-md">
                    <div className="p-6 rounded-full bg-white/[0.02] border border-white/5">
                        <Bookmark size={40} className="text-white/5" />
                    </div>
                    <div>
                        <h3 className="text-white font-black uppercase tracking-widest text-sm">List is empty</h3>
                        <p className="text-[12px] font-medium mt-1 text-white/20">
                            Find something awesome to watch!
                        </p>
                    </div>
                </div>
            ) : filteredList.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                    <p className="text-sm font-black text-white/20 uppercase tracking-[0.2em]">No titles found</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-x-5 gap-y-10">
                    <AnimatePresence mode="popLayout">
                        {filteredList.map((item) => (
                            <motion.div
                                key={item.animeId}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group flex flex-col"
                            >
                                {/* Anime Poster Card */}
                                <div className="relative aspect-[3/4.2] rounded-[10px] overflow-hidden bg-[#1a1b20] shadow-2xl mb-4 border border-white/5">
                                    <Link href={`/watch/${item.animeId}`} className="block w-full h-full">
                                        <img
                                            src={item.animeImage || "/placeholder.png"}
                                            alt={item.animeTitle}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />

                                        {/* Overlay Gradients */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-60 group-hover:opacity-80 transition-opacity" />

                                        {/* Top Icons */}
                                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                                            {/* Could add 18+ badge here if data existed */}
                                        </div>

                                        {/* More Button */}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleRemove(item.animeId);
                                            }}
                                            className="absolute top-2 right-2 p-1.5 rounded-md bg-white/10 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/80"
                                            title="Remove from list"
                                        >
                                            <Trash2 size={14} />
                                        </button>

                                        {/* Bottom Stats Badges */}
                                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                                            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-[4px] border border-white/10">
                                                <Subtitles size={10} className="text-[#53CCB8]" />
                                                <span className="text-[10px] font-black text-white/90">12</span>
                                            </div>
                                            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-[4px] border border-white/10">
                                                <Mic size={10} className="text-[#53CCB8]" />
                                                <span className="text-[10px] font-black text-white/90">12</span>
                                            </div>
                                            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-[4px] border border-white/10">
                                                <span className="text-[10px] font-black text-white/90">24</span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>

                                {/* Title & Meta */}
                                <div className="space-y-1">
                                    <Link href={`/watch/${item.animeId}`}>
                                        <h3 className="text-[14px] font-black text-white leading-[1.3] group-hover:text-primary transition-colors line-clamp-1">
                                            {item.animeTitle}
                                        </h3>
                                    </Link>
                                    <div className="flex items-center gap-2 text-[11px] font-bold text-white/20 uppercase tracking-tighter">
                                        <span>TV</span>
                                        <span className="w-1 h-1 rounded-full bg-white/10" />
                                        <span>24m</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
