"use client";

import React from 'react';

interface VideoPlayerProps {
    id: string;
    episodeId: string;
    streamUrl: string | null;
    server?: 'megaPlay' | 'vidWish';
    category?: 'sub' | 'dub';
    autoPlay?: boolean;
    startTime?: number; // in seconds
    onProgress?: (currentTime: number, duration: number) => void;
}

const VideoPlayer = ({
    id,
    episodeId,
    server = 'megaPlay',
    category = 'sub',
    autoPlay = true,
    startTime = 0,
    onProgress,
}: VideoPlayerProps) => {
    // Listen for messages from the iframe player
    React.useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const data = event.data;
            if (!data) return;

            // Handle common player message formats (e.g. from MegaPlay/VidWish if they send progress)
            // Most players send objects like { event: 'timeupdate', data: { currentTime: 10, duration: 100 } }
            // or { type: 'video:timeupdate', currentTime: 10, duration: 100 }

            let currentTime: number | null = null;
            let duration: number | null = null;

            if (typeof data === 'object') {
                // Try to find currentTime and duration in various common spots
                currentTime = data.currentTime ?? data.time ?? data.seconds ?? data.data?.currentTime ?? data.data?.time;
                duration = data.duration ?? data.totalTime ?? data.data?.duration ?? data.data?.totalTime;

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
        : decodedEpisodeId.split('::').pop();

    if (!epHash || epHash === '') epHash = '1';

    const domain = server === 'vidWish' ? 'vidwish.live' : 'megaplay.buzz';
    const baseUrl = `https://${domain}/stream/s-2/${epHash}/${category}`;
    const params = new URLSearchParams();
    if (autoPlay) {
        params.set('autoplay', '1');
        params.set('auto', '1');
        params.set('autostart', '1');
        params.set('muted', '1');
        params.set('play', '1');
        params.set('onstart', '1');
    }
    if (startTime > 0) {
        params.set('t', Math.floor(startTime).toString());
        params.set('time', Math.floor(startTime).toString()); // some players use time=
    }

    const streamSrc = `${baseUrl}${params.toString() ? '?' + params.toString() : ''}`;

    return (
        <div className="w-full bg-black" style={{ paddingBottom: '56.25%', position: 'relative' }} key={episodeId + server + category}>
            <iframe
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

