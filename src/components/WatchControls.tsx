"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import VideoPlayer from './VideoPlayer';
import { Mic, SkipBack, SkipForward, FastForward, PlayCircle, Moon, Maximize2, Flag, MessageSquare, Heart } from 'lucide-react';
import WatchControlsWatchlist from './WatchControlsWatchlist';
import { saveWatchProgress, getAnimeProgress } from '@/lib/watchHistory';
import { getUserSettings, saveUserSettings, UserSettings } from '@/lib/settings';

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
}) => {
    const router = useRouter();
    const { user, setWatchHistory } = useAuthStore();
    const [server, setServer] = useState<'megaPlay' | 'vidWish'>('megaPlay');
    const [category, setCategory] = useState<'sub' | 'dub'>('sub');
    const [autoNext, setAutoNext] = useState(false);
    const [autoPlay, setAutoPlay] = useState(true);

    // Resume Logic
    const [initialTime, setInitialTime] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [hasLoadedProgress, setHasLoadedProgress] = useState(false);

    // Use a ref for the exact current time to avoid stale closures in save intervals
    const currentProgressRef = useRef(0);

    // Initial Load of Settings
    useEffect(() => {
        const settings = getUserSettings();
        setAutoNext(settings.autoNext);
        setAutoPlay(settings.autoPlay);

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
    }, [animeId, episodeId]);

    useEffect(() => {
        if (hasLoadedProgress) return;

        // Find progress in user's remote watch history first, then fallback to local
        const remoteProgress = user?.watchHistory?.find(item => item.animeId === animeId && item.episodeId === episodeId);
        const localProgress = getAnimeProgress(animeId);

        let savedTime = 0;

        if (remoteProgress) {
            savedTime = remoteProgress.currentTime || 0;
        } else if (!user && localProgress && localProgress.episodeId === episodeId) {
            savedTime = localProgress.currentTime || 0;
        }

        if (savedTime > 0) {
            setInitialTime(savedTime || 0.1); // Small offset to avoid 0 check issues
            setCurrentTime(savedTime);
            currentProgressRef.current = savedTime;
        }

        // Only set loaded if we have the history data (for logged in users) or if guest
        if (user === null || user?.watchHistory !== undefined) {
            setHasLoadedProgress(true);
        }
    }, [animeId, episodeId, user?.watchHistory, hasLoadedProgress, initialTime]);

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

    // Handle incoming time updates from the player (skips, seeks, etc.)
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
        // We only trust '0' if we genuinely have no previous progress OR if the video has played/jumped.
        if (newTime === 0 && currentProgressRef.current > 5) {
            // Likely an initial status message from the player starting up.
            return;
        }

        if (newTime >= 0) {
            setCurrentTime(newTime);
            currentProgressRef.current = newTime;

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
            {/* Video Player — self-contained 16:9 aspect ratio, no buttons inside */}
            {hasLoadedProgress && (
                <VideoPlayer
                    id={id}
                    episodeId={episodeId}
                    streamUrl={null}
                    server={server}
                    category={category}
                    autoPlay={autoPlay}
                    startTime={initialTime}
                    onProgress={handleProgress}
                />
            )}

            {/* ── Actions bar (Prev / Next / AutoNext etc.) ───── */}
            <div className="px-4 md:px-5 py-2.5 bg-background/60 flex items-center justify-between md:justify-center gap-4 md:gap-8 shrink-0 relative z-20 overflow-visible">
                <button className="flex items-center gap-2 text-[8.5px] font-bold text-white/40 hover:text-white transition-colors whitespace-nowrap">
                    <Maximize2 size={12} strokeWidth={2.5} /> Expand
                </button>
                <button className="flex items-center gap-2 text-[8.5px] font-bold text-white/40 hover:text-white transition-colors whitespace-nowrap">
                    <Moon size={12} strokeWidth={2.5} /> Focus
                </button>
                <button
                    onClick={() => {
                        const newState = !autoNext;
                        setAutoNext(newState);
                        saveUserSettings({ autoNext: newState });
                    }}
                    className={`flex items-center gap-2 text-[8.5px] font-bold transition-colors whitespace-nowrap ${autoNext ? 'text-[#FF6331]' : 'text-white/20 hover:text-white/40'}`}
                >
                    <FastForward size={14} className={autoNext ? 'fill-current' : ''} strokeWidth={2.5} /> AutoNext
                </button>
                <button
                    onClick={() => {
                        const newState = !autoPlay;
                        setAutoPlay(newState);
                        saveUserSettings({ autoPlay: newState });
                    }}
                    className={`flex items-center gap-2 text-[8.5px] font-bold transition-colors whitespace-nowrap ${autoPlay ? 'text-primary' : 'text-white/20 hover:text-white/40'}`}
                >
                    <PlayCircle size={13} className={autoPlay ? 'fill-current' : ''} strokeWidth={2.5} /> AutoPlay
                </button>
                <div className="hidden md:block w-px h-3 bg-white/5 mx-1" />
                {prevEpId ? (
                    <button
                        onClick={() => onEpisodeChange?.(prevEpId)}
                        disabled={isLoading}
                        className="flex items-center gap-2 text-[8.5px] font-bold text-white/40 hover:text-white transition-colors whitespace-nowrap disabled:opacity-20"
                    >
                        <SkipBack size={12} strokeWidth={2.5} /> Prev
                    </button>
                ) : (
                    <div className="flex items-center gap-2 text-[8.5px] font-bold text-white/10 whitespace-nowrap cursor-not-allowed">
                        <SkipBack size={12} strokeWidth={2.5} /> Prev
                    </div>
                )}
                {nextEpId ? (
                    <button
                        onClick={() => onEpisodeChange?.(nextEpId)}
                        disabled={isLoading}
                        className="flex items-center gap-2 text-[8.5px] font-bold text-white/40 hover:text-white transition-colors whitespace-nowrap disabled:opacity-20"
                    >
                        <SkipForward size={12} strokeWidth={2.5} /> Next
                    </button>
                ) : (
                    <div className="flex items-center gap-2 text-[8.5px] font-bold text-white/10 whitespace-nowrap cursor-not-allowed">
                        <SkipForward size={12} strokeWidth={2.5} /> Next
                    </div>
                )}
                <WatchControlsWatchlist
                    animeId={animeId}
                    animeTitle={animeTitle}
                    animeImage={animeImage}
                />
                <button className="flex items-center gap-2 text-[8.5px] font-bold text-white/40 hover:text-white transition-colors whitespace-nowrap">
                    <Flag size={12} strokeWidth={2.5} /> Report
                </button>
            </div>

            {/* ── Desktop Controls Footer ─────────────────────────────── */}
            <div className="bg-background/20">
                <div className="hidden md:flex p-6 items-center justify-between gap-6">
                    <div className="space-y-1.5">
                        <h4 className="text-[12px] font-black text-white leading-none">
                            you are watching episode {episodeNumber}
                        </h4>
                        <p className="text-[9px] font-medium text-white/20 max-w-[340px] leading-relaxed">
                            if the current server is not working, please try switching to other servers.
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-3.5 shrink-0">
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
                <div className="flex md:hidden flex-col items-center p-4 px-5 gap-4">
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
