import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AnimeCard from '@/components/AnimeCard';
import FilterPanel from '@/components/FilterPanel';

import { mapCustomToAnime } from '@/lib/consumet';

async function fetchFiltered(params: Record<string, string | undefined>, page: number) {
    const query: Record<string, any> = { page };

    if (params.genres) query.genres = params.genres;
    if (params.type) query.type = params.type;
    if (params.status) query.status = params.status;
    if (params.rated) query.rated = params.rated;
    if (params.q) query.keyword = params.q;
    if (params.sort) query.sort = params.sort;
    if (params.score) query.score = params.score;
    if (params.season) query.season = params.season;
    if (params.language) query.language = params.language;

    const qStr = new URLSearchParams(
        Object.fromEntries(Object.entries(query).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
    ).toString();

    const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'https://api-somino.up.railway.app') + '/api/v1';
    const res = await fetch(`${BASE_URL}/filter?${qStr}`, {
        next: { revalidate: 60 },
        headers: { Accept: 'application/json' },
    });

    if (!res.ok) return { data: [], pagination: {} };
    const json = await res.json();
    return {
        data: (json.data?.response || []).map(mapCustomToAnime),
        pagination: {
            has_next_page: json.data?.pageInfo?.hasNextPage,
            last_visible_page: json.data?.pageInfo?.totalPages || 1,
            items: { total: json.data?.pageInfo?.totalItems || 0 }
        }
    };
}

interface FilterOption { value: string; label: string; emoji?: string; }

const GENRES = [
    { id: 'action', name: 'Action' }, { id: 'adventure', name: 'Adventure' }, { id: 'cars', name: 'Cars' },
    { id: 'comedy', name: 'Comedy' }, { id: 'dementia', name: 'Dementia' }, { id: 'demons', name: 'Demons' },
    { id: 'drama', name: 'Drama' }, { id: 'ecchi', name: 'Ecchi' }, { id: 'fantasy', name: 'Fantasy' },
    { id: 'game', name: 'Game' }, { id: 'harem', name: 'Harem' }, { id: 'historical', name: 'Historical' },
    { id: 'horror', name: 'Horror' }, { id: 'isekai', name: 'Isekai' }, { id: 'josei', name: 'Josei' },
    { id: 'kids', name: 'Kids' }, { id: 'magic', name: 'Magic' }, { id: 'martial-arts', name: 'Martial Arts' },
    { id: 'mecha', name: 'Mecha' }, { id: 'military', name: 'Military' }, { id: 'music', name: 'Music' },
    { id: 'mystery', name: 'Mystery' }, { id: 'parody', name: 'Parody' }, { id: 'police', name: 'Police' },
    { id: 'psychological', name: 'Psychological' }, { id: 'romance', name: 'Romance' }, { id: 'samurai', name: 'Samurai' },
    { id: 'school', name: 'School' }, { id: 'sci-fi', name: 'Sci-Fi' }, { id: 'seinen', name: 'Seinen' },
    { id: 'shoujo', name: 'Shoujo' }, { id: 'shoujo-ai', name: 'Shoujo Ai' }, { id: 'shounen', name: 'Shounen' },
    { id: 'shounen-ai', name: 'Shounen Ai' }, { id: 'slice-of-life', name: 'Slice of Life' }, { id: 'space', name: 'Space' },
    { id: 'sports', name: 'Sports' }, { id: 'super-power', name: 'Super Power' }, { id: 'supernatural', name: 'Supernatural' },
    { id: 'thriller', name: 'Thriller' }, { id: 'vampire', name: 'Vampire' }
];

const TYPES: FilterOption[] = [
    { value: 'movie', label: 'Movie' },
    { value: 'tv', label: 'TV' },
    { value: 'ova', label: 'OVA' },
    { value: 'special', label: 'Special' },
    { value: 'music', label: 'Music' },
];
const SEASONS: FilterOption[] = [
    { value: 'spring', label: 'Spring 🌸', emoji: '🌸' },
    { value: 'summer', label: 'Summer ☀️', emoji: '☀️' },
    { value: 'fall', label: 'Fall 🍂', emoji: '🍂' },
    { value: 'winter', label: 'Winter ❄️', emoji: '❄️' },
];
const STATUSES = [
    { value: 'finished_airing', label: 'Finished Airing' },
    { value: 'currently_airing', label: 'Currently Airing' },
    { value: 'not_yet_aired', label: 'Not Yet Aired' },
];
const RATINGS: FilterOption[] = [
    { value: 'g', label: 'G - All Ages' },
    { value: 'pg', label: 'PG - Children' },
    { value: 'pg-13', label: 'PG-13 - Teens 13+' },
    { value: 'r', label: 'R - 17+ Violence' },
    { value: 'r+', label: 'R+ - Mild Nudity' },
    { value: 'rx', label: 'Rx - Hentai' },
];
const SCORE_OPTIONS: FilterOption[] = [
    { value: 'appalling', label: '1 - Appalling' },
    { value: 'horrible', label: '2 - Horrible' },
    { value: 'very_bad', label: '3 - Very Bad' },
    { value: 'bad', label: '4 - Bad' },
    { value: 'average', label: '5 - Average' },
    { value: 'fine', label: '6 - Fine' },
    { value: 'good', label: '7 - Good' },
    { value: 'very_good', label: '8 - Very Good' },
    { value: 'great', label: '9 - Great' },
    { value: 'masterpiece', label: '10 - Masterpiece' },
];
const SORT_OPTIONS = [
    { value: 'default', label: 'Default' },
    { value: 'recently_added', label: 'Recently Added' },
    { value: 'recently_updated', label: 'Recently Updated' },
    { value: 'score', label: 'Score' },
    { value: 'name_az', label: 'Name A-Z' },
    { value: 'release_date', label: 'Release Date' },
    { value: 'most_watched', label: 'Most Watched' },
];

export default async function FilterPage({
    searchParams,
}: {
    searchParams: Promise<{
        genres?: string;
        type?: string;
        status?: string;
        rated?: string;
        season?: string;
        q?: string;
        sort?: string;
        score?: string;
        language?: string;
        page?: string;
    }>;
}) {
    const params = await searchParams;
    const currentPage = parseInt(params.page || '1');
    const { data: results = [], pagination = {} } = await fetchFiltered(params, currentPage);

    const hasFilters = !!(params.genres || params.type || params.status || params.rated || params.season || params.q || params.sort || params.score || params.language);

    return (
        <main className="min-h-screen bg-background text-foreground pb-20">
            <Navbar />

            <div className="container mx-auto max-w-[1200px] px-4 pt-24 md:pt-32">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-[12px] font-bold text-white mb-8">
                    <Link href="/" className="hover:text-primary transition-colors hover:underline">Home</Link>
                    <span className="text-white/40 font-black">•</span>
                    <span className="text-white">Filter</span>
                </div>

                <div className="flex flex-col gap-8">
                    {/* ── Top: Filter Header ── */}
                    <FilterPanel
                        genres={GENRES}
                        types={TYPES}
                        statuses={STATUSES}
                        ratings={RATINGS}
                        seasons={SEASONS}
                        sortOptions={SORT_OPTIONS}
                        scoreOptions={SCORE_OPTIONS}
                        currentParams={params}
                    />

                    {/* ── Below: Results ── */}
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-lg md:text-xl font-bold tracking-tight text-white">
                                {hasFilters ? 'filtered results' : 'all anime'}
                            </h1>
                            {((pagination as any)?.items?.total !== undefined && (pagination as any).items.total > 0) && (
                                <div className="text-sm md:text-base font-medium text-white">
                                    {(pagination as any).items.total.toLocaleString()} <span className="text-white/40 font-bold tracking-wider">anime</span>
                                </div>
                            )}
                        </div>

                        {results.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
                                    {results.map((anime: any, i: number) => (
                                        <AnimeCard key={`${anime.id}-${i}`} anime={anime} variant="portrait" />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {(pagination as any)?.last_visible_page > 1 && (
                                    <div className="mt-16 flex items-center justify-center gap-2">
                                        {currentPage > 1 && (
                                            <Link
                                                href={buildUrl(params, currentPage - 1)}
                                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-muted hover:bg-white/10 hover:text-white transition-all"
                                            >
                                                <ChevronRight size={16} className="rotate-180" />
                                            </Link>
                                        )}

                                        {generatePaginationNums(currentPage, (pagination as any).last_visible_page).map((p, i) =>
                                            typeof p === 'number' ? (
                                                <Link
                                                    key={`page-${p}`}
                                                    href={buildUrl(params, p)}
                                                    className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-xs transition-all ${currentPage === p ? 'bg-primary text-white'
                                                        : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'
                                                        }`}
                                                >
                                                    {p}
                                                </Link>
                                            ) : (
                                                <span key={`dots-${i}`} className="text-muted/40 px-1 font-bold">...</span>
                                            )
                                        )}

                                        {(pagination as any).has_next_page && (
                                            <Link
                                                href={buildUrl(params, currentPage + 1)}
                                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-muted hover:bg-white/10 hover:text-white transition-all"
                                            >
                                                <ChevronRight size={16} />
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-40 bg-white/[0.02] rounded-[6px]">
                                <p className="text-sm font-black text-white/20 tracking-widest">no results found</p>
                                <p className="text-[10px] font-medium text-white/10 mt-2">try adjusting your filters</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

function buildUrl(params: Record<string, string | undefined>, page: number) {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v && k !== 'page') p.set(k, v); });
    p.set('page', String(page));
    return `/filter?${p.toString()}`;
}

function generatePaginationNums(current: number, total: number) {
    const pages: (number | string)[] = [];
    if (total <= 7) { for (let i = 1; i <= total; i++) pages.push(i); return pages; }
    pages.push(1);
    if (current > 3) pages.push('...');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
}
