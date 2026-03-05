import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
    watchlist?: any[];
    watchHistory?: any[];
    createdAt?: string;
    token: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => void;
    setWatchlist: (watchlist: any[]) => void;
    setWatchHistory: (watchHistory: any[]) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            login: (user) => set({ user, isAuthenticated: true }),
            logout: () => set({ user: null, isAuthenticated: false }),
            setWatchlist: (watchlist) => set((state) => ({ user: state.user ? { ...state.user, watchlist } : null })),
            setWatchHistory: (watchHistory) => set((state) => ({ user: state.user ? { ...state.user, watchHistory } : null })),
        }),
        {
            name: 'auth-storage',
        }
    )
);
