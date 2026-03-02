"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import VideoPlayer from './VideoPlayer';
import { Mic, SkipBack, SkipForward, FastForward, PlayCircle, Moon, Maximize2, Heart, Flag } from 'lucide-react';
import { saveWatchProgress, getAnimeProgress } from '@/lib/watchHistory';

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
    animeTitle: string;
    animeImage: string;
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
    animeTitle,
    animeImage,
}) => {
    const router = useRouter();
    const [server, setServer] = useState<'megaPlay' | 'vidWish'>('megaPlay');
    const [category, setCategory] = useState<'sub' | 'dub'>('sub');
    const [autoNext, setAutoNext] = useState(true);
    const [autoPlay, setAutoPlay] = useState(true);

    // Resume Logic
    const [initialTime, setInitialTime] = useState(0);
    const [sessionStartTime] = useState(Date.now());
    const [hasLoadedProgress, setHasLoadedProgress] = useState(false);

    useEffect(() => {
        const progress = getAnimeProgress(animeId);
        if (progress && progress.episodeId === episodeId) {
            setInitialTime(progress.currentTime || 0);
        }
        setHasLoadedProgress(true);
    }, [animeId, episodeId]);

    // Save progress periodically
    useEffect(() => {
        if (!hasLoadedProgress) return;

        const save = () => {
            const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
            saveWatchProgress({
                animeId,
                animeTitle,
                animeImage,
                episodeId,
                episodeNumber: typeof episodeNumber === 'string' ? parseInt(episodeNumber) || 1 : episodeNumber,
                currentTime: initialTime + elapsed,
                duration: 1440 // Mock duration if unknown (24 mins)
            });
        };

        const interval = setInterval(save, 15000); // Save every 15s for better accuracy
        save(); // Initial save
        return () => clearInterval(interval);
    }, [hasLoadedProgress, animeId, episodeId, initialTime, sessionStartTime, animeTitle, animeImage, episodeNumber]);

    // Watch for messages from the iframe (some players send 'ended' or 'finished')
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const data = event.data;

            // Extremely aggressive detection for 'ended' signals
            let isEnded = false;

            if (typeof data === 'string') {
                const lower = data.toLowerCase();
                // Check common keywords or JSON strings
                if (lower.includes('end') || lower.includes('finish') || lower.includes('complete') || lower.includes('done')) {
                    isEnded = true;
                }
            } else if (typeof data === 'object' && data !== null) {
                // Check all values in the object for 'ended' keywords
                try {
                    const vals = Object.values(data).map(v => String(v).toLowerCase());
                    if (vals.some(v => v.includes('end') || v.includes('finish') || v.includes('complete') || v.includes('done'))) {
                        isEnded = true;
                    }
                } catch (e) { }
            }

            if (isEnded && autoNext && nextEpId) {
                // Short timeout to ensure player is truly done
                setTimeout(() => {
                    // Force a hard reload to ensure autoplay triggers correctly on next page
                    window.location.href = `/watch/${animeId}/${nextEpId}`;
                }, 1000);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [autoNext, nextEpId, animeId]);

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
                />
            )}

            {/* ── Actions bar (Prev / Next / AutoNext etc.) ───── */}
            <div className="px-4 py-2 bg-[#0b0c10]/60 border-b border-white/[0.03] flex items-center justify-between md:justify-center gap-4 md:gap-7 overflow-x-auto no-scrollbar shrink-0">
                <button className="flex items-center gap-2 text-[8.5px] font-bold text-white/40 hover:text-white transition-colors whitespace-nowrap">
                    <Maximize2 size={12} strokeWidth={2.5} /> Expand
                </button>
                <button className="flex items-center gap-2 text-[8.5px] font-bold text-white/40 hover:text-white transition-colors whitespace-nowrap">
                    <Moon size={12} strokeWidth={2.5} /> Focus
                </button>
                <button
                    onClick={() => setAutoNext(!autoNext)}
                    className={`flex items-center gap-2 text-[8.5px] font-bold transition-colors whitespace-nowrap ${autoNext ? 'text-[#FF6331]' : 'text-white/20 hover:text-white/40'}`}
                >
                    <FastForward size={14} className={autoNext ? 'fill-current' : ''} strokeWidth={2.5} /> AutoNext
                </button>
                <button
                    onClick={() => setAutoPlay(!autoPlay)}
                    className={`flex items-center gap-2 text-[8.5px] font-bold transition-colors whitespace-nowrap ${autoPlay ? 'text-primary' : 'text-white/20 hover:text-white/40'}`}
                >
                    <PlayCircle size={13} className={autoPlay ? 'fill-current' : ''} strokeWidth={2.5} /> AutoPlay
                </button>
                <div className="hidden md:block w-px h-3 bg-white/5 mx-1" />
                {prevEpId ? (
                    <Link href={`/watch/${animeId}/${prevEpId}`} className="flex items-center gap-2 text-[8.5px] font-bold text-white/40 hover:text-white transition-colors whitespace-nowrap">
                        <SkipBack size={12} strokeWidth={2.5} /> Prev
                    </Link>
                ) : (
                    <div className="flex items-center gap-2 text-[8.5px] font-bold text-white/10 whitespace-nowrap cursor-not-allowed">
                        <SkipBack size={12} strokeWidth={2.5} /> Prev
                    </div>
                )}
                {nextEpId ? (
                    <Link href={`/watch/${animeId}/${nextEpId}`} className="flex items-center gap-2 text-[8.5px] font-bold text-white/40 hover:text-white transition-colors whitespace-nowrap">
                        <SkipForward size={12} strokeWidth={2.5} /> Next
                    </Link>
                ) : (
                    <div className="flex items-center gap-2 text-[8.5px] font-bold text-white/10 whitespace-nowrap cursor-not-allowed">
                        <SkipForward size={12} strokeWidth={2.5} /> Next
                    </div>
                )}
                <button className="flex items-center gap-2 text-[8.5px] font-bold text-white/40 hover:text-white transition-colors whitespace-nowrap">
                    <Heart size={12} strokeWidth={2.5} /> Bookmark
                </button>
                <button className="flex items-center gap-2 text-[8.5px] font-bold text-white/40 hover:text-white transition-colors whitespace-nowrap">
                    <Flag size={12} strokeWidth={2.5} /> Report
                </button>
            </div>


            {/* ── Desktop Controls Footer ─────────────────────────────── */}
            <div className="bg-[#0b0c10]/20">
                <div className="hidden md:flex p-6 items-center justify-between gap-6">
                    <div className="space-y-1.5">
                        <h4 className="text-[13px] font-black text-white leading-none">
                            you are watching episode {episodeNumber}
                        </h4>
                        <p className="text-[10px] font-medium text-white/20 max-w-[340px] leading-relaxed">
                            if the current server is not working, please try switching to other servers.
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-3.5 shrink-0">
                        {/* Sub / Dub toggles */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCategory('sub')}
                                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[9px] font-black tracking-tighter transition-all ${category === 'sub'
                                    ? 'bg-primary/15 border border-primary/40 text-primary'
                                    : 'bg-white/[0.03] border border-white/5 text-white/20 hover:text-white/50'
                                    }`}
                            >
                                <div className={`w-1.5 h-1.5 rounded-full ${category === 'sub' ? 'bg-primary' : 'bg-white/10'}`} />
                                sub
                            </button>
                            {dubEpisodes > 0 && (
                                <button
                                    onClick={() => setCategory('dub')}
                                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[9px] font-black tracking-tighter transition-all ${category === 'dub'
                                        ? 'bg-[#53CCB8]/15 border border-[#53CCB8]/40 text-[#53CCB8]'
                                        : 'bg-white/[0.03] border border-white/5 text-white/20 hover:text-white/50'
                                        }`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full ${category === 'dub' ? 'bg-[#53CCB8]' : 'bg-white/10'}`} />
                                    dub
                                </button>
                            )}
                        </div>
                        {/* Server toggles */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setServer('megaPlay')}
                                className={`px-5 py-2 font-black text-[10px] rounded-[6px] transition-all shadow-lg active:scale-95 ${server === 'megaPlay'
                                    ? 'bg-[#53CCB8] text-[#0b0c10] shadow-[#53CCB8]/20'
                                    : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'
                                    }`}
                            >
                                server 1
                            </button>
                            <button
                                onClick={() => setServer('vidWish')}
                                className={`px-5 py-2 font-black text-[10px] rounded-[6px] transition-all active:scale-95 ${server === 'vidWish'
                                    ? 'bg-[#53CCB8] text-[#0b0c10] shadow-lg shadow-[#53CCB8]/20'
                                    : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'
                                    }`}
                            >
                                server 2
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Mobile Controls Footer ──────────────────────────── */}
                <div className="flex md:hidden flex-col items-center p-4 px-5 gap-4">
                    {/* Sub / Dub toggles */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setCategory('sub')}
                            className={`flex items-center gap-2 px-2.5 py-1 rounded-full border text-[9px] font-bold transition-colors ${category === 'sub'
                                ? 'bg-primary/10 border-primary/40 text-primary'
                                : 'bg-white/[0.04] border-white/10 text-white/60 hover:text-white'
                                }`}
                        >
                            <div className="px-0.5 rounded-[1px] bg-primary/20 text-primary text-[8px] font-black leading-none">CC</div>
                            sub
                        </button>
                        {dubEpisodes > 0 && (
                            <button
                                onClick={() => setCategory('dub')}
                                className={`flex items-center gap-2 px-2.5 py-1 rounded-full border text-[9px] font-bold transition-colors ${category === 'dub'
                                    ? 'bg-[#53CCB8]/10 border-[#53CCB8]/40 text-[#53CCB8]'
                                    : 'bg-white/[0.04] border-white/10 text-white/60 hover:text-white'
                                    }`}
                            >
                                <Mic size={9} className={category === 'dub' ? 'text-[#53CCB8]' : 'text-[#53CCB8]/60'} />
                                dub
                            </button>
                        )}
                    </div>
                    {/* Server toggles */}
                    <div className="flex items-center justify-center gap-2 w-full max-w-[280px]">
                        <button
                            onClick={() => setServer('megaPlay')}
                            className={`flex-1 py-1.5 font-black text-[9px] rounded-[5px] transition-all active:scale-95 ${server === 'megaPlay'
                                ? 'bg-[#53CCB8] text-[#0b0c10] shadow-lg shadow-[#53CCB8]/10'
                                : 'bg-white/5 text-white/40 border border-white/5'
                                }`}
                        >
                            server 1
                        </button>
                        <button
                            onClick={() => setServer('vidWish')}
                            className={`flex-1 py-1.5 font-black text-[9px] rounded-[5px] transition-all active:scale-95 ${server === 'vidWish'
                                ? 'bg-[#53CCB8] text-[#0b0c10] shadow-lg shadow-[#53CCB8]/10'
                                : 'bg-white/5 text-white/40 border border-white/5'
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

                    {/* Next Episode Banner */}
                    {animeStatus?.toLowerCase() === 'currently airing' && (
                        <div className="w-full mt-2 p-3 rounded-[10px] bg-gradient-to-br from-[#53CCB8]/10 via-[#53CCB8]/5 to-transparent border border-[#53CCB8]/10 flex flex-col items-center justify-center text-center">
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
