"use client";

import React, { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { getAnimeProgress } from '@/lib/watchHistory';

interface WatchNowButtonProps {
    animeId: string;
    firstEpisodeId: string;
}

const WatchNowButton: React.FC<WatchNowButtonProps> = ({ animeId, firstEpisodeId }) => {
    const { user, isAuthenticated } = useAuthStore();
    const [targetEpisodeId, setTargetEpisodeId] = useState(firstEpisodeId);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Find last episode in cloud history if logged in, or local history if guest
        const lastEpisodeId = (() => {
            if (isAuthenticated && user?.watchHistory) {
                const remote = user.watchHistory.find(i => i.animeId === animeId);
                if (remote) return remote.episodeId;
            }
            const local = getAnimeProgress(animeId);
            if (local) return local.episodeId;
            return firstEpisodeId;
        })();

        if (lastEpisodeId) {
            setTargetEpisodeId(lastEpisodeId);
        }
        setIsLoaded(true);
    }, [animeId, firstEpisodeId, isAuthenticated, user?.watchHistory]);

    // Don't render until we know the target episode to avoid jumping
    if (!isLoaded) {
        return (
            <div className="flex items-center gap-2 bg-primary/20 text-white/40 px-6 py-2.5 rounded-full font-black text-sm animate-pulse">
                <Play size={10} className="fill-current" />
                Loading...
            </div>
        );
    }

    return (
        <Link
            href={`/watch/${animeId}/${targetEpisodeId}`}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-full font-black text-sm transition-all hover:scale-105 active:scale-95 shadow-[0_4px_15px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_6px_20px_rgba(var(--primary-rgb),0.4)]"
        >
            <Play size={10} className="fill-current" />
            {targetEpisodeId !== firstEpisodeId ? 'Resume Watching' : 'Watch Now'}
        </Link>
    );
};

export default WatchNowButton;
