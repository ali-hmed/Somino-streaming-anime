"use client";

export interface UserSettings {
    autoNext: boolean;
    autoPlay: boolean;
    lastServer: 'megaPlay' | 'vidWish';
    preferredCategory: 'sub' | 'dub';
}

const STORAGE_KEY = 'somino_user_settings';

const DEFAULT_SETTINGS: UserSettings = {
    autoNext: false, // Default is OFF
    autoPlay: true,  // Auto play usually ON by default in streaming
    lastServer: 'megaPlay',
    preferredCategory: 'sub',
};

export const getUserSettings = (): UserSettings => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return DEFAULT_SETTINGS;
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (error) {
        return DEFAULT_SETTINGS;
    }
};

export const saveUserSettings = (settings: Partial<UserSettings>) => {
    if (typeof window === 'undefined') return;
    try {
        const current = getUserSettings();
        const updated = { ...current, ...settings };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
        // Silently fail
    }
};
