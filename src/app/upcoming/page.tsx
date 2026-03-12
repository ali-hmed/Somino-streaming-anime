import React from 'react';
import Link from 'next/link';
import { fetchUpcomingAnime } from '@/lib/consumet';
import Navbar from '@/components/Navbar';
import AnimeCard from '@/components/AnimeCard';
import { ChevronRight, Calendar } from 'lucide-react';

export default async function UpcomingPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const params = await searchParams;
    const currentPage = parseInt(params.page || '1');
    const { data: upcomingList, pagination } = await fetchUpcomingAnime(currentPage);
    const totalFound = (pagination as any)?.items?.total || 0;
    const lastPage = (pagination as any)?.last_visible_page || 1;

    return (
        <main className="min-h-screen bg-background pb-20">
            <Navbar />

            <div className="container mx-auto max-w-[1400px] px-4 md:px-12 pt-28 md:pt-36">
                {/* Premium Header */}
                <div className="bg-gradient-to-r from-primary/10 via-transparent to-transparent p-8 md:p-12 rounded-3xl mb-12 relative overflow-hidden group">
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-all duration-1000" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-[1px] bg-primary" />
                            <span className="text-[10px] md:text-xs font-black tracking-[0.4em] text-primary">Anticipated Releases</span>
                        </div>
                        <h1 className="text-4xl md:text-7xl font-display font-black text-white tracking-tighter leading-[0.9]">
                            Upcoming <br className="hidden md:block" />
                            <span className="text-primary">Anime</span>
                        </h1>
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 mt-6">
                            <p className="text-white/40 text-sm md:text-base font-medium max-w-xl leading-relaxed">
                                Discover the most anticipated anime titles coming soon. From new seasons to brand new releases, stay ahead of the curve.
                            </p>
                            {totalFound > 0 && (
                                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full self-start md:self-center">
                                    <span className="text-primary font-black text-xs">{totalFound.toLocaleString()}</span>
                                    <span className="text-white/20 font-bold text-[10px] tracking-widest">Titles Found</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {upcomingList.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {upcomingList.map((item, i) => (
                                <AnimeCard key={`${item.id}-${i}`} anime={item} variant="portrait" isUpcoming={true} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {lastPage > 1 && (
                            <div className="mt-20 flex items-center justify-center gap-2">
                                {currentPage > 1 && (
                                    <Link
                                        href={`/upcoming?page=${currentPage - 1}`}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-muted hover:bg-white/10 hover:text-white transition-all"
                                    >
                                        <ChevronRight size={16} className="rotate-180" />
                                    </Link>
                                )}

                                {generatePaginationNums(currentPage, lastPage).map((p, i) =>
                                    typeof p === 'number' ? (
                                        <Link
                                            key={`page-${p}`}
                                            href={`/upcoming?page=${p}`}
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
                                        href={`/upcoming?page=${currentPage + 1}`}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-muted hover:bg-white/10 hover:text-white transition-all"
                                    >
                                        <ChevronRight size={16} />
                                    </Link>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20 bg-surface rounded-2xl">
                        <Calendar size={48} className="mx-auto text-white/5 mb-4" />
                        <p className="text-muted font-bold tracking-widest text-xs">No upcoming anime found at the moment.</p>
                    </div>
                )}
            </div>
        </main>
    );
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
