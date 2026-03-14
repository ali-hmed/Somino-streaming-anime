"use client";

import React from 'react';

interface VideoPlayerProps {
    id: string;
    episodeId: string;
    streamUrl: string | null;
    server?: string;
    category?: 'sub' | 'dub';
    autoPlay?: boolean;
    startTime?: number; // in seconds
    isFocusMode?: boolean;
    playerRef?: React.RefObject<HTMLIFrameElement | null>;
    onProgress?: (currentTime: number, duration: number) => void;
}

const VideoPlayer = ({
    id,
    episodeId,
    streamUrl,
    server = 'MegaCloud',
    category = 'sub',
    autoPlay = true,
    startTime = 0,
    isFocusMode = false,
    playerRef,
    onProgress,
}: VideoPlayerProps) => {
    // Listen for messages from the iframe player
    React.useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const data = event.data;
            if (!data) return;

            let currentTime: number | null = null;
            let duration: number | null = null;

            if (typeof data === 'string') {
                const lower = data.toLowerCase();
                // Check for error signals
                if (lower.includes('error') || lower.includes('failed') || lower.includes('not found') || lower.includes('limit')) {
                    onProgress?.(-1, 0); // Use -1 to signal error to parent
                }
                return;
            }

            if (typeof data === 'object') {
                // Try to find currentTime and duration in various common spots
                currentTime = data.currentTime ?? data.time ?? data.seconds ?? data.data?.currentTime ?? data.data?.time;
                duration = data.duration ?? data.totalTime ?? data.data?.duration ?? data.data?.totalTime;

                // Check for error in object attributes
                if (data.event === 'error' || data.type === 'error' || data.error) {
                    onProgress?.(-1, 0);
                    return;
                }

                // If it's a "seeked" or "timeupdate" event, we extract the values
                if (currentTime !== null && onProgress) {
                    onProgress(Number(currentTime), Number(duration || 0));
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onProgress]);
    // Extract hash from current episodeId (handles both "ID::ep=number" and raw hash IDs)
    const decodedEpisodeId = decodeURIComponent(episodeId);
    let epHash = decodedEpisodeId.includes('ep=')
        ? decodedEpisodeId.split('ep=').pop()
        : decodedEpisodeId.split(/::|-/).pop();

    if (!epHash || epHash === '') epHash = '1';

    // if (!streamUrl) {
    //     return (
    //         <div className={`w-full bg-[#0b0c0f] flex items-center justify-center rounded-xl overflow-hidden border border-white/5 transition-all duration-700 ${isFocusMode ? 'aspect-video' : 'h-[250px] md:h-full'}`} key={episodeId + server + category}>
    //             <div className="flex flex-col items-center gap-5 text-center p-8 max-w-sm">
    //                 <div className="relative">
    //                     <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
    //                     <img src="/miku-not-found.png" alt="Loading" className="w-32 h-auto relative drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] opacity-40 grayscale" />
    //                 </div>
    //                 <div className="space-y-2">
    //                     <p className="text-primary text-[11px] font-black uppercase tracking-[0.3em] animate-pulse">Establishing Connection...</p>
    //                     <p className="text-white/20 text-[10px] leading-relaxed">If this screen stays for more than 5 seconds, please switch to <span className="text-white/40 font-bold">Server 1</span> or refresh.</p>
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // }

    let streamSrc = streamUrl;

    // Aggressively inject parameters into the stream URL for maximum compatibility
    if (streamSrc && (streamSrc.includes('http') || streamSrc.includes('//'))) {
        try {
            const tempUrl = streamSrc.startsWith('//') ? `https:${streamSrc}` : streamSrc;
            const url = new URL(tempUrl);
            
            // Common Autoplay params for various players
            if (autoPlay) {
                url.searchParams.set('autoplay', '1');
                url.searchParams.set('auto', '1');
                url.searchParams.set('autostart', '1');
                url.searchParams.set('mute', '1');
            }

            // Common Time params for various players (Zoro, Gogo, MegaCloud, etc.)
            if (startTime > 0) {
                const t = Math.floor(startTime).toString();
                url.searchParams.set('start', t);
                url.searchParams.set('t', t);
                url.searchParams.set('time', t);
                url.searchParams.set('p', t);
            }
            
            streamSrc = url.toString();
        } catch (e) {
            // If URL parsing fails, stick to original but append if possible
            if (startTime > 0 && !streamSrc.includes('start=')) {
                const separator = streamSrc.includes('?') ? '&' : '?';
                streamSrc += `${separator}start=${Math.floor(startTime)}&t=${Math.floor(startTime)}`;
            }
        }
    }

    if (!streamSrc) {
        return (
            <div className="w-full bg-black flex items-center justify-center aspect-video" key={episodeId + server + category}>
                <div className="flex flex-col items-center gap-4 text-center p-6">
                    <img src="/miku-not-found.png" alt="Not Found" className="w-32 h-auto opacity-20" />
                    <p className="text-white/40 text-xs font-black uppercase tracking-[0.2em]">No stream found for this server</p>
                    <p className="text-white/20 text-[10px] max-w-[200px]">Please try switching to another server or category.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-black" style={{ paddingBottom: '56.25%', position: 'relative' }} key={episodeId + server + category}>
            <iframe
                ref={playerRef}
                src={streamSrc}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                frameBorder="0"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
};

export default VideoPlayer;

