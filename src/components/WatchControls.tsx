"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import VideoPlayer from './VideoPlayer';
import { 
    Mic, SkipBack, SkipForward, FastForward, CirclePlay, Moon, Maximize2, Minimize2, Flag, MessageSquare, Heart, Scissors, Bug 
} from 'lucide-react';
import WatchControlsWatchlist from './WatchControlsWatchlist';
import { saveWatchProgress, getAnimeProgress } from '@/lib/watchHistory';
import { getUserSettings, saveUserSettings, UserSettings } from '@/lib/settings';
import { fetchEpisodeStreamingLinks } from '@/lib/consumet';

import { motion, AnimatePresence } from 'framer-motion';

interface WatchControlsProps {
    id: string;
    episodeId: string;
    episodeNumber: number | string;
    animeStatus?: string;
    broadcastString?: string;
    prevEpId?: string;
    nextEpId?: string;
    animeId: string;
    dubEpisodes?: number;
    subEpisodes?: number;
    animeTitle: string;
    animeImage: string;
    onEpisodeChange?: (newId: string) => void;
    isLoading?: boolean;
    isFocusMode?: boolean;
    onToggleFocus?: () => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

const WatchControls: React.FC<WatchControlsProps> = ({
    id,
    episodeId,
    episodeNumber,
    animeStatus,
    broadcastString,
    prevEpId,
    nextEpId,
    animeId,
    dubEpisodes = 0,
    subEpisodes = 0,
    animeTitle,
    animeImage,
    onEpisodeChange,
    isLoading = false,
    isFocusMode = false,
    onToggleFocus,
    isExpanded,
    onToggleExpand,
}) => {
    const router = useRouter();
    const { user, setWatchHistory } = useAuthStore();
    const [server, setServer] = useState<'megaPlay' | 'vidWish'>('megaPlay');
    const [category, setCategory] = useState<'sub' | 'dub'>('sub');
    const [autoNext, setAutoNext] = useState(false);
    const [autoPlay, setAutoPlay] = useState(true);
    const [autoSkip, setAutoSkip] = useState(false);

    // Resume Logic
    const [initialTime, setInitialTime] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [hasLoadedProgress, setHasLoadedProgress] = useState(false);

    // Use a ref for the exact current time to avoid stale closures in save intervals
    const currentProgressRef = useRef(0);
    const [introData, setIntroData] = useState<{ start: number; end: number } | null>(null);
    const hasSkippedIntro = useRef(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [skipKey, setSkipKey] = useState(0); // Used to force player re-mount on hard skip
    const [streamData, setStreamData] = useState<any>(null);
    const [isStreamLoading, setIsStreamLoading] = useState(true);

    // Initial Load of Settings
    useEffect(() => {
        const settings = getUserSettings();
        setAutoNext(settings.autoNext);
        setAutoPlay(settings.autoPlay);
        setAutoSkip(settings.autoSkip);

        // Sub/Dub Preference Logic:
        // Do not override user choice if it exists
        const stored = localStorage.getItem('somino_user_settings');
        if (stored) {
            setCategory(settings.preferredCategory);
            setServer(settings.lastServer);
        } else {
            // First time logic: 
            // If anime has dub only episodes (no sub), load dub by default
            if (subEpisodes === 0 && dubEpisodes > 0) {
                setCategory('dub');
            } else {
                setCategory('sub');
            }
            setServer('megaPlay');
        }
    }, [subEpisodes, dubEpisodes]);

    useEffect(() => {
        // Reset progress states when episode changes
        setHasLoadedProgress(false);
        setInitialTime(0);
        setCurrentTime(0);
        currentProgressRef.current = 0;
        hasSkippedIntro.current = false;
        setIntroData(null);
        setStreamData(null);
        setIsStreamLoading(true);

        // Fetch Stream and Intro/Outro data
        const loadStreamData = async () => {
            try {
                // Map frontend server names to API server names
                const apiServer = server === 'megaPlay' ? 'HD-1' : 'vidWish';
                const data = await fetchEpisodeStreamingLinks(episodeId, apiServer, category);
                
                if (data) {
                    setStreamData(data);
                    if (data.intro) {
                        setIntroData({
                            start: parseInt(data.intro.start) || 0,
                            end: parseInt(data.intro.end) || 0
                        });
                        console.log(`Intro found for ${episodeId}: ${data.intro.start} - ${data.intro.end}`);
                    }
                }
            } catch (err) {
                console.warn('Failed to fetch stream data');
            } finally {
                setIsStreamLoading(false);
            }
        };
        loadStreamData();
    }, [animeId, episodeId, category, server]);

    useEffect(() => {
        if (hasLoadedProgress) return;

        // 1. Try remote history first if user is logged in
        const remoteProgress = user?.watchHistory?.find(item => item.animeId === animeId && item.episodeId === episodeId);
        
        // 2. Try local history (always check as fallback)
        const localProgress = getAnimeProgress(animeId);

        let savedTime = 0;

        if (remoteProgress) {
            savedTime = remoteProgress.currentTime || 0;
            console.log(`Resuming from remote history: ${savedTime}s (Ep: ${episodeId})`);
        } else if (localProgress && localProgress.episodeId === episodeId) {
            savedTime = localProgress.currentTime || 0;
            console.log(`Resuming from local history: ${savedTime}s (Ep: ${episodeId})`);
        }

        if (savedTime > 0) {
            setInitialTime(savedTime || 0.1);
            setCurrentTime(savedTime);
            currentProgressRef.current = savedTime;
        }

        // Only set loaded if we have the history data (for logged in users) or if guest
        if (user === null || user?.watchHistory !== undefined) {
            setHasLoadedProgress(true);
        }
    }, [animeId, episodeId, user?.watchHistory, hasLoadedProgress]);

    // Timer to estimate progress (one source of truth: local state synced with player)
    useEffect(() => {
        if (!hasLoadedProgress) return;

        const interval = setInterval(() => {
            setCurrentTime(prev => {
                const updated = prev + 1;
                currentProgressRef.current = updated;
                return updated;
            });
        }, 1000);

        // Periodically save to localStorage & backend
        const saveInterval = setInterval(async () => {
            const updated = await saveWatchProgress({
                animeId,
                animeTitle,
                animeImage,
                episodeId,
                episodeNumber: typeof episodeNumber === 'string' ? parseInt(episodeNumber) || 1 : episodeNumber,
                currentTime: currentProgressRef.current,
                duration: 1440 // 24 mins fallback
            }, user?.token);

            if (updated && user?.token) {
                setWatchHistory(updated);
            }
        }, 5000);

        return () => {
            clearInterval(interval);
            clearInterval(saveInterval);
            // Final save on unmount or navigation
            saveWatchProgress({
                animeId,
                animeTitle,
                animeImage,
                episodeId,
                episodeNumber: typeof episodeNumber === 'string' ? parseInt(episodeNumber) || 1 : episodeNumber,
                currentTime: currentProgressRef.current,
                duration: 1440
            }, user?.token);
        };
    }, [hasLoadedProgress, animeId, episodeId, animeTitle, animeImage, episodeNumber, user?.token]);

    // Dedicated Effect for Auto-Detecting and Triggering Skips
    useEffect(() => {
        if (!autoSkip || !introData || hasSkippedIntro.current || !hasLoadedProgress) return;

        // Check if current time is within intro range (with a small buffer)
        if (currentTime >= introData.start && currentTime < introData.end - 1) {
            console.log("AutoSkip Triggered: Jumping to", introData.end);
            
            // 1. Mark as skipped locally
            hasSkippedIntro.current = true;

            // 2. Perform 'Hard Skip' - update initial time and force player reload
            setInitialTime(introData.end);
            currentProgressRef.current = introData.end;
            setCurrentTime(introData.end);
            setSkipKey(prev => prev + 1);
        }
    }, [currentTime, autoSkip, introData, hasLoadedProgress]);

    const handleSkipIntro = (toTime: number) => {
        // Manual 'Hard Skip'
        setInitialTime(toTime);
        currentProgressRef.current = toTime;
        setCurrentTime(toTime);
        hasSkippedIntro.current = true;
        setSkipKey(prev => prev + 1);
    };

    // Handle incoming time updates from the player (skips, seeks, etc.)
    const handleProgress = (newTime: number, duration: number) => {
        // Server fallback logic
        if (newTime === -1) {
            if (server === 'megaPlay') {
                console.log('Server 1 failed, trying Server 2');
                setServer('vidWish');
            }
            return;
        }

        // PREVENTION: Don't let an initial '0' from the iframe clobber our resume point!
        if (newTime === 0 && currentProgressRef.current > 5) return;

        if (newTime >= 0) {
            // Only update if it's a significant change to avoid jitter with the local timer
            if (Math.abs(newTime - currentProgressRef.current) >= 1) {
                setCurrentTime(newTime);
                currentProgressRef.current = newTime;
            }

            // Immediate save on player update to ensure skips are caught
            const syncProgress = async () => {
                const updated = await saveWatchProgress({
                    animeId,
                    animeTitle,
                    animeImage,
                    episodeId,
                    episodeNumber: typeof episodeNumber === 'string' ? parseInt(episodeNumber) || 1 : episodeNumber,
                    currentTime: newTime,
                    duration: duration || 1440
                }, user?.token);

                if (updated && user?.token) {
                    setWatchHistory(updated);
                }
            };
            syncProgress();
        }
    };

    // Watch for messages from the iframe (some players send 'ended' or 'finished')
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const data = event.data;

            // Extremely aggressive detection for 'ended' signals
            let isEnded = false;

            if (typeof data === 'string') {
                const lower = data.toLowerCase();
                if (lower.includes('end') || lower.includes('finish') || lower.includes('complete') || lower.includes('done')) {
                    isEnded = true;
                }
            } else if (typeof data === 'object' && data !== null) {
                try {
                    const vals = Object.values(data).map(v => String(v).toLowerCase());
                    if (vals.some(v => v.includes('end') || v.includes('finish') || v.includes('complete') || v.includes('done'))) {
                        isEnded = true;
                    }
                } catch (e) { }
            }

            if (isEnded && autoNext && nextEpId) {
                setTimeout(() => {
                    if (onEpisodeChange) {
                        onEpisodeChange(nextEpId);
                    } else {
                        router.push(`/watch/${animeId}/${nextEpId}`);
                    }
                }, 1000);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [autoNext, nextEpId, animeId, router]);

    return (
        <>
            {/* 1. Video Player & Centering Logic with Framer Motion Layout Animation */}
            <div className={`transition-colors duration-700 ${isFocusMode 
                ? 'fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-12 bg-black/60 pointer-events-none' 
                : 'relative z-10 w-full mb-0'}`}>
                
                <motion.div 
                    layout
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 30,
                        mass: 0.8
                    }}
                    className={`relative group/player shadow-2xl transition-shadow duration-700 ${isFocusMode 
                        ? 'w-full max-w-[900px] aspect-video shadow-[0_0_120px_rgba(0,0,0,1)] pointer-events-auto' 
                        : 'w-full h-full pointer-events-auto'}`}
                >
                    {hasLoadedProgress && !isStreamLoading && (
                        <VideoPlayer
                            key={`${episodeId}-${server}-${category}-${skipKey}`}
                            id={id}
                            episodeId={episodeId}
                            streamUrl={streamData?.iframeLink || streamData?.link?.file}
                            server={server}
                            category={category}
                            autoPlay={autoPlay}
                            startTime={initialTime}
                            playerRef={iframeRef}
                            onProgress={handleProgress}
                        />
                    )}

                    {/* PREMIUM SKIP INTRO OVERLAY (Crunchyroll Style) */}
                    <AnimatePresence>
                        {introData && currentTime >= introData.start && currentTime < introData.end && (
                            <motion.button
                                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                                onClick={() => handleSkipIntro(introData.end)}
                                className="absolute bottom-20 right-8 z-[200] flex items-center gap-3 px-6 py-3 bg-primary text-background font-black text-[12px] uppercase tracking-widest rounded-[4px] shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] hover:scale-110 active:scale-95 transition-transform"
                            >
                                <Scissors size={16} strokeWidth={3} />
                                Skip Intro
                            </motion.button>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>


            {/* ── Actions bar (Prev / Next / AutoNext etc.) ───── */}
            <div className={`px-2 md:px-5 py-1 ${isExpanded ? 'md:py-3.5 lg:gap-14 md:gap-10' : 'md:py-2.5 md:gap-5'} flex items-center justify-center gap-1 sm:gap-3 shrink-0 relative border-b border-white/[0.03] transition-all duration-500 ${isFocusMode ? 'z-[90] opacity-20 pointer-events-none' : 'z-20 opacity-100'}`}>
                {/* Blurred Background Image Container */}
                <div className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none">
                    <img 
                        src={animeImage} 
                        className="absolute inset-0 w-full h-full object-cover blur-xl scale-125 opacity-60"
                        alt="" 
                    />
                    <div className="absolute inset-0 bg-[#0F1115]/85 backdrop-blur-sm" />
                </div>

                {/* 1. Expansion Controls */}
                <div className="flex items-center gap-1.5 md:gap-4 mr-0.5 md:mr-2">
                    <button 
                        onClick={onToggleExpand}
                        className={`hidden md:flex items-center gap-2 font-bold transition-colors whitespace-nowrap ${isExpanded ? 'text-primary md:text-[10px]' : 'text-white/40 hover:text-white text-[8.5px]'}`}
                    >
                        {isExpanded ? (
                            <Minimize2 className="w-4 h-4" strokeWidth={2.5} />
                        ) : (
                            <Maximize2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                        )}
                        <span>{isExpanded ? 'Reduce' : 'Expand'}</span>
                    </button>
                    <button 
                        onClick={onToggleFocus}
                        className={`flex items-center justify-center w-7 h-7 md:w-auto md:h-auto gap-2 font-bold transition-colors whitespace-nowrap ${isFocusMode ? 'text-primary' : 'text-white/40 hover:text-white'} ${isExpanded ? 'md:text-[10px] text-[8.5px]' : 'text-[8.5px]'}`}
                        title={isFocusMode ? 'Unfocus' : 'Focus'}
                    >
                        <Moon className={`w-[14px] h-[14px] ${isExpanded ? 'md:w-4 md:h-4' : 'md:w-3.5 md:h-3.5'} ${isFocusMode ? 'fill-primary/10' : ''}`} strokeWidth={2.5} /> 
                        <span className="hidden md:inline">{isFocusMode ? 'Unfocus' : 'Focus'}</span>
                    </button>
                </div>

                <div className="hidden md:block w-px h-4 bg-white/5 mx-1" />

                {/* 2. Automation Toggles */}
                <div className="flex items-center gap-2 sm:gap-3 md:gap-5">
                    <button
                        onClick={() => {
                            const newState = !autoNext;
                            setAutoNext(newState);
                            saveUserSettings({ autoNext: newState });
                        }}
                        className={`flex items-center justify-center w-7 h-7 md:w-auto md:h-auto gap-2 font-bold transition-colors whitespace-nowrap ${autoNext ? 'text-primary' : 'text-white/20 hover:text-white/40'} ${isExpanded ? 'md:text-[10px] text-[8.5px]' : 'text-[8.5px]'}`}
                        title="Auto Next Episode"
                    >
                        <FastForward className={`w-[14px] h-[14px] ${isExpanded ? 'md:w-4 md:h-4' : 'md:w-3.5 md:h-3.5'} ${autoNext ? 'fill-current' : ''}`} strokeWidth={2.5} /> 
                        <span className="hidden md:inline">AutoNext</span>
                    </button>

                    <button
                        onClick={() => {
                            const newState = !autoPlay;
                            setAutoPlay(newState);
                            saveUserSettings({ autoPlay: newState });
                        }}
                        className={`flex items-center justify-center w-7 h-7 md:w-auto md:h-auto gap-2 font-bold transition-colors whitespace-nowrap ${autoPlay ? 'text-primary' : 'text-white/20 hover:text-white/40'} ${isExpanded ? 'md:text-[10px] text-[8.5px]' : 'text-[8.5px]'}`}
                        title="Auto Play"
                    >
                        <CirclePlay className={`w-[14px] h-[14px] ${isExpanded ? 'md:w-4 md:h-4' : 'md:w-[13px] md:h-[13px]'} ${autoPlay ? 'fill-primary/10' : ''}`} strokeWidth={2.2} /> 
                        <span className="hidden md:inline">AutoPlay</span>
                    </button>

                    {/* Skip Intro Button (Contextual) */}
                    <button
                        onClick={() => {
                            if (introData && currentTime >= introData.start && currentTime < introData.end) {
                                handleSkipIntro(introData.end);
                            } else {
                                const newState = !autoSkip;
                                setAutoSkip(newState);
                                saveUserSettings({ autoSkip: newState });
                            }
                        }}
                        className={`flex items-center justify-center w-7 h-7 md:w-auto md:h-auto gap-2 font-bold transition-colors whitespace-nowrap ${
                            (autoSkip || (introData && currentTime >= introData.start && currentTime < introData.end)) 
                            ? 'text-primary' 
                            : 'text-white/20 hover:text-white/40'
                        } ${isExpanded ? 'md:text-[10px] text-[8.5px]' : 'text-[8.5px]'}`}
                        title={introData && currentTime >= introData.start && currentTime < introData.end ? "Skip Intro Now" : "Toggle Auto Skip"}
                    >
                        <Scissors className={`w-[14px] h-[14px] ${isExpanded ? 'md:w-4 md:h-4' : 'md:w-3.5 md:h-3.5'} ${(autoSkip || (introData && currentTime >= introData.start && currentTime < introData.end)) ? 'fill-primary/5' : ''}`} strokeWidth={2.5} />
                        <span className="hidden md:inline">
                            {introData && currentTime >= introData.start && currentTime < introData.end ? "Skip Intro" : "AutoSkip"}
                        </span>
                    </button>
                </div>

                <div className="w-px h-4 bg-white/5 mx-0.5" />

                {/* 3. Navigation Controls */}
                <div className="flex items-center gap-2 sm:gap-3 md:gap-5">
                    {prevEpId ? (
                        <button
                            onClick={() => onEpisodeChange?.(prevEpId)}
                            disabled={isLoading}
                            className={`flex items-center justify-center w-7 h-7 md:w-auto md:h-auto gap-2 font-bold text-white/40 hover:text-white transition-colors whitespace-nowrap disabled:opacity-20 ${isExpanded ? 'md:text-[10px] text-[8.5px]' : 'text-[8.5px]'}`}
                        >
                            <SkipBack className={`w-3.5 h-3.5 ${isExpanded ? 'md:w-4 md:h-4' : 'md:w-3 md:h-3'}`} strokeWidth={2.5} /> 
                            <span className="hidden md:inline">Prev</span>
                        </button>
                    ) : (
                        <div className={`flex items-center justify-center w-7 h-7 md:w-auto md:h-auto gap-2 font-bold text-white/10 whitespace-nowrap cursor-not-allowed ${isExpanded ? 'md:text-[10px] text-[8.5px]' : 'text-[8.5px]'}`}>
                            <SkipBack className={`w-3.5 h-3.5 ${isExpanded ? 'md:w-4 md:h-4' : 'md:w-3 md:h-3'}`} strokeWidth={2.5} /> 
                            <span className="hidden md:inline">Prev</span>
                        </div>
                    )}

                    {nextEpId ? (
                        <button
                            onClick={() => onEpisodeChange?.(nextEpId)}
                            disabled={isLoading}
                            className={`flex items-center justify-center w-7 h-7 md:w-auto md:h-auto gap-2 font-bold text-white/40 hover:text-white transition-colors whitespace-nowrap disabled:opacity-20 ${isExpanded ? 'md:text-[10px] text-[8.5px]' : 'text-[8.5px]'}`}
                        >
                            <SkipForward className={`w-3.5 h-3.5 ${isExpanded ? 'md:w-4 md:h-4' : 'md:w-3 md:h-3'}`} strokeWidth={2.5} /> 
                            <span className="hidden md:inline">Next</span>
                        </button>
                    ) : (
                        <div className={`flex items-center justify-center w-7 h-7 md:w-auto md:h-auto gap-2 font-bold text-white/10 whitespace-nowrap cursor-not-allowed ${isExpanded ? 'md:text-[10px] text-[8.5px]' : 'text-[8.5px]'}`}>
                            <SkipForward className={`w-3.5 h-3.5 ${isExpanded ? 'md:w-4 md:h-4' : 'md:w-3 md:h-3'}`} strokeWidth={2.5} /> 
                            <span className="hidden md:inline">Next</span>
                        </div>
                    )}
                </div>

                <div className="w-px h-4 bg-white/5 mx-0.5" />

                {/* 4. Utilities (Bookmark / Report) */}
                <div className="flex items-center gap-2 sm:gap-3 md:gap-5">
                    <WatchControlsWatchlist
                        animeId={animeId}
                        animeTitle={animeTitle}
                        animeImage={animeImage}
                        isExpanded={isExpanded}
                    />

                    <button className={`flex items-center justify-center w-7 h-7 md:w-auto md:h-auto gap-2 font-bold text-white/40 hover:text-white transition-colors whitespace-nowrap ${isExpanded ? 'md:text-[10px] text-[8.5px]' : 'text-[8.5px]'}`}>
                        <Bug className={`w-3.5 h-3.5 ${isExpanded ? 'md:w-4 md:h-4' : 'md:w-3 md:h-3'}`} strokeWidth={2.5} /> 
                        <span className="hidden md:inline">Report</span>
                    </button>
                </div>
            </div>

            {/* ── Desktop Controls Footer ─────────────────────────────── */}
            <div className="bg-background/20">
                <div className="hidden md:flex px-6 py-3 items-center justify-between gap-6">
                    <div className="space-y-1.5">
                        <h4 className="text-[12px] font-black text-white leading-none">
                            you are watching episode {episodeNumber}
                        </h4>
                        <p className="text-[9px] font-medium text-white/20 max-w-[340px] leading-relaxed">
                            if the current server is not working, please try switching to other servers.
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    setCategory('sub');
                                    saveUserSettings({ preferredCategory: 'sub' });
                                }}
                                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[9px] font-black tracking-tighter transition-all ${category === 'sub'
                                    ? 'bg-primary/15 text-primary'
                                    : 'bg-white/[0.03] text-white/20 hover:text-white/50'
                                    }`}
                            >
                                <div className={`w-1.5 h-1.5 rounded-full ${category === 'sub' ? 'bg-primary' : 'bg-white/10'}`} />
                                sub
                            </button>
                            {dubEpisodes > 0 && (
                                <button
                                    onClick={() => {
                                        setCategory('dub');
                                        saveUserSettings({ preferredCategory: 'dub' });
                                    }}
                                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[9px] font-black tracking-tighter transition-all ${category === 'dub'
                                        ? 'bg-[#53CCB8]/15 text-[#53CCB8]'
                                    : 'bg-white/[0.03] text-white/20 hover:text-white/50'
                                    }`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full ${category === 'dub' ? 'bg-[#53CCB8]' : 'bg-white/10'}`} />
                                    dub
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    setServer('megaPlay');
                                    saveUserSettings({ lastServer: 'megaPlay' });
                                }}
                                className={`px-5 py-2 font-black text-[9px] rounded-[4px] transition-all active:scale-95 ${server === 'megaPlay'
                                    ? 'bg-[#53CCB8] text-[#0b0c10]'
                                    : 'bg-white/5 text-white/40 hover:bg-white/10'
                                    }`}
                            >
                                server 1
                            </button>
                            <button
                                onClick={() => {
                                    setServer('vidWish');
                                    saveUserSettings({ lastServer: 'vidWish' });
                                }}
                                className={`px-5 py-2 font-black text-[9px] rounded-[4px] transition-all active:scale-95 ${server === 'vidWish'
                                    ? 'bg-[#53CCB8] text-[#0b0c10]'
                                    : 'bg-white/5 text-white/40 hover:bg-white/10'
                                    }`}
                            >
                                server 2
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Mobile Controls Footer ──────────────────────────── */}
                <div className="flex md:hidden flex-col items-center py-2 px-5 gap-2">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                setCategory('sub');
                                saveUserSettings({ preferredCategory: 'sub' });
                            }}
                            className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-[9px] font-bold transition-colors ${category === 'sub'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-white/[0.04] text-white/60 hover:text-white'
                                }`}
                        >
                            <div className="px-0.5 rounded-[1px] bg-primary/20 text-primary text-[8px] font-black leading-none">SUB</div>
                            sub
                        </button>
                        {dubEpisodes > 0 && (
                            <button
                                onClick={() => {
                                    setCategory('dub');
                                    saveUserSettings({ preferredCategory: 'dub' });
                                }}
                                className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-[9px] font-bold transition-colors ${category === 'dub'
                                    ? 'bg-[#53CCB8]/10 text-[#53CCB8]'
                                : 'bg-white/[0.04] text-white/60 hover:text-white'
                                }`}
                            >
                                <Mic size={9} className={category === 'dub' ? 'text-[#53CCB8]' : 'text-[#53CCB8]/60'} />
                                dub
                            </button>
                        )}
                    </div>
                    <div className="flex items-center justify-center gap-2 w-full max-w-[280px]">
                        <button
                            onClick={() => {
                                setServer('megaPlay');
                                saveUserSettings({ lastServer: 'megaPlay' });
                            }}
                            className={`flex-1 py-1.5 font-black text-[9px] rounded-[5px] transition-all active:scale-95 ${server === 'megaPlay'
                                ? 'bg-[#53CCB8] text-[#0b0c10]'
                                : 'bg-white/5 text-white/40'
                                }`}
                        >
                            server 1
                        </button>
                        <button
                            onClick={() => {
                                setServer('vidWish');
                                saveUserSettings({ lastServer: 'vidWish' });
                            }}
                            className={`flex-1 py-1.5 font-black text-[9px] rounded-[5px] transition-all active:scale-95 ${server === 'vidWish'
                                ? 'bg-[#53CCB8] text-[#0b0c10]'
                                : 'bg-white/5 text-white/40'
                                }`}
                        >
                            server 2
                        </button>
                    </div>
                    <div className="space-y-1 text-center mt-1">
                        <h4 className="text-[13px] font-black text-white/90 tracking-tight leading-none">
                            you are watching episode {episodeNumber}
                        </h4>
                        <p className="text-[9px] font-medium text-white/20 max-w-[280px] leading-relaxed mx-auto">
                            if the current server is not working, please try switching to other servers.
                        </p>
                    </div>

                    {animeStatus?.toLowerCase() === 'currently airing' && (
                        <div className="w-full mt-2 p-3 rounded-[10px] bg-gradient-to-br from-[#53CCB8]/10 via-[#53CCB8]/5 to-transparent flex flex-col items-center justify-center text-center">
                            <p className="text-[9px] font-bold text-white/30 mb-0.5 tracking-[0.1em] leading-none">
                                the next episode is expected to be released on
                            </p>
                            <p className="text-[10px] font-black text-[#53CCB8]">
                                {broadcastString || 'to be announced'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default WatchControls;
