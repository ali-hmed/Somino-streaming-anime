"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { Heart, Bookmark, ChevronLeft, ChevronRight, MoreVertical, Check, Subtitles, Mic } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type WatchlistStatus = 'All' | 'Watching' | 'On-Hold' | 'Plan to Watch' | 'Dropped' | 'Completed';
const STATUS_OPTIONS: Exclude<WatchlistStatus, 'All'>[] = ['Watching', 'On-Hold', 'Plan to Watch', 'Dropped', 'Completed'];
const ITEMS_PER_PAGE = 30;

// ── Inline watchlist card matching the reference image exactly ──────────────
function WatchlistCard({
    item,
    onRemove,
    onStatusChange,
}: {
    item: { animeId: string; animeTitle: string; animeImage?: string; status: string };
    onRemove: (id: string) => void;
    onStatusChange: (id: string, status: Exclude<WatchlistStatus, 'All'>) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const currentStatus = item.status as Exclude<WatchlistStatus, 'All'>;

    // Close menu on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="group flex flex-col">
            {/* Poster */}
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[#1a1a1e] border border-white/5 shadow-lg mb-3">
                <Link href={`/watch/${item.animeId}`} className="block w-full h-full">
                    {item.animeImage ? (
                        <img
                            src={item.animeImage}
                            alt={item.animeTitle}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1a1a1e] to-[#252529]" />
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                {/* Three-dot menu button — always visible, top-right */}
                <div ref={ref} className="absolute top-2 right-2 z-30">
                    <button
                        onClick={() => setOpen(o => !o)}
                        className="w-7 h-7 rounded-md bg-white/90 backdrop-blur flex items-center justify-center text-black shadow hover:bg-white transition-colors"
                    >
                        <MoreVertical size={14} />
                    </button>

                    {/* Dropdown */}
                    <AnimatePresence>
                        {open && (
                            <motion.div
                                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                                transition={{ duration: 0.15 }}
                                className="absolute top-full right-0 mt-1 w-44 bg-white rounded-xl shadow-2xl overflow-hidden z-50 py-1"
                            >
                                {STATUS_OPTIONS.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => { onStatusChange(item.animeId, s); setOpen(false); }}
                                        className="w-full flex items-center justify-between px-4 py-2.5 text-[13px] text-gray-800 hover:bg-gray-100 transition-colors font-medium"
                                    >
                                        <span className={currentStatus === s ? 'font-black text-black' : ''}>{s}</span>
                                        {currentStatus === s && <Check size={14} className="text-black" strokeWidth={3} />}
                                    </button>
                                ))}
                                <div className="h-px bg-gray-200 mx-2 my-1" />
                                <button
                                    onClick={() => { onRemove(item.animeId); setOpen(false); }}
                                    className="w-full flex items-center px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors font-bold"
                                >
                                    Remove
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bottom episode badges — CC / Mic / total */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1 z-10 pointer-events-none">
                    <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-[3px] bg-[#FF6E9F]/90 backdrop-blur text-white text-[9px] font-black">
                        <Subtitles size={9} />
                        <span>13</span>
                    </div>
                    <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-[3px] bg-[#53CCB8]/90 backdrop-blur text-white text-[9px] font-black">
                        <Mic size={9} />
                        <span>13</span>
                    </div>
                    <div className="px-1.5 py-0.5 rounded-[3px] bg-black/70 backdrop-blur text-white/80 text-[9px] font-black">
                        13
                    </div>
                </div>
            </div>

            {/* Title + meta */}
            <div className="space-y-0.5 px-0.5">
                <Link href={`/watch/${item.animeId}`}>
                    <h3 className="text-[13px] font-bold text-white group-hover:text-[#53CCB8] transition-colors line-clamp-1 leading-tight">
                        {item.animeTitle}
                    </h3>
                </Link>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/30">
                    <span>TV</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-white/20" />
                    <span>24m</span>
                </div>
            </div>
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
                body: JSON.stringify({
                    animeId: item.animeId,
                    animeTitle: item.animeTitle,
                    animeImage: item.animeImage,
                    status: newStatus
                })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success) setWatchlist(data.data);
            }
        } catch (e) { console.error(e); }
    };

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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
                        <AnimatePresence mode="popLayout">
                            {pagedList.map(item => (
                                <motion.div key={item.animeId} layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}>
                                    <WatchlistCard
                                        item={item}
                                        onRemove={handleRemove}
                                        onStatusChange={handleStatusChange}
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
                                        className={`w-8 h-8 rounded-full text-[11px] font-black ${safePage === p ? 'bg-primary text-white' : 'bg-white/5 text-white/40 hover:text-white'}`}>{p}</button>
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
