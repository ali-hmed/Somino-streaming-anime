import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AnimeCard from '@/components/AnimeCard';
import { fetchAnimeByGenre, fetchGenresList, fetchAnimeByType, fetchPopularAnime } from '@/lib/consumet';

export default async function GenrePage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ page?: string }>;
}) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const slug = resolvedParams.slug;
    const currentPage = parseInt(resolvedSearchParams.page || '1');

    // Special case for "popular"
    const isPopular = slug.toLowerCase() === 'popular';

    // 1. Get genre ID or Type from slug
    const genresList = !isPopular ? await fetchGenresList() : [];

    // Fallback map for legacy MAL categories or common aliases (normalized for Jikan v4)
    const genreNameMap: Record<string, string> = {
        'dementia': 'avant garde',
        'cars': 'racing',
        'game': 'strategy game',
        'demons': 'mythology',
        'magic': 'super power',
        'super-power': 'super power',
        'military': 'military',
        'police': 'detective',
        'thriller': 'suspense',
        'yaoi': 'boys love',
        'yuri': 'girls love',
        'martial-arts': 'martial arts',
        'slice-of-life': 'slice of life',
        'shoujo-ai': 'girls love',
        'shounen-ai': 'boys love'
    };

    const searchSlug = slug.toLowerCase();
    const targetName = (genreNameMap[searchSlug] || searchSlug.replace(/-/g, ' ')).toLowerCase();

    let genre = (genresList || []).find(g =>
        g.name.toLowerCase() === targetName ||
        g.name.toLowerCase().replace(/ /g, '-') === searchSlug ||
        g.name.toLowerCase().replace(/ /g, '') === searchSlug.replace(/-/g, '')
    );

    // If still not found, try a broader search
    if (!genre && genresList?.length > 0) {
        genre = genresList.find(g =>
            g.name.toLowerCase().includes(targetName) ||
            targetName.includes(g.name.toLowerCase())
        );
    }

    // Support for type filtering if not a genre (e.g., /genre/movie)
    const types = ['tv', 'movie', 'ova', 'special', 'ona', 'music'];
    const isType = types.includes(slug.toLowerCase());

    if (!genre && !isType && !isPopular) {
        // One last check: maybe the slug is part of the name
        return (
            <main className="min-h-screen bg-background text-foreground pb-20">
                <Navbar />
                <div className="container mx-auto px-4 pt-40 flex flex-col items-center justify-center text-center">
                    <img src="/miku-not-found.png" alt="Not Found" className="w-40 h-40 object-contain mb-2 opacity-90 select-none" draggable={false} />
                    <h1 className="text-2xl font-black text-white/40">Genre Not Found</h1>
                    <p className="text-sm text-muted mt-2 max-w-sm">We couldn't find the category "{slug}". Please try another one.</p>
                    <Link href="/" className="mt-8 px-8 py-3 bg-primary text-white font-bold tracking-widest text-xs rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                        Back to Home
                    </Link>
                </div>
            </main>
        );
    }

    // 2. Fetch anime
    let fetchResult;
    if (isPopular) {
        fetchResult = await fetchPopularAnime(currentPage);
    } else if (genre) {
        fetchResult = await fetchAnimeByGenre(genre.name.toLowerCase().replace(/ /g, '-'), currentPage);
    } else {
        // Fetch by type
        fetchResult = await fetchAnimeByType(slug, currentPage);
    }

    const { data: animeList, pagination } = fetchResult;
    const displayName = isPopular ? 'Popular' : (genre ? genre.name : (slug.charAt(0).toUpperCase() + slug.slice(1)));

    return (
        <main className="min-h-screen bg-background text-foreground pb-20">
            <Navbar />

            <div className="container mx-auto max-w-[1400px] px-4 md:px-12 pt-24 md:pt-32">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted mb-8">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <ChevronRight size={10} className="opacity-40" />
                    <span className="text-white/60">Genre</span>
                    <ChevronRight size={10} className="opacity-40" />
                    <span className="text-white/60">{displayName}</span>
                </div>

                {/* Page Header (Image Style) */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-lg md:text-xl font-bold tracking-tight text-white">
                        {displayName} anime
                    </h1>
                    {pagination?.items?.total !== undefined && pagination.items.total > 0 && (
                        <div className="text-sm md:text-base font-medium text-white">
                            {pagination.items.total.toLocaleString()} <span className="text-white/40 font-bold tracking-wider">anime</span>
                        </div>
                    )}
                </div>

                {/* Anime Grid */}
                {animeList.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 min-h-[600px]">
                            {animeList.map((anime: any, i: number) => (
                                <AnimeCard
                                    key={`${anime.id}-${i}`}
                                    anime={anime}
                                    variant="portrait"
                                    isSharp={true}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination?.last_visible_page > 1 && (
                            <div className="mt-20 flex items-center justify-center gap-2">
                                {currentPage > 1 && (
                                    <Link
                                        href={`/genre/${slug}?page=${currentPage - 1}`}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-muted hover:bg-white/10 hover:text-white transition-all shadow-sm"
                                    >
                                        <ChevronRight size={16} className="rotate-180" />
                                    </Link>
                                )}

                                {generatePagination(currentPage, pagination.last_visible_page).map((page, i) => (
                                    typeof page === 'number' ? (
                                        <Link
                                            key={`page-${page}`}
                                            href={`/genre/${slug}?page=${page}`}
                                            className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-xs transition-all ${currentPage === page ? 'bg-primary text-white shadow-lg'
                                                : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            {page}
                                        </Link>
                                    ) : (
                                        <span key={`dots-${i}`} className="text-muted/40 px-1 font-bold">...</span>
                                    )
                                ))}

                                {pagination.has_next_page && (
                                    <Link
                                        href={`/genre/${slug}?page=${currentPage + 1}`}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-muted hover:bg-white/10 hover:text-white transition-all shadow-sm"
                                    >
                                        <ChevronRight size={16} />
                                    </Link>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                        <img src="/miku-not-found.png" alt="No Results" className="w-36 h-36 object-contain mb-2 opacity-90 select-none" draggable={false} />
                        <h3 className="text-xl font-black text-white/40 tracking-widest">No Series Found</h3>
                        <p className="text-[10px] font-bold text-muted mt-2 tracking-widest">No anime found in this category.</p>
                    </div>
                )}
            </div>
        </main>
    );
}

// Helper to generate pagination numbers with ellipsis
function generatePagination(current: number, total: number) {
    const pages: (number | string)[] = [];
    const surround = 1;

    if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i);
        return pages;
    }

    pages.push(1);

    if (current > 3) pages.push('...');

    const start = Math.max(2, current - surround);
    const end = Math.min(total - 1, current + surround);

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    if (current < total - 2) pages.push('...');

    pages.push(total);

    return pages;
}
