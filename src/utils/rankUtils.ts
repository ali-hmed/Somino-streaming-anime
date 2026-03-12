/**
 * Rank system utility — maps a rank name or XP value to its custom PNG icon path.
 * Icons are stored in /public.
 */

export interface Rank {
    name: string;
    minXP: number;
    maxXP: number;
    icon: string;
    color: string;
}

export const RANKS: Rank[] = [
    { name: 'The Casual',    minXP: 10001,  maxXP: 45000,  icon: '/The_Casual1.png',        color: '#ffffff' },
    { name: 'The Seeker',    minXP: 45001,  maxXP: 100000, icon: '/The_seeker2.png',        color: '#00e5ff' },
    { name: 'The Otaku',     minXP: 100001, maxXP: 175000, icon: '/The_otaku-3.png',        color: '#00e676' },
    { name: 'The Enthusiast',minXP: 175001, maxXP: 252609, icon: '/The_Enthusiast-4.png',   color: '#bb86fc' },
    { name: 'The Historian', minXP: 252610, maxXP: 1000000, icon: '/The_Histraions-5.png', color: '#ffb300' },
];

/** Returns the full Rank object by name (case-insensitive). */
export function getRankByName(rankName?: string): Rank | null {
    if (!rankName) return null;
    return RANKS.find(r => r.name.toLowerCase() === rankName.toLowerCase()) || null;
}

/** Returns the full Rank object by XP. */
export function getRankByXP(xp: number): Rank | null {
    let matched: Rank | null = null;
    for (const rank of RANKS) {
        if (xp >= rank.minXP) matched = rank;
    }
    return matched;
}

/** Returns the PNG icon path for a given rank name (case-insensitive). */
export function getRankIconByName(rankName?: string): string | null {
    return getRankByName(rankName)?.icon ?? null;
}

/** Returns the PNG icon path for a given XP value. */
export function getRankIconByXP(xp: number): string | null {
    return getRankByXP(xp)?.icon ?? null;
}
