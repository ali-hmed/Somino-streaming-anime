"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Play, X, Clock, Mic, MessageSquare } from "lucide-react";
import { getWatchHistory, WatchHistoryItem } from "@/lib/watchHistory";
import { useAuthStore } from "@/store/authStore";
import AnimeCard from "@/components/AnimeCard";

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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-y-8">
                    {history.map((item, i) => {
                        return (
                            <div key={`cw-page-${item.animeId}-${i}`} className="relative group">
                                <AnimeCard
                                    anime={{
                                        id: item.animeId,
                                        episodeId: item.episodeId,
                                        title: item.animeTitle,
                                        image: item.animeImage,
                                        episodeNumber: item.episodeNumber,
                                        currentTime: item.currentTime,
                                        duration: item.duration || 1440
                                    }}
                                    variant="continue"
                                />

                                {/* Delete Button - Overlayed on top of AnimeCard */}
                                <button
                                    onClick={(e) => handleRemove(e, item.animeId)}
                                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/60 hover:text-white hover:bg-red-500 transition-all z-20 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 shadow-xl"
                                    title="Remove from history"
                                >
                                    <X size={14} strokeWidth={3} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
