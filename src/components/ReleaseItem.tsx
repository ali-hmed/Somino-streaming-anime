import React from 'react';
import Link from 'next/link';
import { Mic } from 'lucide-react';
import { getTitle } from '@/types/anime';

interface ReleaseItemProps {
    anime: any;
}

const ReleaseItem: React.FC<ReleaseItemProps> = ({ anime }) => {
    const title = getTitle(anime.title);

    return (
        <Link
            href={`/watch/${anime.id}/1`}
            className="flex items-center gap-4 p-4 hover:bg-card transition-all cursor-pointer group"
        >
            {/* Thumbnail */}
            <div className="w-16 h-18 rounded-md overflow-hidden bg-white/5 flex-shrink-0 relative">
                {anime.image && (
                    <img
                        src={anime.image}
                        alt={title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                )}
            </div>

            {/* Content info */}
            <div className="flex-1 min-w-0">
                <h4 className="text-[14px] font-bold text-white group-hover:text-primary transition-colors line-clamp-1 mb-2">
                    {title}
                </h4>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* SUB Badge - Pink Pill */}
                    <div className="flex items-center gap-1.5 bg-pink/10 text-pink text-[9px] font-black px-1.5 py-0.5 rounded-[4px] border border-pink/20">
                        <div className="flex items-center justify-center bg-pink text-background rounded-[1px] px-0.5 text-[7px] leading-none h-2.5 font-black">CC</div>
                        {anime.subEpisodes || anime.episodeNumber || anime.totalEpisodes || '1'}
                    </div>

                    {/* DUB Badge - Primary Pill */}
                    {anime.dubEpisodes > 0 && (
                        <div className="flex items-center gap-1.5 bg-primary/10 text-primary text-[9px] font-black px-1.5 py-0.5 rounded-[4px] border border-primary/20">
                            <Mic size={9} fill="currentColor" />
                            {anime.dubEpisodes}
                        </div>
                    )}

                    <span className="text-white/40 text-[10px] font-bold flex items-center gap-1">
                        <span className="text-[8px] opacity-40">•</span>
                        {anime.type || anime.format || 'TV'}
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default ReleaseItem;
