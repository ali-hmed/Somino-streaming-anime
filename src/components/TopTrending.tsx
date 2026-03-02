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
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white shadow-lg">
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
                        className="flex items-center gap-2 bg-primary px-3.5 py-1.5 rounded-lg text-[10px] font-black text-white tracking-widest hover:brightness-110 transition-all shadow-md"
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
                                className="absolute right-0 top-full mt-2 w-32 bg-[#1a1a1e] border border-white/10 rounded-xl shadow-2xl z-[100] overflow-hidden"
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

                                return (
                                    <motion.div
                                        key={anime.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Link
                                            href={`/watch/${anime.id}`}
                                            className="relative flex items-center h-[80px] group cursor-pointer rounded-[8px] overflow-hidden bg-[#161618] border border-white/[0.03] transition-all"
                                        >
                                            {/* Claw Marks Background Overlay */}
                                            {rank <= 3 && (
                                                <div className="absolute inset-x-0 top-0 h-full pointer-events-none opacity-[0.08] mix-blend-screen -translate-x-4">
                                                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                        <path d="M0 20 L40 -20 M15 35 L55 -5 M30 50 L70 10" stroke="#2ECC71" strokeWidth="8" strokeLinecap="round" />
                                                    </svg>
                                                </div>
                                            )}

                                            {/* Rank Circle */}
                                            <div className="flex-shrink-0 w-14 flex items-center justify-center z-10">
                                                <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center bg-white/[0.02] group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                                                    <span className="text-[12px] font-black text-white/90">{rank}</span>
                                                </div>
                                            </div>

                                            {/* Content Area */}
                                            <div className="flex-1 min-w-0 z-10 pl-2">
                                                <h3 className="text-[15px] font-bold text-white transition-colors line-clamp-1 leading-tight tracking-tight pr-22">
                                                    {title}
                                                </h3>

                                                <div className="flex items-center gap-2 mt-2">
                                                    {/* CC Badge */}
                                                    <div className="flex items-center gap-1 bg-[#FF6E9F]/10 text-[#FF6E9F] text-[9px] font-black px-1.5 py-0.5 rounded border border-[#FF6E9F]/30 items-center">
                                                        <MessageSquare size={9} fill="currentColor" /> {anime.subEpisodes || anime.totalEpisodes || (rank + 5)}
                                                    </div>

                                                    {/* Dub Badge */}
                                                    {anime.dubEpisodes > 0 && (
                                                        <div className="flex items-center gap-1 bg-[#53CCB8]/10 text-[#53CCB8] text-[9px] font-black px-1.5 py-0.5 rounded border border-[#53CCB8]/30 items-center">
                                                            <Mic size={9} fill="currentColor" /> {anime.dubEpisodes}
                                                        </div>
                                                    )}

                                                    {/* Score Badge */}
                                                    {anime.score && (
                                                        <div className="flex items-center gap-1 bg-[#FFB941]/10 text-[#FFB941] text-[9px] font-black px-1.5 py-0.5 rounded border border-[#FFB941]/30 items-center">
                                                            <Star size={9} fill="currentColor" /> {anime.score}
                                                        </div>
                                                    )}

                                                    {/* Type */}
                                                    <span className="px-1.5 py-0.5 rounded-[2px] bg-white/[0.03] border border-white/5 text-white/20 text-[8px] font-black tracking-tighter">
                                                        {anime.type || 'tv'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Right Side Image with Fade Overlay */}
                                            <div className="absolute top-0 right-0 h-full w-40 overflow-hidden pointer-events-none flex justify-end">
                                                <img
                                                    src={anime.image}
                                                    alt={title}
                                                    className="h-full w-32 object-cover object-center transition-transform duration-700"
                                                />
                                                {/* Mask Overlay */}
                                                <div
                                                    className="absolute inset-0"
                                                    style={{
                                                        background: 'linear-gradient(to right, #161618 10%, rgba(22,22,24,0.8) 40%, rgba(22,22,24,0.2) 70%, transparent 100%)'
                                                    }}
                                                />
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
