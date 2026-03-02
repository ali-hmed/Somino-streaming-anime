'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, PlayCircle, Hash, Zap, LayoutGrid } from 'lucide-react';
import { Episode } from '@/types/anime';

interface EpisodeListProps {
    episodes: Episode[];
    animeId: string;
    currentEpisodeId: string;
}

const EpisodeList: React.FC<EpisodeListProps> = ({ episodes, animeId, currentEpisodeId }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const activeRef = useRef<HTMLAnchorElement>(null);

    // Filter episodes based on search
    const filteredEpisodes = episodes.filter(ep =>
        ep.number.toString().includes(searchQuery) ||
        (ep.title && ep.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Scroll active episode into view on mount
    useEffect(() => {
        if (activeRef.current) {
            activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [currentEpisodeId]);

    return (
        <div className="bg-[#141519] rounded-[6px] border border-white/[0.03] overflow-hidden shadow-2xl flex flex-col h-full">
            {/* compact header */}
            <div className="p-4 px-5 space-y-4 bg-white/[0.01] border-b border-white/[0.05]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <List size={14} className="text-primary" />
                        <h3 className="text-[12px] font-bold text-white">Episodes</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="p-1 px-1.5 rounded-[3px] bg-white/5 border border-white/5 text-[9px] font-black text-white/40">cc</div>
                        <div className="p-1 px-1.5 rounded-[3px] bg-white/5 border border-white/5 text-[9px] font-black text-white/40">en</div>
                    </div>
                </div>

                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={12} />
                    <input
                        type="text"
                        placeholder="find episode..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/40 border border-white/[0.05] rounded-[6px] py-2 pl-9 pr-4 text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:border-primary/20 transition-all font-medium"
                    />
                </div>

                {/* range indicator */}
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <button className="text-white/20 hover:text-white transition-colors p-1"><Hash size={12} /></button>
                        <span className="text-[10px] font-bold text-white/40">001-019</span>
                    </div>
                </div>
            </div>

            {/* List area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/10">
                {filteredEpisodes.length > 0 ? (
                    <div className="divide-y divide-white/[0.02]">
                        {filteredEpisodes.map((ep, index) => {
                            const isActive = ep.id === currentEpisodeId;
                            return (
                                <Link
                                    key={ep.id}
                                    ref={isActive ? activeRef : null}
                                    href={`/watch/${animeId}/${ep.id}`}
                                    className={`flex items-center gap-4 px-5 py-3 transition-all group relative overflow-hidden ${isActive ?'bg-primary'
                                        : 'hover:bg-white/[0.03]'
                                        }`}
                                >
                                    {/* active indicator side bar */}
                                    {isActive && (
                                        <div className="absolute right-0 top-1 bottom-1 w-1 bg-white/40 rounded-l-full" />
                                    )}

                                    <span className={`text-[11px] font-black w-5 transition-colors ${isActive ?'text-white' : 'text-white/20 group-hover:text-primary'}`}>
                                        {ep.number}
                                    </span>

                                    <span className={`flex-1 text-[11px] font-bold transition-colors line-clamp-1 ${isActive ?'text-white' : 'text-white/60 group-hover:text-white'}`}>
                                        {ep.title || `episode ${ep.number}`}
                                    </span>

                                    {isActive && (
                                        <div className="flex-shrink-0">
                                            <Zap size={14} className="text-white fill-white/20 animate-pulse" />
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-white/10 gap-3">
                        <LayoutGrid size={32} />
                        <p className="text-[10px] font-black tracking-widest">no episodes found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Sub-components/Icons for the list
const ChevronRight = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m9 18 6-6-6-6" />
    </svg>
);

const List = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
);

export default EpisodeList;
