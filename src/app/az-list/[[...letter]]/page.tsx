import React from 'react';
import Link from 'next/link';
import { ChevronRight, LayoutGrid } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AnimeCard from '@/components/AnimeCard';
import { fetchAnimeByAZ } from '@/lib/consumet';

export default async function AZListPage({
    params,
    searchParams
}: {
    params: Promise<{ letter?: string[] }>;
    searchParams: Promise<{ page?: string }>;
}) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;

    // params.letter is an array because of [[...letter]]
    // If /az-list -> letter is undefined
    // If /az-list/symbols -> letter is ['symbols']
    let currentLetter = resolvedParams.letter?.[0]?.toUpperCase() || 'ALL';
    if (currentLetter === 'SYMBOLS') currentLetter = '#';

    const currentPage = parseInt(resolvedSearchParams.page || '1');

    const { data: animeList, pagination } = await fetchAnimeByAZ(currentLetter.toLowerCase(), currentPage);

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const categories = ['ALL', '0-9', ...alphabet];

    return (
        <main className="min-h-screen bg-background text-foreground pb-20">
            <Navbar />

            <div className="container mx-auto max-w-[1400px] px-4 pt-24 md:pt-32">
                {/* Mobile-Optimized Header (Image Style) */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-lg md:text-xl font-bold tracking-tight text-white">
                        {currentLetter === 'ALL' ? 'ALL ANIME' : `LETTER ${currentLetter} ANIME`}
                    </h1>
                    {pagination?.items?.total !== undefined && pagination.items.total > 0 && (
                        <div className="text-sm md:text-base font-medium text-white">
                            {pagination.items.total.toLocaleString()} <span className="text-white/40 font-bold tracking-wider">anime</span>
                        </div>
                    )}
                </div>

                {/* Letter Selector: Grid on mobile, single row on desktop */}
                <div className="flex flex-wrap md:flex-nowrap items-center justify-start gap-1.5 mb-10 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {categories.map((cat) => (
                        <Link
                            key={cat}
                            href={`/az-list/${cat === 'ALL' ? '' : cat}`}
                            className={`flex-shrink-0 flex items-center justify-center min-w-[32px] h-8 px-2 rounded-md font-bold text-[11px] transition-all border ${currentLetter === cat ?'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                : 'bg-white/5 border-white/5 text-muted hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {cat}
                        </Link>
                    ))}
                </div>


                {/* Anime Grid */}
                {animeList.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 min-h-[600px]">
                        {animeList.map((anime, i) => (
                            <AnimeCard
                                key={`${anime.id}-${i}`}
                                anime={anime}
                                variant="portrait"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-40 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                        <LayoutGrid size={48} className="text-white/10 mb-6" />
                        <h3 className="text-xl font-black text-white/40 tracking-widest">No Series Found</h3>
                        <p className="text-[10px] font-bold text-muted mt-2 tracking-widest">No anime starting with &quot;{currentLetter}&quot; was found.</p>
                    </div>
                )}

                {/* Pagination */}
                {pagination?.last_visible_page > 1 && (
                    <div className="mt-20 flex items-center justify-center gap-2">
                        {currentPage > 1 && (
                            <Link
                                href={`/az-list/${currentLetter === 'ALL' ? '' : currentLetter}?page=${currentPage - 1}`}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-muted hover:bg-white/10 hover:text-white transition-all shadow-sm"
                            >
                                <ChevronRight size={16} className="rotate-180" />
                            </Link>
                        )}

                        {generatePagination(currentPage, pagination.last_visible_page).map((page, i) => (
                            typeof page === 'number' ? (
                                <Link
                                    key={`page-${page}`}
                                    href={`/az-list/${currentLetter === 'ALL' ? '' : currentLetter}?page=${page}`}
                                    className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-xs transition-all ${currentPage === page ?'bg-primary text-white shadow-lg'
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
                                href={`/az-list/${currentLetter === 'ALL' ? '' : currentLetter}?page=${currentPage + 1}`}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-muted hover:bg-white/10 hover:text-white transition-all shadow-sm"
                            >
                                <ChevronRight size={16} />
                            </Link>
                        )}
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
