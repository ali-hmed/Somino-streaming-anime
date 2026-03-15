"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Play, Plus, Mic, Check, Loader2, Trash2, BookmarkPlus } from 'lucide-react';
import Link from 'next/link';
import { getTitle } from '@/types/anime';
import { useAuthStore } from '@/store/authStore';
import { usePopupStore } from '@/store/popupStore';
import { fetchAnimeInfo } from '@/lib/consumet';
import { getAnimeProgress } from '@/lib/watchHistory';
import { API_URL } from '@/lib/api';
import WatchlistToast, { WatchlistToastStatus } from './WatchlistToast';

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
    const [toast, setToast] = useState<WatchlistToastStatus>(null);
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = (status: WatchlistToastStatus) => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToast(status);
        toastTimerRef.current = setTimeout(() => setToast(null), 3200);
    };
    const [isMobile, setIsMobile] = useState(false);
    const [fullInfo, setFullInfo] = useState<any>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Reset fullInfo when anime changes
    useEffect(() => {
        setFullInfo(null);
    }, [anime?.id]);

    // Fetch full details when visible
    useEffect(() => {
        if (isVisible && anime?.id && !fullInfo && !isDetailLoading) {
            // Only fetch if description or key info is missing
            const needsFetch = !anime.description || !anime.japaneseTitle || !anime.releaseDate;
            
            if (needsFetch) {
                const fetchDetails = async () => {
                    setIsDetailLoading(true);
                    try {
                        const data = await fetchAnimeInfo(anime.id);
                        if (data) setFullInfo(data);
                    } catch (err) {
                        console.error('Failed to fetch anime details:', err);
                    } finally {
                        setIsDetailLoading(false);
                    }
                };
                fetchDetails();
            }
        }
    }, [isVisible, anime?.id, fullInfo, isDetailLoading]);

    if (!anime) return null;

    const displayData = fullInfo || anime;
    const title = getTitle(displayData.title);
    const bannerImage = displayData.bannerImage || displayData.image || displayData.poster || displayData.cover;

    const subCount = displayData.subEpisodes || displayData.sub || 0;
    const dubCount = displayData.dubEpisodes || displayData.dub || 0;
    const totalEpisodes = displayData.totalEpisodes || displayData.episodeNumber || 0;

    const itemInList = user?.watchlist?.find((item: any) => item.animeId === anime.id);
    const currentStatus = itemInList?.status;

    const handleUpdateStatus = async (status: WatchlistStatus, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) { setAuthModalOpen(true); return; }
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/watchlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.token}` },
                body: JSON.stringify({ animeId: anime.id, animeTitle: title, animeImage: bannerImage, status })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setWatchlist(data.data);
                    showToast(status);
                }
            }
        } catch { /* silent */ }
        finally { setIsLoading(false); setIsListOpen(false); }
    };

    const handleRemove = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/watchlist/${anime.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user?.token}` }
            });
            const data = await res.json();
            if (data.success) {
                setWatchlist(data.data);
                showToast('Removed');
            }
        } catch { /* silent */ }
        finally { setIsLoading(false); setIsListOpen(false); }
    };

    return (
        <>
            {/* Main Popup Content with AnimatePresence */}
            <AnimatePresence>
                {isVisible && (
                    <>
                        {/* Mobile Backdrop */}
                        {isMobile && (
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

                        <motion.div
                            initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, x: side === 'right' ? -10 : 10 }}
                            animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, x: 0 }}
                            exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, x: side === 'right' ? -10 : 10 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className={`${isMobile ? 'fixed inset-x-0 bottom-0 z-[120] w-full rounded-t-2xl' : 'absolute z-[100] w-[260px] rounded-[10px]'} bg-[#1a1a1ae6] backdrop-blur-xl overflow-hidden pointer-events-auto border border-white/5 shadow-2xl`}
                            style={{
                                left: !isMobile ? (side === 'right' ? '50% ' : 'auto') : '0',
                                right: !isMobile ? (side === 'left' ? '50%' : 'auto') : '0',
                                top: !isMobile ? '0' : 'auto',
                                marginLeft: !isMobile ? (side === 'right' ? '10px' : '0') : '0',
                                marginRight: !isMobile ? (side === 'left' ? '10px' : '0') : '0',
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
                    <div className="min-h-[50px] relative">
                        {isDetailLoading && !displayData.description && (
                            <div className="absolute inset-0 flex items-center gap-2 text-[11px] text-white/20 italic">
                                <Loader2 size={12} className="animate-spin" />
                                <span>Loading details...</span>
                            </div>
                        )}
                        {displayData.description && (
                            <p className="text-[12px] text-white/50 leading-snug line-clamp-3">
                                {displayData.description?.replace(/<[^>]*>/g, '')}
                            </p>
                        )}
                        {!isDetailLoading && !displayData.description && (
                            <p className="text-[12px] text-white/20 italic">
                                No description available.
                            </p>
                        )}
                    </div>

                    {/* Info Rows */}
                    <div className="space-y-[3px] mt-1">
                        {displayData.japaneseTitle && displayData.japaneseTitle !== 'Unknown' && (
                            <div className="flex text-[11.5px]">
                                <span className="text-white/40 w-[68px] shrink-0">Japanese:</span>
                                <span className="text-white/80 line-clamp-1">{displayData.japaneseTitle}</span>
                            </div>
                        )}
                        {displayData.synonyms && displayData.synonyms.length > 0 && (
                            <div className="flex text-[11.5px]">
                                <span className="text-white/40 w-[68px] shrink-0">Synonyms:</span>
                                <span className="text-white/80 line-clamp-1 truncate">
                                    {Array.isArray(displayData.synonyms) ? displayData.synonyms.join(', ') : displayData.synonyms}
                                </span>
                            </div>
                        )}
                        {displayData.releaseDate && displayData.releaseDate !== 'Unknown' && (
                            <div className="flex text-[11.5px]">
                                <span className="text-white/40 w-[68px] shrink-0">Aired:</span>
                                <span className="text-white/80">{displayData.releaseDate}</span>
                            </div>
                        )}
                        {displayData.status && displayData.status !== 'Unknown' && (
                            <div className="flex text-[11.5px]">
                                <span className="text-white/40 w-[68px] shrink-0">Status:</span>
                                <span className="text-white/80">{displayData.status}</span>
                            </div>
                        )}
                        {displayData.genres && displayData.genres.length > 0 && (
                            <div className="flex text-[11.5px]">
                                <span className="text-white/40 w-[68px] shrink-0">Genres:</span>
                                <div className="flex flex-wrap gap-0.5 text-white/80">
                                    {displayData.genres.slice(0, 4).map((g: any, i: number) => (
                                        <span key={i}>{typeof g === 'string' ? g : g.name}{i < Math.min(displayData.genres.length, 4) - 1 ? ', ' : ''}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Section */}
                    <div className="flex items-center gap-2 pt-2">
                        {/* Watch Now — goes to watch page with resume logic */}
                        {(() => {
                            const lastEpId = (() => {
                                if (isAuthenticated && user?.watchHistory) {
                                    const remote = user.watchHistory.find(i => i.animeId === anime.id);
                                    if (remote) return remote.episodeId;
                                }
                                const local = getAnimeProgress(anime.id);
                                if (local) return local.episodeId;
                                return null;
                            })();

                            const watchLink = lastEpId ? `/watch/${anime.id}/${lastEpId}` : `/watch/${anime.id}`;
                            const isResume = !!lastEpId;

                            return (
                                <Link
                                    href={watchLink}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`flex-1 flex items-center justify-center gap-2 ${isResume ? 'bg-[#53CCB8]' : 'bg-primary'} hover:opacity-90 text-[#1a1a1a] font-bold text-[13px] py-2 rounded-full transition-all active:scale-95`}
                                >
                                    <Play size={13} fill="currentColor" />
                                    {isResume ? 'Resume' : 'Watch now'}
                                </Link>
                            );
                        })()}

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
                )}
            </AnimatePresence>

            {/* Toast Notification */}
            <WatchlistToast
                status={toast}
                animeTitle={title}
                onClose={() => setToast(null)}
            />
        </>
    );
};

export default AnimeInfoPopup;

