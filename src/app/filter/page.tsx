import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AnimeCard from '@/components/AnimeCard';
import FilterPanel from '@/components/FilterPanel';

async function fetchFiltered(params: Record<string, string | undefined>, page: number) {
    const query: Record<string, any> = { page };

    // Map frontend generic values to Custom Backend values
    // custom backend genres accepts comma-separated strings matching the name
    if (params.genres) {
        // Map ID string to correct genre names if needed, but since we'll update GENRES array below, genres might be string names
        query.genres = params.genres;
    }
    if (params.type) query.type = params.type;
    if (params.status) query.status = params.status;
    if (params.rating) query.rated = params.rating;
    if (params.q) query.keyword = params.q;
    if (params.sort) query.sort = params.sort;
    if (params.season) query.season = params.season;

    const qStr = new URLSearchParams(
        Object.fromEntries(Object.entries(query).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
    ).toString();

    const res = await fetch(`http://localhost:3030/api/v1/filter?${qStr}`, {
        next: { revalidate: 60 },
        headers: { Accept: 'application/json' },
    });

    if (!res.ok) return { data: [], pagination: {} };
    const json = await res.json();
    return {
        data: json.data?.response || [],
        pagination: {
            has_next_page: json.data?.pageInfo?.hasNextPage,
            last_visible_page: json.data?.pageInfo?.totalPages || 1,
            items: { total: undefined } // Total not typically available from scraping
        }
    };
}

interface FilterOption { value: string; label: string; emoji?: string; }

const GENRES = [
    { id: 'action', name: 'Action' }, { id: 'adventure', name: 'Adventure' }, { id: 'comedy', name: 'Comedy' },
    { id: 'drama', name: 'Drama' }, { id: 'fantasy', name: 'Fantasy' }, { id: 'horror', name: 'Horror' },
    { id: 'mystery', name: 'Mystery' }, { id: 'romance', name: 'Romance' }, { id: 'sci-fi', name: 'Sci-Fi' },
    { id: 'slice-of-life', name: 'Slice of Life' }, { id: 'sports', name: 'Sports' }, { id: 'supernatural', name: 'Supernatural' },
    { id: 'suspense', name: 'Suspense' }, { id: 'strategy-game', name: 'Strategy Game' }, { id: 'historical', name: 'Historical' },
    { id: 'martial-arts', name: 'Martial Arts' }, { id: 'hentai', name: 'Hentai' }, { id: 'military', name: 'Military' },
    { id: 'music', name: 'Music' }, { id: 'school', name: 'School' }, { id: 'super-power', name: 'Super Power' },
    { id: 'psychological', name: 'Psychological' }, { id: 'seinen', name: 'Seinen' }, { id: 'kids', name: 'Kids' },
    { id: 'ecchi', name: 'Ecchi' }, { id: 'harem', name: 'Harem' }, { id: 'josei', name: 'Josei' },
    { id: 'shoujo', name: 'Shoujo' }, { id: 'shounen', name: 'Shounen' }, { id: 'vampire', name: 'Vampire' },
    { id: 'isekai', name: 'Isekai' }, { id: 'parody', name: 'Parody' }, { id: 'police', name: 'Police' },
    { id: 'magic', name: 'Magic' }, { id: 'samurai', name: 'Samurai' }, { id: 'space', name: 'Space' },
    { id: 'cars', name: 'Cars' }, { id: 'demons', name: 'Demons' }, { id: 'mecha', name: 'Mecha' },
];

const TYPES: FilterOption[] = [
    { value: 'TV', label: 'TV' },
    { value: 'Movie', label: 'Movie' },
    { value: 'OVA', label: 'OVA' },
    { value: 'ONA', label: 'ONA' },
    { value: 'Special', label: 'Special' },
    { value: 'Music', label: 'Music' },
];
const SEASONS: FilterOption[] = [
    { value: 'spring', label: 'Spring 🌸', emoji: '🌸' },
    { value: 'summer', label: 'Summer ☀️', emoji: '☀️' },
    { value: 'fall', label: 'Fall 🍂', emoji: '🍂' },
    { value: 'winter', label: 'Winter ❄️', emoji: '❄️' },
];
const STATUSES = [
    { value: 'airing', label: 'Currently Airing' },
    { value: 'complete', label: 'Finished Airing' },
    { value: 'upcoming', label: 'Upcoming' },
];
const RATINGS: FilterOption[] = [
    { value: 'g', label: 'G - All Ages' },
    { value: 'pg', label: 'PG - Children' },
    { value: 'pg13', label: 'PG-13 - Teens 13+' },
    { value: 'r17', label: 'R - 17+ Violence' },
    { value: 'r', label: 'R+ - Mild Nudity' },
    { value: 'rx', label: 'Rx - Hentai' },
];
const SORT_OPTIONS = [
    { value: 'score', label: 'Score' },
    { value: 'popularity', label: 'Popularity' },
    { value: 'rank', label: 'Rank' },
    { value: 'members', label: 'Members' },
    { value: 'favorites', label: 'Favorites' },
    { value: 'title', label: 'Title' },
    { value: 'start_date', label: 'Release Date' },
];

export default async function FilterPage({
    searchParams,
}: {
    searchParams: Promise<{
        genres?: string;
        type?: string;
        status?: string;
        rating?: string;
        season?: string;
        q?: string;
        order_by?: string;
        sort?: string;
        page?: string;
    }>;
}) {
    const params = await searchParams;
    const currentPage = parseInt(params.page || '1');
    const hasFilters = !!(params.genres || params.type || params.status || params.rating || params.season || params.q || params.order_by);

    const { data: results = [], pagination = {} } = await fetchFiltered(params, currentPage);

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
                        currentParams={params}
                    />

                    {/* ── Below: Results ── */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-lg font-black text-white tracking-tight">
                                {hasFilters ? 'filtered results' : 'all anime'}
                                {((pagination as any)?.items?.total !== undefined && (pagination as any).items.total > 0) && (
                                    <span className="ml-3 text-[11px] font-bold text-white/30 tracking-widest">
                                        {(pagination as any).items.total.toLocaleString()} anime found
                                    </span>
                                )}
                            </h1>
                        </div>

                        {results.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
                                    {results.map((item: any, i: number) => {
                                        const anime = {
                                            id: item.id?.toString(),
                                            title: { english: item.title, romaji: item.alternativeTitle || item.title },
                                            image: item.poster,
                                            score: item.score ? parseFloat(item.score) : undefined,
                                            type: item.type,
                                            status: item.status,
                                            totalEpisodes: item.episodes?.eps,
                                            availableEpisodes: item.episodes?.eps || 0,
                                            genres: item.genres || [],
                                        };
                                        return <AnimeCard key={`${anime.id}-${i}`} anime={anime} variant="portrait" />;
                                    })}
                                </div>

                                {/* Pagination */}
                                {(pagination as any)?.last_visible_page > 1 && (
                                    <div className="mt-16 flex items-center justify-center gap-2">
                                        {currentPage > 1 && (
                                            <Link
                                                href={buildUrl(params, currentPage - 1)}
                                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-muted hover:bg-white/10 hover:text-white transition-all shadow-sm"
                                            >
                                                <ChevronRight size={16} className="rotate-180" />
                                            </Link>
                                        )}

                                        {generatePaginationNums(currentPage, (pagination as any).last_visible_page).map((p, i) =>
                                            typeof p === 'number' ? (
                                                <Link
                                                    key={`page-${p}`}
                                                    href={buildUrl(params, p)}
                                                    className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-xs transition-all ${currentPage === p ?'bg-primary text-white shadow-lg'
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
                                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-muted hover:bg-white/10 hover:text-white transition-all shadow-sm"
                                            >
                                                <ChevronRight size={16} />
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-40 bg-white/[0.02] border border-dashed border-white/5 rounded-[6px]">
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
