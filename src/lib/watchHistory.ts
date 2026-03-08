"use client";

export interface WatchHistoryItem {
    animeId: string;
    animeTitle: string;
    animeImage: string;
    episodeId: string;
    episodeNumber: number;
    currentTime: number; // in seconds
    duration: number; // in seconds
    lastWatched: number; // timestamp
}

const STORAGE_KEY = 'somino_watch_history';

export const saveWatchProgress = async (item: Omit<WatchHistoryItem, 'lastWatched'>, token?: string) => {
    if (typeof window === 'undefined') return;

    try {
        const history = getWatchHistory();
        const existingIndex = history.findIndex(i => i.animeId === item.animeId);

        // Throttle saves: only save if it's a new episode or if more than 1 second has passed
        // or if it's a large jump (skip/seek)
        if (existingIndex !== -1) {
            const existing = history[existingIndex];
            const isDifferentEpisode = existing.episodeId !== item.episodeId;
            const timeDiff = Math.abs(existing.currentTime - item.currentTime);

            // If same episode and less than 3s difference, skip to save performance
            // We use 3s here because backend sync doesn't need to be extremely frequent
            if (!isDifferentEpisode && timeDiff < 3) return;
        }

        const newItem: WatchHistoryItem = {
            ...item,
            lastWatched: Date.now()
        };

        if (existingIndex !== -1) {
            // Remove old entry and add new one to top
            history.splice(existingIndex, 1);
        }

        history.unshift(newItem);

        // Limit to top 20 items
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 20)));

        // Sync to backend if token is provided
        if (token) {
            const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030') + '/api/v1';
            const res = await fetch(`${BASE_URL}/auth/history`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(item)
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) return data.data;
            }
        }

        return history;
    } catch (error) {
        // Silently fail to avoid console clutter on storage full
        return [];
    }
};

export const getWatchHistory = (): WatchHistoryItem[] => {
    if (typeof window === 'undefined') return [];
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        return [];
    }
};

export const getAnimeProgress = (animeId: string): WatchHistoryItem | undefined => {
    const history = getWatchHistory();
    return history.find(item => item.animeId === animeId);
};

export const clearWatchHistory = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
};

// Sync logic placeholder
export const syncHistoryToAccount = async (token: string) => {
    const localHistory = getWatchHistory();
    if (localHistory.length === 0) return;

    // TODO: Call API to sync
    // await fetch('/api/v1/sync', { ... })

    // clearWatchHistory();
};
