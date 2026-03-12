/**
 * Rank system utility — maps a rank name or XP value to its custom PNG icon path.
 * Icons are stored in /public.
 */

export interface Rank {
    name: string;
    minXP: number;
    maxXP: number;
    icon: string;
}

export const RANKS: Rank[] = [
    { name: 'The Casual',    minXP: 10001,  maxXP: 45000,  icon: '/The_Casual1.png'       },
    { name: 'The Seeker',    minXP: 45001,  maxXP: 100000, icon: '/The_seeker2.png'        },
    { name: 'The Otaku',     minXP: 100001, maxXP: 175000, icon: '/The_otaku-3.png'        },
    { name: 'The Enthusiast',minXP: 175001, maxXP: 250000, icon: '/The_Enthusiast-4.png'   },
    { name: 'The Historian', minXP: 250001, maxXP: 1000000, icon: '/The_Histraions-5.png'  },
];

/** Returns the PNG icon path for a given rank name (case-insensitive). */
export function getRankIconByName(rankName?: string): string | null {
    if (!rankName) return null;
    const match = RANKS.find(r => r.name.toLowerCase() === rankName.toLowerCase());
    return match?.icon ?? null;
}

/** Returns the PNG icon path for a given XP value. */
export function getRankIconByXP(xp: number): string | null {
    let matched: Rank | null = null;
    for (const rank of RANKS) {
        if (xp >= rank.minXP) matched = rank;
    }
    return matched ? matched.icon : null;
}
