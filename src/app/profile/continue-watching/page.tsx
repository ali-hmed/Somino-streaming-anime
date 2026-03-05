"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Play, X, Clock, Mic, MessageSquare } from "lucide-react";
import { getWatchHistory, WatchHistoryItem } from "@/lib/watchHistory";
import { useAuthStore } from "@/store/authStore";

export default function ContinueWatchingPage() {
    const { user, setWatchHistory, isAuthenticated } = useAuthStore();
    const [localHistory, setLocalHistory] = useState<WatchHistoryItem[]>([]);

    useEffect(() => {
        setLocalHistory(getWatchHistory());
    }, []);

    const history = isAuthenticated
        ? (user?.watchHistory || [])
        : localHistory;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleRemove = async (e: React.MouseEvent, animeId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user?.token) {
            // Remove from local storage
            const updatedLocal = localHistory.filter(i => i.animeId !== animeId);
            setLocalHistory(updatedLocal);
            localStorage.setItem('somino_watch_history', JSON.stringify(updatedLocal));
            return;
        }

        const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://somino-backend.vercel.app') + '/api/v1';

        try {
            const res = await fetch(`${BASE_URL}/auth/history/${animeId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setWatchHistory(data.data);
                }
            }
        } catch (error) {
            console.error("Error removing from history:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Clock size={20} strokeWidth={2.5} />
                </div>
                <h2 className="text-[20px] font-black tracking-tight text-white/90">Continue Watching</h2>
            </div>

            {history.length === 0 ? (
                <div className="rounded-3xl p-20 flex flex-col items-center justify-center text-center space-y-5"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                        <Clock size={32} className="text-white/10" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-white font-bold text-lg">No history found</h3>
                        <p className="text-[13px] max-w-[240px]" style={{ color: "var(--text-muted)" }}>
                            Animes you start watching will automatically appear here.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8">
                    {history.map((item) => {
                        const progress = (item.currentTime / (item.duration || 1440)) * 100;

                        return (
                            <Link
                                key={item.animeId}
                                href={`/watch/${item.animeId}/${item.episodeId}`}
                                className="group relative flex flex-col items-start gap-4 transition-all"
                            >
                                {/* Thumbnail Container */}
                                <div className="relative aspect-[3/4.2] w-full rounded-2xl overflow-hidden shadow-2xl bg-white/5 border border-white/5">
                                    <img
                                        src={item.animeImage}
                                        alt={item.animeTitle}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />

                                    {/* Badges */}
                                    <div className="absolute top-2 left-2 flex flex-col gap-1.5 pointer-events-none">
                                        <div className="px-2 py-0.5 rounded-md bg-[#FF6331] text-[9px] font-black text-white shadow-xl">
                                            18+
                                        </div>
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => handleRemove(e, item.animeId)}
                                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/60 hover:text-white hover:bg-red-500 transition-all z-10 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
                                    >
                                        <X size={14} strokeWidth={3} />
                                    </button>

                                    {/* Hover Play Icon */}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-[#0f1012] shadow-2xl scale-50 group-hover:scale-100 transition-transform">
                                            <Play size={20} fill="currentColor" className="ml-0.5" />
                                        </div>
                                    </div>

                                    {/* Bottom Meta Badges */}
                                    <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-[#53CCB8]/20 backdrop-blur-md border border-[#53CCB8]/20 text-[#53CCB8] text-[8.5px] font-black">
                                            <MessageSquare size={10} fill="currentColor" /> 12
                                        </div>
                                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-[#53CCB8]/20 backdrop-blur-md border border-[#53CCB8]/20 text-[#53CCB8] text-[8.5px] font-black">
                                            <Mic size={10} fill="currentColor" /> 12
                                        </div>
                                        <div className="flex items-center px-1.5 py-0.5 rounded-[4px] bg-white/10 backdrop-blur-md border border-white/10 text-white/90 text-[8.5px] font-black">
                                            12
                                        </div>
                                    </div>

                                    {/* Progress Bar (at bottom of image) */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
                                        <div
                                            className="h-full bg-primary shadow-[0_0_10px_var(--primary-alpha)]"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Info section */}
                                <div className="w-full space-y-1 px-1">
                                    <h3 className="text-[13px] font-black text-white leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                        {item.animeTitle}
                                    </h3>

                                    <div className="flex items-center justify-between text-[10px] font-bold">
                                        <span className="uppercase tracking-widest text-white/30">
                                            Ep {item.episodeNumber}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-primary">{formatTime(item.currentTime)}</span>
                                            <span className="text-white/10 mx-0.5">/</span>
                                            <span className="text-white/30">{formatTime(item.duration || 1440)}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
