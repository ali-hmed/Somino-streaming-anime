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

export const saveWatchProgress = (item: Omit<WatchHistoryItem, 'lastWatched'>) => {
    if (typeof window === 'undefined') return;

    try {
        const history = getWatchHistory();
        const existingIndex = history.findIndex(i => i.animeId === item.animeId);

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
    } catch (error) {
        console.error('Failed to save watch progress:', error);
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
