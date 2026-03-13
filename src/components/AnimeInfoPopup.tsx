"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Play, Plus, Mic, Check, Loader2, Trash2, BookmarkPlus } from 'lucide-react';
import Link from 'next/link';
import { getTitle } from '@/types/anime';
import { useAuthStore } from '@/store/authStore';
import { usePopupStore } from '@/store/popupStore';

interface AnimeInfoPopupProps {
    anime: any;
    isVisible: boolean;
    side?: 'left' | 'right';
}

const STATUS_OPTIONS = ['Watching', 'Planned', 'Completed', 'Dropped', 'On-Hold'] as const;
type WatchlistStatus = (typeof STATUS_OPTIONS)[number];

const AnimeInfoPopup: React.FC<AnimeInfoPopupProps> = ({ anime, isVisible, side = 'right' }) => {
    const { user, isAuthenticated, setWatchlist, setAuthModalOpen } = useAuthStore();
    const { setActiveId } = usePopupStore();
    const [isListOpen, setIsListOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!anime) return null;

    const title = getTitle(anime.title);
    const bannerImage = anime.bannerImage || anime.image || anime.poster || anime.cover;

    const subCount = anime.subEpisodes || anime.sub || 0;
    const dubCount = anime.dubEpisodes || anime.dub || 0;
    const totalEpisodes = anime.totalEpisodes || anime.episodeNumber || 0;

    const itemInList = user?.watchlist?.find((item: any) => item.animeId === anime.id);
    const currentStatus = itemInList?.status;

    const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030') + '/api/v1';

    const handleUpdateStatus = async (status: WatchlistStatus, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) { setAuthModalOpen(true); return; }
        setIsLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/auth/watchlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.token}` },
                body: JSON.stringify({ animeId: anime.id, animeTitle: title, animeImage: bannerImage, status })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success) setWatchlist(data.data);
            }
        } catch { /* silent */ }
        finally { setIsLoading(false); setIsListOpen(false); }
    };

    const handleRemove = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/auth/watchlist/${anime.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user?.token}` }
            });
            const data = await res.json();
            if (data.success) setWatchlist(data.data);
        } catch { /* silent */ }
        finally { setIsLoading(false); setIsListOpen(false); }
    };

    return (
        <>
            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isMobile && isVisible && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveId(null);
                        }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
                    />
                )}
            </AnimatePresence>

            <motion.div
                initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, x: side === 'right' ? -10 : 10 }}
                animate={isVisible
                    ? (isMobile ? { y: 0 } : { opacity: 1, scale: 1, x: 0 })
                    : (isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, x: side === 'right' ? -10 : 10 })
                }
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`${isMobile ? 'fixed inset-x-0 bottom-0 z-[120] w-full rounded-t-2xl' : 'absolute z-[100] w-[260px] rounded-[10px]'} bg-[#1a1a1ae6] backdrop-blur-xl overflow-hidden pointer-events-auto border border-white/5 shadow-2xl`}
                style={{
                    left: !isMobile ? (side === 'right' ? '50% ' : 'auto') : '0',
                    right: !isMobile ? (side === 'left' ? '50%' : 'auto') : '0',
                    top: !isMobile ? '0' : 'auto',
                    marginLeft: !isMobile ? (side === 'right' ? '10px' : '0') : '0',
                    marginRight: !isMobile ? (side === 'left' ? '10px' : '0') : '0',
                    display: isVisible ? 'block' : (isMobile ? 'block' : 'none')
                }}
            >
                {/* Mobile Handle */}
                {isMobile && (
                    <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mt-3 mb-1" />
                )}
                <div className="p-4 space-y-3">
                    {/* Title */}
                    <h3 className="text-[15px] font-bold text-white leading-tight tracking-tight">
                        {title}
                    </h3>

                    {/* Badges Row */}
                <div className="flex items-center gap-1 flex-wrap">
                    <div className="flex items-center gap-1 text-white text-[12px] font-bold mr-2">
                        <Star size={12} fill="#FFB941" className="text-[#FFB941] stroke-0" />
                        {anime.score || '7.5'}
                    </div>
                    
                    <div className="flex items-center gap-1">
                        <span className="bg-[#FFB941] text-[#1a1a1a] text-[9px] font-bold px-1.5 py-[1px] rounded-l-[3px] uppercase">HD</span>
                        
                        {subCount > 0 && (
                            <div className="flex items-center gap-1 bg-[#FF6E9F] text-[#1a1a1a] text-[9px] font-bold px-1 py-[1px]">
                                <div className="flex items-center justify-center text-[8px] rounded-[1px] leading-none h-3 font-bold">CC</div>
                                {subCount}
                            </div>
                        )}
                        
                        {dubCount > 0 && (
                            <div className="flex items-center gap-1 bg-[#53CCB8] text-[#1a1a1a] text-[9px] font-bold px-1 py-[1px]">
                                <Mic size={9} fill="currentColor" />
                                {dubCount}
                            </div>
                        )}
                        
                        <span className="bg-[#7F7F7F] text-white text-[9px] font-bold px-1.5 py-[1px] rounded-r-[3px]">
                            {totalEpisodes}
                        </span>
                    </div>

                    <span className="ml-auto bg-[#53CCB8] text-[#1a1a1a] text-[9px] font-bold px-1.5 py-[1px] rounded-[2px] uppercase">
                        {anime.type || 'TV'}
                    </span>
                </div>

                    {/* Description */}
                    <p className="text-[12px] text-white/50 leading-snug line-clamp-3">
                        {anime.description?.replace(/<[^>]*>/g, '') || 'No description available for this series.'}
                    </p>

                    {/* Info Rows */}
                    <div className="space-y-[3px] mt-1">
                        <div className="flex text-[11.5px]">
                            <span className="text-white/40 w-[68px] shrink-0">Japanese:</span>
                            <span className="text-white/80 line-clamp-1">{anime.japaneseTitle || 'Unknown'}</span>
                        </div>
                        <div className="flex text-[11.5px]">
                            <span className="text-white/40 w-[68px] shrink-0">Synonyms:</span>
                            <span className="text-white/80 line-clamp-1 truncate">{anime.synonyms?.join(', ') || 'Unknown'}</span>
                        </div>
                        <div className="flex text-[11.5px]">
                            <span className="text-white/40 w-[68px] shrink-0">Aired:</span>
                            <span className="text-white/80">{anime.releaseDate || 'Unknown'}</span>
                        </div>
                        <div className="flex text-[11.5px]">
                            <span className="text-white/40 w-[68px] shrink-0">Status:</span>
                            <span className="text-white/80">{anime.status || 'Unknown'}</span>
                        </div>
                        {anime.genres && anime.genres.length > 0 && (
                            <div className="flex text-[11.5px]">
                                <span className="text-white/40 w-[68px] shrink-0">Genres:</span>
                                <div className="flex flex-wrap gap-0.5 text-white/80">
                                    {anime.genres.slice(0, 4).map((g: string, i: number) => (
                                        <span key={i}>{g}{i < Math.min(anime.genres.length, 4) - 1 ? ', ' : ''}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Section */}
                    <div className="flex items-center gap-2 pt-2">
                        {/* Watch Now — goes to watch page */}
                        <Link
                            href={`/watch/${anime.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-[#1a1a1a] font-bold text-[13px] py-2 rounded-full transition-all active:scale-95"
                        >
                            <Play size={13} fill="currentColor" />
                            Watch now
                        </Link>

                        {/* Watchlist Dropdown Button */}
                        <div className="relative shrink-0" ref={dropdownRef}>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (!isAuthenticated) { setAuthModalOpen(true); return; }
                                    setIsListOpen(prev => !prev);
                                }}
                                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all active:scale-95 ${currentStatus
                                        ? 'bg-primary text-[#1a1a1a]'
                                        : 'bg-white text-black hover:bg-white/90'
                                    }`}
                                title={currentStatus ? `Status: ${currentStatus}` : 'Add to Watchlist'}
                            >
                                {isLoading
                                    ? <Loader2 size={16} className="animate-spin" />
                                    : currentStatus
                                        ? <BookmarkPlus size={16} />
                                        : <Plus size={20} strokeWidth={3} />
                                }
                            </button>

                            {/* Dropdown */}
                            <AnimatePresence>
                                {isListOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 4, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 4, scale: 0.97 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute bottom-full right-0 mb-2 w-[150px] bg-[#222] rounded-xl overflow-hidden z-50 p-1.5 border border-white/5"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    >
                                        <div className="flex flex-col gap-0.5">
                                            {STATUS_OPTIONS.map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={(e) => handleUpdateStatus(status, e)}
                                                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${currentStatus === status
                                                            ? 'bg-primary/10 text-primary'
                                                            : 'text-white/40 hover:bg-white/5 hover:text-white'
                                                        }`}
                                                >
                                                    {status}
                                                    {currentStatus === status && <Check size={11} />}
                                                </button>
                                            ))}
                                            {currentStatus && (
                                                <button
                                                    onClick={handleRemove}
                                                    className="flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-bold text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all mt-0.5 border-t border-white/5 pt-1.5"
                                                >
                                                    Remove
                                                    <Trash2 size={11} />
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default AnimeInfoPopup;

