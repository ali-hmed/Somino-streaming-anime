"use client";

import React from 'react';

interface VideoPlayerProps {
    id: string;
    episodeId: string;
    streamUrl: string | null;
    server?: 'megaPlay' | 'vidWish';
    category?: 'sub' | 'dub';
    autoPlay?: boolean;
}

const VideoPlayer = ({
    episodeId,
    server = 'megaPlay',
    category = 'sub',
    autoPlay = true,
}: VideoPlayerProps) => {
    // Extract hash from current episodeId (handles both "ID::ep=number" and raw hash IDs)
    const decodedEpisodeId = decodeURIComponent(episodeId);
    let epHash = decodedEpisodeId.includes('ep=')
        ? decodedEpisodeId.split('ep=').pop()
        : decodedEpisodeId.split('::').pop();

    if (!epHash || epHash === '') epHash = '1';

    const domain = server === 'vidWish' ? 'vidwish.live' : 'megaplay.buzz';
    const streamSrc = `https://${domain}/stream/s-2/${epHash}/${category}${autoPlay ? '?autoplay=1&auto=1&autostart=1&muted=1&play=1&onstart=1' : ''}`;

    return (
        <div className="w-full bg-black" style={{ paddingBottom: '56.25%', position: 'relative' }}>
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

