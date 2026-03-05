"use client";

import React, { useEffect, useState } from 'react';
import { RotateCcw, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import AnimeCard from './AnimeCard';
import { getWatchHistory, WatchHistoryItem } from '@/lib/watchHistory';
import { useAuthStore } from '@/store/authStore';

const ContinueWatching = () => {
    const { user, isAuthenticated } = useAuthStore();
    const [localHistory, setLocalHistory] = useState<WatchHistoryItem[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setLocalHistory(getWatchHistory());
    }, []);

    // When logged in → show only cloud history. When guest → show local storage.
    const history: WatchHistoryItem[] = isAuthenticated
        ? (user?.watchHistory || [])
        : localHistory;

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
                    <div key={`cw-wrapper-${item.animeId}-${i}`} className="min-w-[160px] md:min-w-[190px] w-[160px] md:w-[190px]">
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
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ContinueWatching;
