export interface AnimeInfo {
    id: string;
    title: string | { romaji?: string; english?: string; native?: string; userPreferred?: string };
    image: string;
    cover?: string;
    description: string;
    status: string;
    releaseDate?: string;
    totalEpisodes?: number;
    subEpisodes?: number;
    dubEpisodes?: number;
    genres?: string[];
    rating?: string | number;
    score?: number;
    year?: number;
    members?: number;
    type?: string;
    duration?: string;
    premiered?: string;
    aired?: string;
    studios?: string[];
    producers?: string[];
    synonyms?: string[];
    japaneseTitle?: string;
    trailer?: {
        id: string | null;
        url: string | null;
        embedUrl: string | null;
        imgUrl: string | null;
    };
    broadcast?: {
        day?: string;
        time?: string;
        timezone?: string;
        string?: string;
    };
    episodes: Episode[];
    relations?: {
        relation: string;
        entry: {
            mal_id: number;
            type: string;
            name: string;
            image: string;
            episodes: number;
            subEpisodes: number;
            dubEpisodes: number;
        };
    }[];
    moreSeasons?: any[];
    recommended?: any[];
    mostPopular?: any[];
}

export interface Episode {
    id: string;
    number: number;
    title?: string;
    image?: string;
    description?: string;
    url?: string;
}

export interface SearchResult {
    id: string;
    title: string | { romaji?: string; english?: string; native?: string; userPreferred?: string };
    image: string;
    type?: string;
    rating?: string | number;
    releaseDate?: string;
    availableEpisodes?: number;
    subEpisodes?: number;
    dubEpisodes?: number;
}

export interface RecentAnime {
    id: string;
    title: string | { romaji?: string; english?: string; native?: string; userPreferred?: string };
    image: string;
    episodeNumber: number;
    type?: string;
    availableEpisodes?: number;
    subEpisodes?: number;
    dubEpisodes?: number;
}

export function getTitle(title: any): string {
    if (typeof title === 'string') return title;
    return title?.english || title?.romaji || title?.userPreferred || title?.native || 'Unknown Title';
}
