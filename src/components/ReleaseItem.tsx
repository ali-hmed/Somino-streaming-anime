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
            className="flex items-center gap-4 p-4 hover:bg-white/[0.03] transition-all cursor-pointer group border-b border-white/[0.05] last:border-0"
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
                    {/* SUB Badge - Main Theme Pink */}
                    <div className="flex items-center gap-1 bg-[#FF6E9F] text-black text-[10px] font-black px-1.5 py-0.5 rounded-[2px]">
                        <span className="opacity-60">SUB</span>
                        {anime.subEpisodes || anime.episodeNumber || anime.totalEpisodes || '1'}
                    </div>

                    {/* Mic Badge - Main Theme Pink */}
                    {anime.dubEpisodes > 0 && (
                        <div className="flex items-center gap-1 bg-[#53CCB8] text-black text-[10px] font-black px-1.5 py-0.5 rounded-[2px]">
                            <Mic size={8} className="fill-current" />
                            {anime.dubEpisodes}
                        </div>
                    )}

                    {/* Count Badge - Muted Gray */}
                    <div className="flex items-center gap-1 bg-white/10 text-white/50 text-[10px] font-black px-1.5 py-0.5 rounded-[2px]">
                        {anime.episodeNumber || anime.totalEpisodes || '1'}
                    </div>

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
