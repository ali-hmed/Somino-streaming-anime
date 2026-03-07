'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, PlayCircle, Hash, Zap, LayoutGrid } from 'lucide-react';
import { Episode } from '@/types/anime';

interface EpisodeListProps {
    episodes: Episode[];
    animeId: string;
    currentEpisodeId: string;
    onEpisodeClick?: (id: string) => void;
}

const EpisodeList: React.FC<EpisodeListProps> = ({ episodes, animeId, currentEpisodeId, onEpisodeClick }) => {
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
            <div className="p-2.5 px-4 bg-white/[0.01] border-b border-white/[0.05]">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 shrink-0">
                        <List size={14} className="text-primary" />
                        <h3 className="text-[12px] font-bold text-white tracking-tight">Episodes</h3>
                    </div>

                    <div className="relative group max-w-[120px] transition-all duration-300 focus-within:max-w-[150px]">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-all" size={10} />
                        <input
                            type="text"
                            placeholder="Find..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/5 rounded-full py-1 pl-7 pr-3 text-[10px] text-white placeholder:text-white/20 focus:outline-none focus:bg-black/40 focus:border-primary/20 transition-all font-medium font-sans"
                        />
                    </div>
                </div>
            </div>

            {/* List area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/10 p-1">
                {filteredEpisodes.length > 0 ? (
                    <div className="flex flex-col gap-1">
                        {filteredEpisodes.map((ep, index) => {
                            const isActive = ep.id === currentEpisodeId;

                            const content = (
                                <>
                                    <span className={`text-[8px] font-bold w-4 tracking-tighter transition-colors shrink-0 ${isActive ? 'text-white' : 'text-white/40 group-hover:text-primary'}`}>
                                        {ep.number}
                                    </span>

                                    <span className={`flex-1 text-[10px] font-medium transition-colors line-clamp-1 ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                                        {ep.title || `Episode ${ep.number}`}
                                    </span>

                                    {isActive && (
                                        <div className="flex-shrink-0 ml-2">
                                            <Zap size={8} className="text-white fill-white/20 animate-pulse" />
                                        </div>
                                    )}
                                </>
                            );

                            const baseClass = `w-full flex items-center gap-3 px-3 py-1.5 transition-all group relative overflow-hidden text-left rounded-[4px]`;
                            const activeClass = `bg-primary text-secondary-foreground`;
                            const inactiveClass = `bg-white/[0.02] hover:bg-white/[0.05] active:bg-white/[0.08]`;

                            if (onEpisodeClick) {
                                return (
                                    <button
                                        key={ep.id}
                                        onClick={() => onEpisodeClick(ep.id)}
                                        className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}
                                    >
                                        {content}
                                    </button>
                                );
                            }

                            return (
                                <Link
                                    key={ep.id}
                                    ref={isActive ? activeRef : null}
                                    href={`/watch/${animeId}/${ep.id}`}
                                    className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}
                                >
                                    {content}
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-white/10 gap-3">
                        <LayoutGrid size={32} />
                        <p className="text-[10px] font-black tracking-widest uppercase">no episodes found</p>
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
