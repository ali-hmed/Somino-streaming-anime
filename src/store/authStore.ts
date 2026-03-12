import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
    banner?: string;
    role?: 'user' | 'moderator' | 'admin' | 'owner';
    level?: number;
    power?: number;
    rank?: string;
    watchlist?: any[];
    watchHistory?: any[];
    createdAt?: string;
    token: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isAuthModalOpen: boolean;
    login: (user: User) => void;
    logout: () => void;
    setWatchlist: (watchlist: any[]) => void;
    setWatchHistory: (watchHistory: any[]) => void;
    setAuthModalOpen: (isOpen: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isAuthModalOpen: false,
            login: (user) => set({ user, isAuthenticated: true }),
            logout: () => set({ user: null, isAuthenticated: false }),
            setWatchlist: (watchlist) => set((state) => ({ user: state.user ? { ...state.user, watchlist } : null })),
            setWatchHistory: (watchHistory) => set((state) => ({ user: state.user ? { ...state.user, watchHistory } : null })),
            setAuthModalOpen: (isAuthModalOpen) => set({ isAuthModalOpen }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
