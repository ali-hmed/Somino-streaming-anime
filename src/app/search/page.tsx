import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AnimeCard from '@/components/AnimeCard';
import { searchAnime } from '@/lib/consumet';

export default async function SearchPage({
    searchParams
}: {
    searchParams: Promise<{ q: string, page?: string }>
}) {
    const resolvedSearchParams = await searchParams;
    const query = resolvedSearchParams.q || '';
    const currentPage = parseInt(resolvedSearchParams.page || '1');

    const { data: results, pagination } = query
        ? await searchAnime(query, currentPage)
        : { data: [], pagination: {} };

    return (
        <main className="min-h-screen bg-background text-foreground pb-20">
            <Navbar />

            <div className="container mx-auto max-w-[1400px] px-4 pt-24 md:pt-32">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted mb-8">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <ChevronRight size={10} className="opacity-40" />
                    <span className="text-white/60">Search</span>
                </div>

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-lg md:text-xl font-bold tracking-tight text-white">
                        SEARCH: {query}
                    </h1>
                    {pagination?.items?.total !== undefined && pagination.items.total > 0 && (
                        <div className="text-sm md:text-base font-medium text-white">
                            {pagination.items.total.toLocaleString()} <span className="text-white/40 font-bold tracking-wider">results</span>
                        </div>
                    )}
                </div>

                {results.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 min-h-[600px]">
                            {results.map((anime, i) => (
                                <AnimeCard key={`${anime.id}-${i}`} anime={anime} variant="portrait" />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination?.last_visible_page > 1 && (
                            <div className="mt-20 flex items-center justify-center gap-2">
                                {currentPage > 1 && (
                                    <Link
                                        href={`/search?q=${encodeURIComponent(query)}&page=${currentPage - 1}`}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-muted hover:bg-white/10 hover:text-white transition-all"
                                    >
                                        <ChevronRight size={16} className="rotate-180" />
                                    </Link>
                                )}

                                {generatePagination(currentPage, pagination.last_visible_page).map((page, i) => (
                                    typeof page === 'number' ? (
                                        <Link
                                            key={`page-${page}`}
                                            href={`/search?q=${encodeURIComponent(query)}&page=${page}`}
                                            className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-xs transition-all ${currentPage === page ? 'bg-primary text-white'
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
                                        href={`/search?q=${encodeURIComponent(query)}&page=${currentPage + 1}`}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-muted hover:bg-white/10 hover:text-white transition-all"
                                    >
                                        <ChevronRight size={16} />
                                    </Link>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 bg-white/5 rounded-2xl">
                        <img src="/miku-not-found.png" alt="No Results" className="w-40 h-40 object-contain mb-2 opacity-90 select-none" draggable={false} />
                        <h3 className="text-xl font-black text-white/40 tracking-widest uppercase">No Series Found</h3>
                        <p className="text-[10px] font-bold text-muted mt-2 tracking-widest uppercase opacity-60">Try searching with a different title or keyword</p>
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
