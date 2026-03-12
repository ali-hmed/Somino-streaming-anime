"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Mic, ChevronDown, MessageSquare, Star } from 'lucide-react';
import { getTitle } from '@/types/anime';
import Link from 'next/link';
import { mapCustomToAnime } from '@/lib/consumet';

type Timeframe = 'today' | 'week' | 'month';

interface TopTrendingProps {
    trendingData?: Record<string, any[]>;
}

const TopTrending: React.FC<TopTrendingProps> = ({ trendingData = {} }) => {
    const [timeframe, setTimeframe] = useState<Timeframe>('today');
    const [animeList, setAnimeList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        const data = trendingData[timeframe] || [];
        setAnimeList(data.map(mapCustomToAnime).slice(0, 10));
        setIsLoading(false);
    }, [timeframe, trendingData]);

    const timeframes: { id: Timeframe; label: string }[] = [
        { id: 'today', label: 'DAY' },
        { id: 'week', label: 'WEEK' },
        { id: 'month', label: 'MONTH' }
    ];

    const currentLabel = timeframes.find(t => t.id === timeframe)?.label || 'MONTH';

    return (
        <div className="sidebar-container rounded-[8px] p-2.5">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white">
                        <Trophy size={18} fill="currentColor" />
                    </div>
                    <h2 className="text-[17px] font-black text-white tracking-tight">
                        Top Trending
                    </h2>
                </div>

                {/* Dropdown Selector */}
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 bg-primary px-3.5 py-1.5 rounded-lg text-[10px] font-black text-white tracking-widest hover:brightness-110 transition-all"
                    >
                        {currentLabel}
                        <ChevronDown size={14} className={`transition-transform duration-200 ${isDropdownOpen ?'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 top-full mt-2 w-32 bg-[#181818] rounded-xl z-[100] overflow-hidden"
                            >
                                {timeframes.map((tf) => (
                                    <button
                                        key={tf.id}
                                        onClick={() => {
                                            setTimeframe(tf.id);
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 text-[10px] font-black tracking-widest transition-colors ${timeframe === tf.id ?'bg-primary text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                    >
                                        {tf.label}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* List */}
            <div className="space-y-3 relative min-h-[400px]">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={timeframe}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-1"
                        >
                            {animeList.map((anime, index) => {
                                const title = getTitle(anime.title);
                                const rank = index + 1;

                                // Colors for the outlined numbers - Using site theme
                                const getRankColor = (r: number) => {
                                    if (r === 1) return '#53CCB8'; // Site Primary
                                    if (r === 2) return '#FF6E9F'; // Site Pink
                                    if (r === 3) return '#FFB941'; // Site Gold
                                    return 'rgba(255,255,255,0.08)'; // Muted
                                };

                                const rankColor = getRankColor(rank);

                                return (
                                    <motion.div
                                        key={anime.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Link
                                            href={`/watch/${anime.id}`}
                                            className="flex items-center gap-3 py-3.5 group cursor-pointer border-b border-white/[0.03] last:border-0 hover:bg-white/[0.01] transition-all pr-2"
                                        >
                                            {/* Rank Number (Stylish Outline) */}
                                            <div className="flex-shrink-0 w-11 text-center">
                                                <span 
                                                    className="text-4xl font-black italic select-none tracking-tighter transition-all duration-300 group-hover:scale-110 block"
                                                    style={{ 
                                                        WebkitTextStroke: `1.5px ${rankColor}`,
                                                        color: 'transparent',
                                                        fontFamily: 'system-ui, sans-serif',
                                                        filter: rank <= 3 ? `drop-shadow(0 0 8px ${rankColor}33)` : 'none',
                                                        opacity: rank <= 3 ? 1 : 0.6
                                                    }}
                                                >
                                                    {rank}
                                                </span>
                                            </div>

                                            {/* Small Stylish Poster */}
                                            <div className="flex-shrink-0 w-[52px] h-[70px] rounded-[4px] overflow-hidden bg-white/5 relative group-hover:shadow-[0_0_15px_rgba(83,204,184,0.15)] transition-all duration-300">
                                                <img
                                                    src={anime.image}
                                                    alt={title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>

                                            {/* Info Area */}
                                            <div className="flex-1 min-w-0 ml-1">
                                                <h3 className="text-[15px] font-bold text-white group-hover:text-primary transition-colors line-clamp-1 leading-[1.3] mb-3 font-display tracking-tight">
                                                    {title}
                                                </h3>

                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {/* CC Badge - Pink (Sub) */}
                                                    <div className="flex items-center gap-1.5 bg-pink/10 text-pink text-[9px] font-black px-1.5 py-0.5 rounded-[6px] border border-pink/30">
                                                        <div className="flex items-center justify-center bg-pink text-background rounded-[2px] px-0.5 text-[7px] leading-none h-2.5">CC</div>
                                                        <span>{anime.subEpisodes || anime.totalEpisodes || '?'}</span>
                                                    </div>

                                                    {/* Dub Badge - Primary (Dub) */}
                                                    {anime.dubEpisodes > 0 && (
                                                        <div className="flex items-center gap-1.5 bg-primary/10 text-primary text-[9px] font-black px-1.5 py-0.5 rounded-[6px] border border-primary/30">
                                                            <Mic size={10} fill="currentColor" /> 
                                                            <span>{anime.dubEpisodes}</span>
                                                        </div>
                                                    )}

                                                    {/* Type - TV/Movie */}
                                                    <div className="flex items-center gap-1 text-white/40 text-[10px] font-bold uppercase tracking-wider ml-auto">
                                                        <span>{anime.type || 'TV'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default TopTrending;
