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
    const progressPercent = anime.currentTime && anime.duration
        ? Math.min(Math.round((anime.currentTime / anime.duration) * 100), 100)
        : 0;

    const availableEpisodes = anime.availableEpisodes;
    const plannedEpisodes = anime.totalEpisodes;
    const status = anime.status?.toLowerCase() || '';

    const displayEpisodes = (availableEpisodes && availableEpisodes > 0)
        ? availableEpisodes
        : (plannedEpisodes || anime.episodeNumber || 0);

    const subCount = anime.subEpisodes || anime.sub || displayEpisodes || anime.episodeNumber || 0;
    const dubCount = anime.dubEpisodes || anime.dub || 0;

    const currentEpisodeNum = anime.episodeNumber || (availableEpisodes && Math.floor(availableEpisodes * 0.4)) || 1;

    const minutes = Math.floor((anime.currentTime || 0) / 60);
    const seconds = Math.floor((anime.currentTime || 0) % 60);
    const currentTimeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const durationMinutes = Math.floor((anime.duration || 1440) / 60);
    const durationSeconds = Math.floor((anime.duration || 1440) % 60);
    const durationStr = `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;

    const [imgError, setImgError] = React.useState(false);
    const roundedClass = isSharp ? 'rounded-none' : 'rounded-xl';
    const displayImage = anime.image || anime.animeImage || anime.poster || anime.cover;

    if (isContinue) {
        const directLink = `/watch/${id}/${anime.episodeId || id}`;
        return (
            <Link href={directLink}>
                <motion.div
                    whileHover={{ y: -3 }}
                    className="group cursor-pointer w-full"
                >
                    {/* Poster with badges */}
                    <div className={`relative aspect-video ${roundedClass} overflow-hidden bg-card mb-3`}>
                        {displayImage && !imgError ? (
                            <img
                                src={displayImage}
                                alt=""
                                onError={() => setImgError(true)}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-[#1B1F2A] to-[#151821] flex flex-col items-center justify-center p-4">
                                <RotateCcw className="text-white/10 mb-2" size={24} />
                                <span className="text-[10px] font-bold text-white/20 text-center line-clamp-2 px-2">
                                    {title}
                                </span>
                            </div>
                        )}

                        {/* Top Right 18+ Badge */}
                        {(() => {
                            const rating = String(anime.rating || '');
                            const rUpper = rating.toUpperCase();
                            if (rating === 'R' || rUpper.includes('R+') || rUpper.includes('RX') || rUpper.includes('HENTAI') || rating.includes('R -') || anime.is18 || anime.isAdult) {
                                return <span className="absolute top-1.5 right-1.5 z-10 bg-[#e5534b] text-white text-[9px] font-black px-1.5 py-0.5 rounded-[3px] pointer-events-none">18+</span>;
                            }
                            return null;
                        })()}

                        {/* Hover Play Button */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-10 h-10 bg-[#FF6E9F] rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
                                <Play size={18} className="text-white fill-current translate-x-0.5" />
                            </div>
                        </div>

                        {/* Progress Bar Overlaid on Image Bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40 overflow-hidden">
                            <div
                                className="h-full bg-[#FF6E9F] transition-all duration-300"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>

                    {/* Metadata Section */}
                    <div className="space-y-1 content-start px-0.5">
                        <h3 className="text-[13px] font-bold text-white group-hover:text-[#FF6E9F] transition-colors truncate leading-none mb-1.5">
                            {title}
                        </h3>
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-black text-white/30">EP {currentEpisodeNum}</span>
                                <div className="w-1 h-1 rounded-full bg-white/10" />
                                <span className="text-[10px] font-black text-[#FF6395]">{currentTimeStr}</span>
                            </div>
                            <span className="text-[10px] font-black text-white/20">{durationStr}</span>
                        </div>
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
                <div className={`relative aspect-[2/3] ${roundedClass} overflow-hidden bg-card mb-3`}>
                    {displayImage ? (
                        <img
                            src={displayImage}
                            alt={title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1B1F2A] to-[#151821]" />
                    )}

                    {/* Interaction Overlay (only if aired) */}
                    {!(anime.status?.toLowerCase() === 'not yet aired' || anime.status?.toLowerCase() === 'upcoming') && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="w-12 h-12 bg-[#53CCB8] rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                <Play size={22} className="text-black fill-current translate-x-0.5" />
                            </div>
                        </div>
                    )}

                    {/* Left Badges (episode number) */}
                    {anime.episodeNumber && showEpisode && (
                        <div className="absolute top-2 left-2 z-10">
                            <span className="bg-black/60 backdrop-blur-md text-white/60 text-[8px] font-black px-1.5 py-0.5 rounded-[2px] tracking-tighter">
                                EP {anime.episodeNumber}
                            </span>
                        </div>
                    )}

                    {/* Top Right: 18+ badge + Score stacked */}
                    <div className="absolute top-1.5 right-1.5 z-10 flex flex-col items-end gap-1 pointer-events-none">
                        {(() => {
                            const rating = String(anime.rating || '');
                            const rUpper = rating.toUpperCase();
                            if (rating === 'R' || rUpper.includes('R+') || rUpper.includes('RX') || rUpper.includes('HENTAI') || rating.includes('R -') || anime.is18 || anime.isAdult) {
                                return <span className="bg-[#e5534b] text-white text-[9px] font-black px-1.5 py-0.5 rounded-[3px]">18+</span>;
                            }
                            return null;
                        })()}
                        {anime.score && showScore && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-black/60 backdrop-blur-md text-[#FFB941] text-[10px] font-black">
                                <Star size={10} fill="currentColor" className="stroke-0" />
                                {anime.score}
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="space-y-2 px-0.5">
                    <h3 className="text-[13px] font-bold text-white group-hover:text-[#53CCB8] transition-colors truncate leading-tight tracking-[0.01em]">
                        {title}
                    </h3>

                    <div className="flex items-center justify-between gap-1 overflow-hidden">
                        <div className="flex items-center gap-1 min-w-0">
                            {!isUpcoming && (
                                <>
                                    {subCount > 0 && (
                                        <div className="flex items-center gap-0.5 px-1 py-0.5 rounded-[2px] bg-[#FF6E9F]/10 text-[9px] font-black text-[#FF6E9F] shrink-0">
                                            <MessageSquare size={8} fill="currentColor" />
                                            {subCount}
                                        </div>
                                    )}
                                    {dubCount > 0 && (
                                        <div className="flex items-center gap-0.5 px-1 py-0.5 rounded-[2px] bg-[#53CCB8]/10 text-[9px] font-black text-[#53CCB8] shrink-0">
                                            <Mic size={8} fill="currentColor" />
                                            {dubCount}
                                        </div>
                                    )}
                                </>
                            )}
                            {isUpcoming && (
                                <span className="text-[9px] font-black text-[#53CCB8] tracking-widest leading-none">
                                    {anime.premiered || anime.releaseDate || 'TBA'}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded-[2px] bg-white/5 text-white/50 text-[8px] font-black uppercase tracking-wider">{anime.type || 'tv'}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
};

export default AnimeCard;
