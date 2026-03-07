"use client";

import React, { useEffect, useState } from 'react';
import { RotateCcw, ChevronRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AnimeCard from './AnimeCard';
import { getWatchHistory, WatchHistoryItem } from '@/lib/watchHistory';
import { useAuthStore } from '@/store/authStore';

const ContinueWatching = () => {
    const { user, isAuthenticated, setWatchHistory } = useAuthStore();
    const [localHistory, setLocalHistory] = useState<WatchHistoryItem[]>([]);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        setLocalHistory(getWatchHistory());
    }, []);

    // When logged in → show only cloud history. When guest → show local storage.
    const history: WatchHistoryItem[] = isAuthenticated
        ? (user?.watchHistory || [])
        : localHistory;

    const handleRemove = async (e: React.MouseEvent, animeId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated || !user?.token) {
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

    if (!mounted || history.length === 0) return null;

    return (
        <section className="relative mt-12 mb-16 px-4 md:px-0">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                    <RotateCcw className="text-[#FF6E9F]" size={20} />
                    <h2 className="text-lg md:text-xl font-black text-white tracking-tight lowercase">
                        continue watching
                    </h2>
                </div>
                <Link href="/profile/continue-watching" className="flex items-center gap-1 text-[10px] font-bold text-white/30 hover:text-[#FF6E9F] transition-colors tracking-widest lowercase">
                    view more <ChevronRight size={12} />
                </Link>
            </div>

            <div className="flex gap-4 md:gap-5 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
                {history.slice(0, 10).map((item, i) => (
                    <div key={`cw-wrapper-${item.animeId}-${i}`} className="min-w-[160px] md:min-w-[190px] w-[160px] md:w-[190px] relative group">
                        <AnimeCard
                            anime={{
                                id: item.animeId,
                                episodeId: item.episodeId,
                                title: item.animeTitle.toLowerCase(),
                                image: item.animeImage,
                                episodeNumber: item.episodeNumber,
                                currentTime: item.currentTime,
                                duration: item.duration || 1440
                            }}
                            variant="continue"
                        />

                        {/* Remove Button */}
                        <button
                            onClick={(e) => handleRemove(e, item.animeId)}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/40 hover:text-white hover:bg-red-500 transition-all z-20 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 shadow-xl"
                            title="Remove from history"
                        >
                            <X size={12} strokeWidth={3} />
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ContinueWatching;
