import { AnimeInfo, SearchResult, RecentAnime } from '@/types/anime';

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030') + '/api/v1';

export const mapCustomToAnime = (item: any): any => ({
    ...item,
    id: item.id?.toString(),
    title: {
        english: item.title,
        romaji: item.alternativeTitle || item.title,
        native: item.japanese || '',
    },
    image: item.poster,
    cover: item.poster,
    isAdult: !!item.isAdult,
    description: item.synopsis || '',
    status: item.status || 'Unknown',
    releaseDate: item.releaseDate || (typeof item.aired === 'string' ? item.aired : item.aired?.from) || '',
    totalEpisodes: (() => {
        const eps = parseInt(item.episodes?.eps || item.episodes?.sub || item.episodes?.dub || '0');
        return isNaN(eps) ? 0 : eps;
    })(),
    subEpisodes: (() => {
        const sub = parseInt(item.episodes?.sub || '0');
        return isNaN(sub) ? 0 : sub;
    })(),
    dubEpisodes: (() => {
        const dub = parseInt(item.episodes?.dub || '0');
        return isNaN(dub) ? 0 : dub;
    })(),
    genres: Array.isArray(item.genres) ? item.genres : (item.genres ? [item.genres] : []),
    rating: item.rating,
    score: (() => {
        const s = parseFloat(item.MAL_score);
        return isNaN(s) ? undefined : s;
    })(),
    type: item.type || 'TV',
    year: (() => {
        if (item.year) return item.year;
        const dateStr = (typeof item.aired === 'string' ? item.aired : item.aired?.from) || item.releaseDate || '';
        const match = dateStr.match(/\b(19|20)\d{2}\b/);
        if (match) return parseInt(match[0]);
        return undefined;
    })(),
    duration: item.duration,
    premiered: item.premiered,
    studios: Array.isArray(item.studios) ? item.studios : (item.studios ? [item.studios] : []),
    producers: Array.isArray(item.producers) ? item.producers : (item.producers ? [item.producers] : []),
    japaneseTitle: item.japanese,
    synonyms: Array.isArray(item.synonyms) ? item.synonyms : (item.synonyms ? String(item.synonyms).split(',') : []),
});

export const fetchAnimeInfo = async (id: string): Promise<AnimeInfo | null> => {
    try {
        if (!id || id === 'undefined') {
            console.error('fetchAnimeInfo: Invalid ID passed');
            return null;
        }

        const res = await fetch(`${BASE_URL}/anime/${id}`);

        if (!res.ok) {
            console.error(`fetchAnimeInfo Error [${res.status}] for ID: ${id}. URL: ${BASE_URL}/anime/${id}`);
            return null;
        }

        const json = await res.json();
        const anime = json.data;
        if (!anime) return null;

        // Fetch episodes
        let episodes: any[] = [];
        try {
            const epRes = await fetch(`${BASE_URL}/episodes/${id}`);
            const epJson = await epRes.json();
            if (epJson.success) {
                episodes = epJson.data.map((ep: any) => ({
                    id: ep.id,
                    number: ep.episodeNumber,
                    title: ep.title,
                    isFiller: ep.isFiller,
                    url: ''
                }));
            }
        } catch (err) {
            console.warn(`Could not fetch episodes for ${id}.`);
        }

        const relations = anime.related?.map((rel: any) => ({
            relation: rel.relation || 'Related',
            entry: {
                mal_id: rel.id,
                type: rel.type,
                name: rel.title,
                image: rel.poster,
                episodes: rel.episodes?.eps,
                subEpisodes: parseInt(rel.episodes?.sub || '0'),
                dubEpisodes: parseInt(rel.episodes?.dub || '0'),
            }
        })) || [];

        return {
            ...mapCustomToAnime(anime),
            relations,
            moreSeasons: (anime.moreSeasons || []).map(mapCustomToAnime),
            recommended: (anime.recommended || []).map(mapCustomToAnime),
            mostPopular: (anime.mostPopular || []).map(mapCustomToAnime),
            episodes: episodes.length > 0 ? episodes : Array.from({ length: anime.episodes?.eps || Number(anime.episodes?.sub) || 12 }, (_, i) => ({
                id: `${id}::ep=${i + 1}`,
                number: i + 1,
                title: `Episode ${i + 1}`
            }))
        };
    } catch (error) {
        console.error('Info Error:', error);
        return null;
    }
};

export const fetchAnimeEpisodes = async (id: string | number) => {
    try {
        const res = await fetch(`${BASE_URL}/episodes/${id}`);
        const json = await res.json();
        return json.success ? json : { success: true, data: [] };
    } catch (err) {
        return { success: false, data: [] };
    }
};

export const fetchEpisodeDetails = async (id: string | number, episode: string | number) => {
    return { data: null };
};

export const fetchAnimeVideos = async (id: string | number) => {
    return { data: [] };
};

export const fetchSchedule = async (date?: string): Promise<any[]> => {
    try {
        const url = date ? `${BASE_URL}/schadule?date=${date}` : `${BASE_URL}/schadule`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('schedule failed');
        const json = await res.json();
        return (json.data?.response || []).map(mapCustomToAnime);
    } catch (err) {
        return [];
    }
};

export const fetchUpcomingAnime = async (page: number = 1): Promise<{ data: any[], pagination: any }> => {
    try {
        const res = await fetch(`${BASE_URL}/animes/top-upcoming?page=${page}`);
        const json = await res.json();
        return {
            data: (json.data?.response || []).map((item: any) => ({
                ...mapCustomToAnime(item),
                availableEpisodes: item.episodes?.eps || 0
            })),
            pagination: {
                has_next_page: json.data?.pageInfo?.hasNextPage,
                last_visible_page: json.data?.pageInfo?.totalPages || json.data?.pageInfo?.lastPage || (json.data?.pageInfo?.hasNextPage ? page + 1 : page),
                items: { total: json.data?.pageInfo?.totalItems || json.data?.pageInfo?.total || 0 }
            }
        };
    } catch (err) {
        return { data: [], pagination: {} };
    }
};

export const fetchRecentUpdates = async (page: number = 1): Promise<RecentAnime[]> => {
    try {
        const res = await fetch(`${BASE_URL}/animes/recently-updated?page=${page}`);
        const json = await res.json();
        return (json.data?.response || []).map((item: any) => ({
            ...mapCustomToAnime(item),
            episodeNumber: item.episodes?.eps || 0,
            availableEpisodes: item.episodes?.eps || 0
        }));
    } catch (error) {
        return [];
    }
};

export const searchAnime = async (query: string, page: number = 1): Promise<{ data: any[], pagination: any }> => {
    try {
        const res = await fetch(`${BASE_URL}/search?keyword=${encodeURIComponent(query)}&page=${page}`);
        const json = await res.json();
        return {
            data: (json.data?.response || []).map((item: any) => ({
                ...mapCustomToAnime(item),
                availableEpisodes: item.episodes?.eps || 0
            })),
            pagination: {
                has_next_page: json.data?.pageInfo?.hasNextPage,
                last_visible_page: json.data?.pageInfo?.totalPages || json.data?.pageInfo?.lastPage || (json.data?.pageInfo?.hasNextPage ? page + 1 : page),
                totalItems: json.data?.pageInfo?.totalItems || json.data?.pageInfo?.total || 0,
                items: { total: json.data?.pageInfo?.totalItems || json.data?.pageInfo?.total || 0 }
            }
        };
    } catch (error) {
        return { data: [], pagination: {} };
    }
};

export const fetchTopAnime = async (page: number = 1): Promise<any[]> => {
    try {
        const res = await fetch(`${BASE_URL}/animes/top-airing?page=${page}`);
        const json = await res.json();
        return (json.data?.response || []).map((item: any) => ({
            ...mapCustomToAnime(item),
            availableEpisodes: item.episodes?.eps || 0
        }));
    } catch (error) {
        return [];
    }
};

export const fetchHomeData = async (): Promise<any> => {
    try {
        const res = await fetch(`${BASE_URL}/home`);
        const json = await res.json();
        const data = json.data || {};

        return {
            spotlight: (data.spotlight || []).map(mapCustomToAnime),
            trending: (data.trending || []).map(mapCustomToAnime),
            topAiring: (data.topAiring || []).map(mapCustomToAnime),
            mostPopular: (data.mostPopular || []).map(mapCustomToAnime),
            mostFavorite: (data.mostFavorite || []).map(mapCustomToAnime),
            latestCompleted: (data.latestCompleted || []).map(mapCustomToAnime),
            latestEpisode: (data.latestEpisode || []).map(mapCustomToAnime),
            newAdded: (data.newAdded || []).map(mapCustomToAnime),
            topUpcoming: (data.topUpcoming || []).map(mapCustomToAnime),
            top10: data.top10 || {}
        };
    } catch (error) {
        return null;
    }
};

export const fetchTrendingAnime = async (): Promise<any[]> => {
    try {
        const res = await fetch(`${BASE_URL}/home`);
        const json = await res.json();
        return (json.data?.trending || []).slice(0, 10).map((item: any) => ({
            ...mapCustomToAnime(item),
            availableEpisodes: item.episodes?.eps || 0
        }));
    } catch (error) {
        return [];
    }
};

export const fetchAnimeByAZ = async (letter: string, page: number = 1): Promise<{ data: any[], pagination: any }> => {
    try {
        const res = await fetch(`${BASE_URL}/animes/az-list/${letter}?page=${page}`);
        const json = await res.json();
        return {
            data: (json.data?.response || []).map(mapCustomToAnime),
            pagination: {
                has_next_page: json.data?.pageInfo?.hasNextPage,
                last_visible_page: json.data?.pageInfo?.totalPages || json.data?.pageInfo?.lastPage || (json.data?.pageInfo?.hasNextPage ? page + 1 : page),
                totalItems: json.data?.pageInfo?.totalItems || json.data?.pageInfo?.total || 0,
                items: { total: json.data?.pageInfo?.totalItems || json.data?.pageInfo?.total || 0 }
            }
        };
    } catch (error) {
        return { data: [], pagination: {} };
    }
};

export const fetchCompletedAnime = async (page: number = 1): Promise<any[]> => {
    try {
        const res = await fetch(`${BASE_URL}/animes/completed?page=${page}`);
        const json = await res.json();
        return (json.data?.response || []).map((item: any) => ({
            ...mapCustomToAnime(item),
            availableEpisodes: item.episodes?.eps || 0
        }));
    } catch (error) {
        return [];
    }
};

export const fetchTopTrending = async (type: 'today' | 'week' | 'month' = 'today'): Promise<any[]> => {
    try {
        const res = await fetch(`${BASE_URL}/home`);
        const json = await res.json();
        const top10 = json.data?.top10?.[type] || [];
        return top10.map(mapCustomToAnime);
    } catch (error) {
        return [];
    }
};

export const fetchRelatedAnime = async (id: string): Promise<any[]> => {
    try {
        const res = await fetch(`${BASE_URL}/anime/${id}`);
        const json = await res.json();
        // This function is often used for the "Recommendations" section
        return (json.data?.recommended || []).map(mapCustomToAnime);
    } catch (error) {
        return [];
    }
};

export const fetchAnimeCharacters = async (id: string): Promise<any[]> => {
    try {
        const res = await fetch(`${BASE_URL}/characters/${id}`);
        const json = await res.json();
        return Array.isArray(json.data?.response) ? json.data.response : [];
    } catch (err) {
        return [];
    }
};

export const fetchAnimeThemes = async (id: string): Promise<any> => {
    return { openings: [], endings: [] };
};
export const fetchAnimeRelations = async (id: string): Promise<any[]> => {
    try {
        const res = await fetch(`${BASE_URL}/anime/${id}`);
        const json = await res.json();
        // This function returns direct relations like Sequels, Prequels, etc.
        return (json.data?.related || []).map(mapCustomToAnime);
    } catch (error) {
        return [];
    }
};

export const fetchAnimeByGenre = async (genreId: string, page: number = 1): Promise<{ data: any[], pagination: any }> => {
    try {
        const res = await fetch(`${BASE_URL}/animes/genre/${genreId}?page=${page}`);
        const json = await res.json();
        return {
            data: (json.data?.response || []).map(mapCustomToAnime),
            pagination: {
                has_next_page: json.data?.pageInfo?.hasNextPage,
                last_visible_page: json.data?.pageInfo?.totalPages || json.data?.pageInfo?.lastPage || (json.data?.pageInfo?.hasNextPage ? page + 1 : page),
                items: { total: json.data?.pageInfo?.totalItems || json.data?.pageInfo?.total || 0 }
            }
        };
    } catch (error) {
        return { data: [], pagination: {} };
    }
};

export const fetchAnimeByType = async (type: string, page: number = 1): Promise<{ data: any[], pagination: any }> => {
    try {
        const res = await fetch(`${BASE_URL}/animes/${type.toLowerCase()}?page=${page}`);
        const json = await res.json();
        return {
            data: (json.data?.response || []).map(mapCustomToAnime),
            pagination: {
                has_next_page: json.data?.pageInfo?.hasNextPage,
                last_visible_page: json.data?.pageInfo?.totalPages || json.data?.pageInfo?.lastPage || (json.data?.pageInfo?.hasNextPage ? page + 1 : page),
                items: { total: json.data?.pageInfo?.totalItems || json.data?.pageInfo?.total || 0 }
            }
        };
    } catch (error) {
        return { data: [], pagination: {} };
    }
};

export const fetchPopularAnime = async (page: number = 1): Promise<{ data: any[], pagination: any }> => {
    try {
        const res = await fetch(`${BASE_URL}/animes/most-popular?page=${page}`);
        const json = await res.json();
        return {
            data: (json.data?.response || []).map(mapCustomToAnime),
            pagination: {
                has_next_page: json.data?.pageInfo?.hasNextPage,
                last_visible_page: json.data?.pageInfo?.totalPages || json.data?.pageInfo?.lastPage || (json.data?.pageInfo?.hasNextPage ? page + 1 : page),
                items: { total: json.data?.pageInfo?.totalItems || json.data?.pageInfo?.total || 0 }
            }
        };
    } catch (error) {
        return { data: [], pagination: {} };
    }
};

export const fetchAnimeCategory = async (category: string, query?: string, page: number = 1): Promise<{ data: any[], pagination: any }> => {
    try {
        const endpoint = query ? `/animes/${category}/${query}?page=${page}` : `/animes/${category}?page=${page}`;
        const res = await fetch(`${BASE_URL}${endpoint}`);
        const json = await res.json();
        return {
            data: (json.data?.response || []).map(mapCustomToAnime),
            pagination: {
                has_next_page: json.data?.pageInfo?.hasNextPage,
                last_visible_page: json.data?.pageInfo?.totalPages || json.data?.pageInfo?.lastPage || (json.data?.pageInfo?.hasNextPage ? page + 1 : page),
                items: { total: json.data?.pageInfo?.totalItems || json.data?.pageInfo?.total || 0 }
            }
        };
    } catch (error) {
        return { data: [], pagination: {} };
    }
};

export const fetchRandomAnime = async (): Promise<any> => {
    try {
        const res = await fetch(`${BASE_URL}/home`, { cache: 'no-store' });
        const json = await res.json();
        const data = json.data || {};

        const pool = [
            ...(data.topAiring || []),
            ...(data.mostFavorite || []),
            ...(data.latestCompleted || []),
            ...(data.latestEpisode || []),
            ...(data.newAdded || []),
            ...(data.topUpcoming || [])
        ];

        if (pool.length > 0) {
            // Unique-ify by ID to avoid bias towards show that appear in multiple sections
            const uniquePool = Array.from(new Map(pool.map(item => [item.id, item])).values());
            const randomItem = uniquePool[Math.floor(Math.random() * uniquePool.length)];
            return mapCustomToAnime(randomItem);
        }
        return null;
    } catch (error) {
        console.error('fetchRandomAnime Error:', error);
        return null;
    }
};

export const fetchGenresList = async (): Promise<any[]> => {
    try {
        const res = await fetch(`${BASE_URL}/genres`);
        const json = await res.json();
        return (json.data || []).map((g: string) => ({
            name: g.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        }));
    } catch (error) {
        return [];
    }
};

export const fetchEpisodeStreamingLinks = async (episodeId: string): Promise<any> => {
    try {
        const res = await fetch(`${BASE_URL}/stream?id=${episodeId}&server=HD-1&type=sub`);
        const json = await res.json();
        return json.success ? json.data : null;
    } catch (error) {
        return null;
    }
};
