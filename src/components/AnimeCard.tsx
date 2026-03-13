"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mic, RotateCcw, Star, Info, Play } from 'lucide-react';
import { getTitle } from '@/types/anime';
import { usePopupStore } from '@/store/popupStore';
import AnimeInfoPopup from './AnimeInfoPopup';

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

const AnimeCard: React.FC<AnimeCardProps> = ({ 
    anime, 
    variant = 'portrait', 
    showBroadcast = false, 
    isUpcoming = false, 
    isSharp = false, 
    showEpisode = true, 
    showScore = true, 
    showPG13 = false 
}) => {
    const { activeId, setActiveId } = usePopupStore();
    const isPortrait = variant === 'portrait';
    const isContinue = variant === 'continue';
    const id = anime.id;
    const title = getTitle(anime.title);

    const [popupSide, setPopupSide] = React.useState<'left' | 'right'>('right');
    const cardRef = React.useRef<HTMLDivElement>(null);

    const handleInfoBtnClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Determine side based on screen position
        const x = e.clientX;
        const screenWidth = window.innerWidth;
        setPopupSide(x > screenWidth / 2 ? 'left' : 'right');

        if (activeId === id) {
            setActiveId(null);
        } else {
            setActiveId(id);
        }
    };

    const isPopupVisible = activeId === id;

    // Close popup on Escape key or Click Outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isPopupVisible && cardRef.current && !cardRef.current.contains(event.target as Node)) {
                setActiveId(null);
            }
        };
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActiveId(null); };

        if (isPopupVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        window.addEventListener('keydown', onKey);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('keydown', onKey);
        };
    }, [isPopupVisible, setActiveId]);

    const progressPercent = anime.currentTime && anime.duration
        ? Math.min(Math.round((anime.currentTime / anime.duration) * 100), 100)
        : 0;

    const availableEpisodes = anime.availableEpisodes;
    const plannedEpisodes = anime.totalEpisodes;
    
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
            <div 
                className="relative w-full group" 
            >
                
                <Link href={directLink} className="group cursor-pointer block">
                    <div className="w-full">
                        {/* Poster with badges */}
                        <div className={`relative aspect-video ${roundedClass} overflow-hidden bg-card mb-3`}>
                            {displayImage && !imgError ? (
                                <img
                                    src={displayImage}
                                    alt=""
                                    onError={() => setImgError(true)}
                                    className="absolute inset-0 w-full h-full object-cover"
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
                    </div>
                </Link>

                
            </div>
        );
    }

    return (
        <div 
            ref={cardRef}
            className="relative w-full group" 
            style={{ zIndex: isPopupVisible ? 100 : 1 }}
        >
            <AnimeInfoPopup anime={anime} isVisible={isPopupVisible} side={popupSide} />
            
            <Link href={`/watch/${id}`} className="block group cursor-pointer">
                <div className="w-full">
                    {/* Image Container */}
                    <div className={`relative aspect-[3/4] ${roundedClass} overflow-hidden bg-card mb-3`}>
                        {displayImage && !imgError ? (
                            <img
                                src={displayImage}
                                alt={title}
                                onError={() => setImgError(true)}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-[#1B1F2A] to-[#151821] flex flex-col items-center justify-center p-4">
                                 <RotateCcw className="text-white/10 mb-2" size={24} />
                                 <span className="text-[10px] font-bold text-white/20 text-center line-clamp-2 px-2">
                                     {title}
                                 </span>
                            </div>
                        )}

                        {/* Episode badge */}
                        {anime.episodeNumber && showEpisode && (
                            <div className="absolute bottom-9 left-2 z-10">
                                <span className="bg-black/60 backdrop-blur-md text-white/60 text-[8px] font-black px-1.5 py-0.5 rounded-[2px] tracking-tighter">
                                    EP {anime.episodeNumber}
                                </span>
                            </div>
                        )}

                        {/* Top Right: 18+ badge + Score */}
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

                    <div className="space-y-2 px-0.5">
                        <h3 className="text-[12px] lg:text-[13px] font-bold text-white group-hover:text-[#53CCB8] transition-colors truncate leading-tight tracking-[0.01em]">
                            {title}
                        </h3>

                        <div className="flex items-center justify-between gap-1 overflow-hidden">
                            <div className="flex items-center gap-1 min-w-0">
                                {!isUpcoming && (
                                    <>
                                        {subCount > 0 && (
                                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-pink/10 text-[9px] font-black text-pink shrink-0 border border-pink/20">
                                                <div className="flex items-center justify-center bg-pink text-background rounded-[1px] px-0.5 text-[7px] leading-none h-2.5 font-black">CC</div>
                                                {subCount}
                                            </div>
                                        )}
                                        {dubCount > 0 && (
                                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-primary/10 text-[9px] font-black text-primary shrink-0 border border-primary/20">
                                                <Mic size={9} fill="currentColor" />
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
                </div>
            </Link>

            {/* Info Button (Top Left) */}
            <div className={`absolute top-2 left-2 z-[20] transition-opacity duration-300 pointer-events-none ${isPopupVisible ? 'opacity-100' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100'}`}>
                <button 
                    onClick={handleInfoBtnClick}
                    className={`w-8 h-8 lg:w-7 lg:h-7 text-white rounded-full flex items-center justify-center transition-all active:scale-95 pointer-events-auto ${isPopupVisible ? 'bg-primary/90' : 'bg-primary hover:bg-primary/80'}`}
                    title="Show info"
                >
                    <Info size={16} className="lg:w-3.5 lg:h-3.5" strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
};

export default AnimeCard;
