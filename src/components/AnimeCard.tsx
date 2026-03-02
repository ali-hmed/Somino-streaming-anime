"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, X, Mic, MessageSquare, Monitor, RotateCcw, ChevronRight, Star } from 'lucide-react';
import { Anime } from '@/data/anime';
import { getTitle } from '@/types/anime';

interface AnimeCardProps {
    anime: any; // Using any for flexibility with API responses
    variant?: 'portrait' | 'landscape' | 'continue';
    showBroadcast?: boolean;
    isUpcoming?: boolean;
    isSharp?: boolean;
    showEpisode?: boolean;
    showScore?: boolean;
    showPG13?: boolean;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime, variant = 'portrait', showBroadcast = false, isUpcoming = false, isSharp = false, showEpisode = true, showScore = true, showPG13 = false }) => {
    const isPortrait = variant === 'portrait';
    const isContinue = variant === 'continue';
    const id = anime.id;
    const title = getTitle(anime.title);

    const idNum = parseInt(id) || 0;
    const progressPercent = 30 + (idNum % 65);

    const availableEpisodes = anime.availableEpisodes;
    const plannedEpisodes = anime.totalEpisodes;
    const status = anime.status?.toLowerCase() || '';

    const displayEpisodes = (availableEpisodes && availableEpisodes > 0)
        ? availableEpisodes
        : (plannedEpisodes || anime.episodeNumber || 0);

    const subCount = anime.subEpisodes || displayEpisodes;
    const dubCount = anime.dubEpisodes || 0;

    const currentEpisodeNum = anime.episodeNumber || (availableEpisodes && Math.floor(availableEpisodes * 0.4)) || 1;
    const currentTimeStr = "12:00";
    const durationStr = anime.duration?.split(' ')[0] ? `${anime.duration.split(' ')[0]}m` : "24:00";

    const roundedClass = isSharp ? 'rounded-none' : 'rounded-xl';

    if (isContinue) {
        return (
            <Link href={`/watch/${id}`}>
                <motion.div
                    whileHover={{ y: -3 }}
                    className="group cursor-pointer w-full"
                >
                    <div className={`relative aspect-[16/10] ${roundedClass} overflow-hidden border border-white/[0.05] bg-[#1a1a1e] shadow-xl`}>
                        {anime.image && (
                            <img
                                src={anime.image}
                                alt={title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-60"
                            />
                        )}

                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                            <div className="w-full">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black text-white/50 tracking-widest">ep {currentEpisodeNum}</span>
                                    <span className="text-[9px] font-bold text-[#53CCB8]">{currentTimeStr} / {durationStr}</span>
                                </div>
                                <div className={`w-full h-1 bg-white/10 ${isSharp ?'rounded-none' : 'rounded-full'} overflow-hidden`}>
                                    <div
                                        className="h-full bg-[#53CCB8]"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-10 h-10 bg-[#53CCB8] rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                <Play size={18} className="text-black fill-current translate-x-0.5" />
                            </div>
                        </div>

                        {/* Top Left Badges for Continue Watching */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                            {subCount > 0 && (
                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-[#FF6E9F]/10 border border-[#FF6E9F]/30 text-[9px] font-black text-[#FF6E9F] shadow-sm items-center">
                                    <MessageSquare size={9} fill="currentColor" /> {subCount}
                                </div>
                            )}
                            {dubCount > 0 && (
                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-[#53CCB8]/10 border border-[#53CCB8]/30 text-[9px] font-black text-[#53CCB8] shadow-sm items-center">
                                    <Mic size={9} fill="currentColor" /> {dubCount}
                                </div>
                            )}
                        </div>

                        {/* Top Right Score */}
                        {anime.score && showScore && (
                            <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-black/60 backdrop-blur-md border border-white/10 text-[#FFB941] text-[10px] font-black shadow-sm">
                                <Star size={10} fill="currentColor" className="stroke-0" />
                                {anime.score}
                            </div>
                        )}
                    </div>

                    <div className="mt-2.5">
                        <h3 className="text-[12px] font-black text-white group-hover:text-[#53CCB8] transition-colors line-clamp-1 tracking-tight">
                            {title}
                        </h3>
                    </div>
                </motion.div>
            </Link>
        );
    }

    return (
        <Link href={`/watch/${id}`}>
            <motion.div
                whileHover={{ y: -5 }}
                className="group cursor-pointer w-full"
            >
                {/* Image Container */}
                <div className={`relative aspect-[2/3] ${roundedClass} overflow-hidden bg-[#1a1a1e] border border-white/[0.05] shadow-lg mb-3`}>
                    {anime.image ? (
                        <img
                            src={anime.image}
                            alt={title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1e] to-[#252529]" />
                    )}

                    {/* Interaction Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="w-12 h-12 bg-[#53CCB8] rounded-full flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                            <Play size={22} className="text-black fill-current translate-x-0.5" />
                        </div>
                    </div>

                    {/* Left Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                        {(() => {
                            const rating = String(anime.rating || '');
                            if (rating.includes('R') || rating.includes('18') || rating.includes('17')) {
                                return <span className="bg-[#FF4B12] text-white text-[10px] font-black px-1.5 py-0.5 rounded-[2px] shadow-lg tracking-tighter">18+</span>;
                            }
                            if (showPG13 && rating.includes('PG')) {
                                return <span className="bg-[#FF4F18]/10 border border-[#FF4F18]/40 backdrop-blur-md text-[8px] font-black px-1.5 py-0.5 rounded-[2px] text-[#FF4F18] tracking-tight">pg 13</span>;
                            }
                            return null;
                        })()}
                        {anime.episodeNumber && showEpisode && (
                            <span className="bg-black/60 backdrop-blur-md text-white/60 text-[8px] font-black px-1.5 py-0.5 rounded-[2px] border border-white/10 tracking-tighter">
                                ep {anime.episodeNumber}
                            </span>
                        )}
                    </div>

                    {/* Top Right Score */}
                    {anime.score && showScore && (
                        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-black/60 backdrop-blur-md border border-white/10 text-[#FFB941] text-[10px] font-black shadow-sm">
                            <Star size={10} fill="currentColor" className="stroke-0" />
                            {anime.score}
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="space-y-2 px-0.5">
                    <h3 className="text-[13px] font-bold text-white group-hover:text-[#53CCB8] transition-colors line-clamp-2 leading-tight tracking-[0.01em]">
                        {title}
                    </h3>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            {!isUpcoming && (
                                <>
                                    {subCount > 0 && (
                                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-[#FF6E9F]/10 border border-[#FF6E9F]/30 text-[9px] font-black text-[#FF6E9F] items-center">
                                            <MessageSquare size={9} fill="currentColor" />
                                            {subCount}
                                        </div>
                                    )}
                                    {dubCount > 0 && (
                                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-[#53CCB8]/10 border border-[#53CCB8]/30 text-[9px] font-black text-[#53CCB8] items-center">
                                            <Mic size={9} fill="currentColor" />
                                            {dubCount}
                                        </div>
                                    )}
                                </>
                            )}
                            {isUpcoming && (
                                <span className="text-[9px] font-black text-[#53CCB8] tracking-widest leading-none">
                                    {anime.premiered || anime.releaseDate || 'tba'}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded-[2px] bg-white/[0.03] border border-white/5 text-white/20 text-[8px] font-black tracking-tighter">{anime.type || 'tv'}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
};

export default AnimeCard;
