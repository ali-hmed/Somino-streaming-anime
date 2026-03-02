"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { getTitle } from '@/types/anime';

interface TrendingRowProps {
    animeList: any[];
    title?: string;
}

const GAP = 16;

const TrendingRow: React.FC<TrendingRowProps> = ({ animeList, title = 'Trending' }) => {
    const outerRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: 'left' | 'right') => {
        if (!innerRef.current || !outerRef.current) return;
        const amount = outerRef.current.offsetWidth;
        innerRef.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
    };

    if (!animeList || animeList.length === 0) return null;

    return (
        <section className="py-5 overflow-hidden">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
                <h2
                    className="font-display font-black text-lg md:text-xl tracking-tight text-white"
                >
                    {title}
                </h2>
                <div className="hidden md:flex items-center gap-1">
                    <button
                        onClick={() => scroll('left')}
                        className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Scroller Container */}
            <div ref={outerRef} className="w-full">
                <div
                    ref={innerRef}
                    className="flex overflow-x-auto snap-x snap-mandatory"
                    style={{
                        gap: GAP,
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                >
                    {animeList.map((anime, index) => {
                        const animeTitle = getTitle(anime.title);
                        const num = String(index + 1).padStart(2, '0');

                        return (
                            <Link
                                key={`${anime.id}-${index}`}
                                href={`/watch/${anime.id}`}
                                className="trending-card group flex-shrink-0 flex snap-start"
                            >
                                {/* Left column: vertical title + number */}
                                <div className="flex flex-col items-center flex-shrink-0 mr-1.5" style={{ width: 18 }}>
                                    {/* Vertical title going upward */}
                                    <div className="flex-1 flex items-end overflow-hidden pb-1">
                                        <span
                                            className="text-[10px] font-bold text-white/80 whitespace-nowrap group-hover:text-primary transition-colors"
                                            style={{
                                                writingMode: 'vertical-rl',
                                                transform: 'rotate(180deg)',
                                                maxHeight: '100%',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {animeTitle}
                                        </span>
                                    </div>
                                    {/* Number at bottom */}
                                    <span className="text-sm font-black text-white mt-1 leading-none shadow-sm">
                                        {num}
                                    </span>
                                </div>

                                {/* Right: Poster image — square corners */}
                                <div
                                    className="relative overflow-hidden bg-white/5 flex-1 ring-1 ring-white/5 group-hover:ring-primary/30 transition-all"
                                    style={{ aspectRatio: '3/4' }}
                                >
                                    <img
                                        src={anime.image}
                                        alt={animeTitle}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
                                    />
                                    {/* Hover tint */}
                                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                                    {/* Score badge */}
                                    {anime.score && (
                                        <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-0.5 px-1 py-0.5 rounded-[2px] bg-black/60 backdrop-blur-md border border-white/10 text-[#FFB941] text-[8px] font-black shadow-sm">
                                            <Star size={8} fill="currentColor" className="stroke-0" />
                                            {anime.score}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <style>{`
                .trending-card {
                    --visible-cards: 2.2;
                    width: calc((100% - (var(--visible-cards) - 1) * ${GAP}px) / var(--visible-cards));
                }
                @media (min-width: 640px) {
                    .trending-card { --visible-cards: 3.5; }
                }
                @media (min-width: 768px) {
                    .trending-card { --visible-cards: 4.5; }
                }
                @media (min-width: 1024px) {
                    .trending-card { --visible-cards: 6; }
                }
                @media (min-width: 1280px) {
                    .trending-card { --visible-cards: 6; }
                }
                
                div[style*="scrollbarWidth"]::-webkit-scrollbar { display: none; }
            `}</style>
        </section>
    );
};

export default TrendingRow;
