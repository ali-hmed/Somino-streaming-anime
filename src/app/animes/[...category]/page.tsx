import React from 'react';
import Link from 'next/link';
import { ChevronRight, LayoutGrid } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AnimeCard from '@/components/AnimeCard';
import { fetchAnimeCategory } from '@/lib/consumet';

export default async function ListPage({
    params,
    searchParams
}: {
    params: Promise<{ category: string[] }>;
    searchParams: Promise<{ page?: string }>;
}) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;

    // Support category and optional query
    const category = resolvedParams.category[0];
    const query = resolvedParams.category.length > 1 ? resolvedParams.category[1] : undefined;

    const currentPage = parseInt(resolvedSearchParams.page || '1');

    const validCategories = [
        "top-airing",
        "most-popular",
        "most-favorite",
        "completed",
        "recently-added",
        "recently-updated",
        "top-upcoming",
        "subbed-anime",
        "dubbed-anime",
        "movie",
        "tv",
        "ova",
        "ona",
        "special",
        "az-list",
        "genre",
        "producer",
    ];

    if (!validCategories.includes(category)) {
        return (
            <main className="min-h-screen bg-background text-foreground pb-20">
                <Navbar />
                <div className="container mx-auto px-4 pt-40 flex flex-col items-center justify-center text-center">
                    <LayoutGrid size={64} className="text-white/10 mb-6" />
                    <h1 className="text-2xl font-black text-white/40">Category Not Found</h1>
                    <p className="text-sm text-muted mt-2 max-w-sm">We couldn't find the category "{category}".</p>
                    <Link href="/" className="mt-8 px-8 py-3 bg-primary text-white font-bold tracking-widest text-xs rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                        Back to Home
                    </Link>
                </div>
            </main>
        );
    }

    const { data: animeList, pagination } = await fetchAnimeCategory(category, query, currentPage);
    const displayName = (category.replace(/-/g, ' ') + (query ? ` : ${query}` : '')).toUpperCase();

    // The AZ list filter component
    const renderAZ = () => {
        if (category !== 'az-list') return null;
        const azList = [
            { title: "ALL", link: "/animes/az-list" },
            { title: "#", link: "/animes/az-list/other" },
            ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map(l => ({ title: l, link: `/animes/az-list/${l}` }))
        ];

        return (
            <div className="w-full mb-8 flex gap-2 flex-wrap justify-center items-center">
                {azList.map((item) => {
                    const isActive = query ? query.toUpperCase() === item.title : item.title === 'ALL';
                    return (
                        <Link href={item.link} key={item.title}>
                            <button className={`px-3 py-1.5 text-[12px] rounded font-bold transition-all ${isActive ?"bg-primary text-black shadow-lg shadow-primary/20" : "bg-white/5 text-muted hover:bg-white/10 hover:text-white"}`}>
                                {item.title}
                            </button>
                        </Link>
                    )
                })}
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background text-foreground pb-20">
            <Navbar />

            <div className="container mx-auto max-w-[1400px] px-4 md:px-12 pt-24 md:pt-32">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted mb-8">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <ChevronRight size={10} className="opacity-40" />
                    <span className="text-white/60">animes</span>
                    <ChevronRight size={10} className="opacity-40" />
                    <span className="text-white/60">{displayName}</span>
                </div>

                {renderAZ()}

                {/* Page Header (Image Style) */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-lg md:text-xl font-bold tracking-tight text-white">
                        {displayName}
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
                                        href={`/animes/${category}${query ? `/${query}` : ''}?page=${currentPage - 1}`}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-muted hover:bg-white/10 hover:text-white transition-all shadow-sm"
                                    >
                                        <ChevronRight size={16} className="rotate-180" />
                                    </Link>
                                )}

                                {generatePagination(currentPage, pagination.last_visible_page).map((page, i) => (
                                    typeof page === 'number' ? (
                                        <Link
                                            key={`page-${page}`}
                                            href={`/animes/${category}${query ? `/${query}` : ''}?page=${page}`}
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
                                        href={`/animes/${category}${query ? `/${query}` : ''}?page=${currentPage + 1}`}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-muted hover:bg-white/10 hover:text-white transition-all shadow-sm"
                                    >
                                        <ChevronRight size={16} />
                                    </Link>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-40 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                        <LayoutGrid size={48} className="text-white/10 mb-6" />
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
