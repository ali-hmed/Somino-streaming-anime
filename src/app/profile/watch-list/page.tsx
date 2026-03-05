"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Bookmark, ListFilter, Trash2 } from "lucide-react";
import Link from "next/link";

type WatchlistStatus = 'All' | 'Watching' | 'Completed' | 'Planned' | 'Dropped';

export default function WatchListPage() {
    const { user, setWatchlist } = useAuthStore();
    const [activeTab, setActiveTab] = useState<WatchlistStatus>('All');

    const watchlist = user?.watchlist || [];
    const filteredList = activeTab === 'All'
        ? watchlist
        : watchlist.filter(item => item.status === activeTab);

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

    const tabs: WatchlistStatus[] = ['All', 'Watching', 'Completed', 'Planned', 'Dropped'];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-5 rounded-full" style={{ background: "var(--primary)" }} />
                    <h2 className="text-[17px] font-bold text-white">My Watchlist</h2>
                </div>

                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${activeTab === tab ? 'bg-primary text-[#0f1012]' : 'text-white/40 hover:text-white/60'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {!watchlist || watchlist.length === 0 ? (
                <div className="rounded-2xl p-20 flex flex-col items-center justify-center text-center space-y-4"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div className="p-4 rounded-full bg-white/5">
                        <Bookmark size={32} className="text-white/20" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold">Your watchlist is empty</h3>
                        <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                            Find your favorite animes and add them to your list.
                        </p>
                    </div>
                </div>
            ) : filteredList.length === 0 ? (
                <div className="rounded-2xl p-20 flex flex-col items-center justify-center text-center space-y-4"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                        No animes found with status "{activeTab}"
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredList.map((item) => (
                        <div key={item.animeId} className="group relative flex flex-col bg-white/5 rounded-xl border border-white/5 transition-all hover:border-primary/20 overflow-hidden shadow-lg">
                            <Link href={`/watch/${item.animeId}`} className="relative aspect-[3/4] overflow-hidden block">
                                <img src={item.animeImage || "/placeholder.png"} alt={item.animeTitle} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-black text-white/90 uppercase tracking-widest border border-white/10">
                                    {item.status || 'Planned'}
                                </div>
                            </Link>

                            <div className="p-3">
                                <Link href={`/watch/${item.animeId}`}>
                                    <h3 className="text-[12px] font-bold text-white line-clamp-2 min-h-[32px] group-hover:text-primary transition-colors cursor-pointer">
                                        {item.animeTitle}
                                    </h3>
                                </Link>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">TV</span>
                                    <button
                                        onClick={() => handleRemove(item.animeId)}
                                        className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/20 hover:text-red-500 transition-all"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
