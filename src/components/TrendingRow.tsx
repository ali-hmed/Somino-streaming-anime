"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getTitle } from '@/types/anime';

interface TrendingRowProps {
    animeList: any[];
    title?: string;
}

const CARD_W = 170;
const CARD_H = 240;
const NUM_COL_W = 52; // width of the left number+title column
const GAP = 18;

const TrendingPoster = ({ src, alt }: { src: string; alt: string }) => {
    const [imgError, setImgError] = React.useState(false);
    return (
        <div
            className="relative overflow-hidden bg-card flex-shrink-0 transition-all"
            style={{ width: CARD_W, height: CARD_H }}
        >
            {src && !imgError ? (
                <img
                    src={src}
                    alt={alt}
                    onError={() => setImgError(true)}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#1B1F2A] to-[#151821] flex flex-col items-center justify-center p-4">
                     <span className="text-[10px] font-bold text-white/20 text-center line-clamp-2 px-2 uppercase tracking-tighter">
                         {alt}
                     </span>
                </div>
            )}
            {/* Hover tint */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
};

const TrendingRow: React.FC<TrendingRowProps> = ({ animeList, title = 'Trending' }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const amount = scrollRef.current.offsetWidth;
        scrollRef.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
    };

    if (!animeList || animeList.length === 0) return null;

    return (
        <section className="trending-row-section py-5 overflow-hidden">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-lg md:text-xl tracking-tight text-primary">
                    {title}
                </h2>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => scroll('left')}
                        className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                        aria-label="Scroll right"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Scroller */}
            <div
                ref={scrollRef}
                className="trending-scroller flex overflow-x-auto"
                style={{ gap: GAP, scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {animeList.map((anime, index) => {
                    const animeTitle = getTitle(anime.title);
                    const num = String(index + 1).padStart(2, '0');

                    return (
                        <Link
                            key={`${anime.id}-${index}`}
                            href={`/watch/${anime.id}`}
                            className="trending-item group flex-shrink-0 flex"
                            style={{ height: CARD_H }}
                        >
                            {/* Left column — number + vertical title */}
                            <div
                                className="flex flex-col items-center justify-between flex-shrink-0 select-none"
                                style={{ width: NUM_COL_W }}
                            >
                                {/* Vertical title — fills space above number */}
                                <div className="flex-1 overflow-hidden flex items-end pb-1 pt-2">
                                    <span
                                        className="tr-vtitle text-[14px] font-bold text-white/70 group-hover:text-primary transition-colors leading-tight"
                                        style={{
                                            writingMode: 'vertical-rl',
                                            transform: 'rotate(180deg)',
                                            maxHeight: '100%',
                                            overflow: 'hidden',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 1,
                                            WebkitBoxOrient: 'vertical',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        {animeTitle}
                                    </span>
                                </div>

                                {/* Large ranking number at the bottom */}
                                <span className="tr-num font-black leading-none pb-0">
                                    {num}
                                </span>
                            </div>

                            {/* Poster */}
                            <TrendingPoster src={anime.cover || anime.image} alt={animeTitle} />
                        </Link>
                    );
                })}
            </div>

            <style>{`
                .trending-scroller::-webkit-scrollbar { display: none; }

                /* Rank number sizing — big like HiAnime */
                .tr-num {
                    font-size: 28px;
                    color: rgba(255,255,255,0.2);
                }

                /* Make first 3 stand out */
                .trending-item:nth-child(1) .tr-num { color: #53CCB8; font-size: 32px; }
                .trending-item:nth-child(2) .tr-num { color: #3EB8A4; font-size: 30px; }
                .trending-item:nth-child(3) .tr-num { color: #7dd3c8; font-size: 28px; }

                /* Responsive: on mobile squeeze the card a tiny bit */
                @media (max-width: 640px) {
                    .trending-item {
                        height: 160px !important;
                    }
                    .trending-item > div:last-child {
                        width: 120px !important;
                        height: 160px !important;
                    }
                    .tr-num { font-size: 20px; }
                    .trending-item:nth-child(1) .tr-num { font-size: 24px; }
                    .trending-item:nth-child(2) .tr-num { font-size: 22px; }
                    .trending-item:nth-child(3) .tr-num { font-size: 20px; }
                }
            `}</style>
        </section>
    );
};

export default TrendingRow;
