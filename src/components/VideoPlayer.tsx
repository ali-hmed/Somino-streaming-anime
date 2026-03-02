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
}

const VideoPlayer = ({
    episodeId,
    server = 'megaPlay',
    category = 'sub',
    autoPlay = true,
    startTime = 0,
}: VideoPlayerProps) => {
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

