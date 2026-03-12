'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, LayoutGrid, Zap, ChevronDown } from 'lucide-react';
import { Episode } from '@/types/anime';

interface EpisodeListProps {
    episodes: Episode[];
    animeId: string;
    currentEpisodeId: string;
    onEpisodeClick?: (id: string) => void;
}

const CHUNK_SIZE = 100;

const EpisodeList: React.FC<EpisodeListProps> = ({ episodes, animeId, currentEpisodeId, onEpisodeClick }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeChunk, setActiveChunk] = useState(0);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const activeRef = useRef<HTMLElement>(null);

    const useGridMode = episodes.length > 18;
    const totalChunks = Math.ceil(episodes.length / CHUNK_SIZE);

    // Auto-jump to the chunk containing the active episode
    useEffect(() => {
        if (!useGridMode) return;
        const idx = episodes.findIndex(ep => ep.id === currentEpisodeId);
        if (idx >= 0) setActiveChunk(Math.floor(idx / CHUNK_SIZE));
    }, [currentEpisodeId, episodes, useGridMode]);

    // Scroll active episode into view
    useEffect(() => {
        activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [currentEpisodeId, activeChunk]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filteredEpisodes = searchQuery
        ? episodes.filter(ep =>
            ep.number.toString().includes(searchQuery) ||
            (ep.title && ep.title.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        : episodes;

    const displayEpisodes = useGridMode && !searchQuery
        ? episodes.slice(activeChunk * CHUNK_SIZE, (activeChunk + 1) * CHUNK_SIZE)
        : filteredEpisodes;

    const getChunkLabel = (i: number) => {
        const start = i * CHUNK_SIZE + 1;
        const end = Math.min((i + 1) * CHUNK_SIZE, episodes.length);
        return `EPS: ${String(start).padStart(3, '0')}-${String(end).padStart(3, '0')}`;
    };

    return (
        <div className="bg-sidebar rounded-[6px] overflow-hidden flex flex-col h-full">

            {/* ── Header ─────────────────────────────────────────── */}
            <div className="px-3 py-2 bg-sidebar mb-1">
                <p className="text-[10px] font-bold text-white/50 tracking-wide mb-2">List of episodes:</p>

                <div className="flex items-center gap-2">
                    {/* Range Dropdown */}
                    {useGridMode && totalChunks > 1 && !searchQuery && (
                        <div className="relative shrink-0" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(v => !v)}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-[4px] bg-card text-[9px] font-bold text-white/50 hover:text-white transition-all whitespace-nowrap"
                            >
                                <MenuIcon />
                                {getChunkLabel(activeChunk)}
                                <ChevronDown
                                    size={9}
                                    className={`transition-transform duration-200 text-white/30 ${dropdownOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {dropdownOpen && (
                                <div className="absolute top-full left-0 mt-1 z-50 bg-card rounded-[6px] overflow-hidden min-w-[130px]">
                                    {Array.from({ length: totalChunks }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => { setActiveChunk(i); setDropdownOpen(false); }}
                                            className={`w-full text-left px-3 py-1.5 text-[9px] font-bold transition-colors whitespace-nowrap ${activeChunk === i
                                                    ? 'bg-primary/20 text-primary'
                                                    : 'text-white/40 hover:bg-white/[0.05] hover:text-white'
                                                }`}
                                        >
                                            {getChunkLabel(i)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Search */}
                    <div className="relative flex-1 group">
                        <Search
                            className="absolute left-2 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-all"
                            size={9}
                        />
                        <input
                            type="text"
                            placeholder="Number of Ep"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-card rounded-[4px] py-1 pl-6 pr-2 text-[9px] text-white placeholder:text-white/20 focus:outline-none focus:bg-card/80 transition-all font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* ── Episode Area ────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {displayEpisodes.length > 0 ? (
                    useGridMode && !searchQuery ? (

                        /* ── Compact Number Grid (HiAnime style) ─── */
                        <div className="grid grid-cols-5 gap-[3px]">
                            {displayEpisodes.map(ep => {
                                const isActive = ep.id === currentEpisodeId;
                                const isFiller = ep.isFiller;

                                return (
                                    <EpBox
                                        key={ep.id}
                                        ep={ep}
                                        isActive={isActive}
                                        isFiller={!!isFiller}
                                        animeId={animeId}
                                        onEpisodeClick={onEpisodeClick}
                                        activeRef={isActive ? (activeRef as React.RefObject<HTMLElement>) : undefined}
                                    />
                                );
                            })}
                        </div>

                    ) : (

                        /* ── List Mode (short anime or search) ──── */
                        <div className="flex flex-col gap-0.5">
                            {(searchQuery ? filteredEpisodes : episodes).map(ep => {
                                const isActive = ep.id === currentEpisodeId;
                                const baseClass = `w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[4px] transition-all group text-left`;
                                const activeClass = `bg-primary/20`;
                                const inactiveClass = `bg-card/40 hover:bg-card`;

                                const inner = (
                                    <>
                                        <span className={`text-[9px] font-black w-5 shrink-0 ${isActive ? 'text-primary' : 'text-white/25 group-hover:text-primary'}`}>
                                            {ep.number}
                                        </span>
                                        <span className={`flex-1 text-[10px] font-medium line-clamp-1 ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
                                            {ep.title || `Episode ${ep.number}`}
                                        </span>
                                        {isActive && <Zap size={7} className="shrink-0 text-primary fill-primary animate-pulse" />}
                                    </>
                                );

                                if (onEpisodeClick) {
                                    return (
                                        <button
                                            key={ep.id}
                                            ref={isActive ? (activeRef as React.RefObject<HTMLButtonElement>) : undefined}
                                            onClick={() => onEpisodeClick(ep.id)}
                                            className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}
                                        >
                                            {inner}
                                        </button>
                                    );
                                }
                                return (
                                    <Link
                                        key={ep.id}
                                        ref={isActive ? (activeRef as React.RefObject<HTMLAnchorElement>) : undefined}
                                        href={`/watch/${animeId}/${ep.id}`}
                                        className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}
                                    >
                                        {inner}
                                    </Link>
                                );
                            })}
                        </div>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-white/10 gap-3">
                        <LayoutGrid size={28} />
                        <p className="text-[9px] font-black tracking-widest uppercase">no episodes found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ── Episode Box (grid cell) ─────────────────────────────── */
interface EpBoxProps {
    ep: Episode;
    isActive: boolean;
    isFiller: boolean;
    animeId: string;
    onEpisodeClick?: (id: string) => void;
    activeRef?: React.RefObject<HTMLElement>;
}

const EpBox: React.FC<EpBoxProps> = ({ ep, isActive, isFiller, animeId, onEpisodeClick, activeRef }) => {
    const boxClass = `
        relative flex items-center justify-center
        h-7 w-full rounded-[3px]
        text-[10px] font-bold select-none
        transition-all duration-150 active:scale-95
        ${isActive
            ? 'bg-[#b8935a] text-[#1a120a]'
            : isFiller
                ? 'bg-[#2a2218] text-[#9a7a4a] hover:bg-[#3a3020] hover:text-[#c8a96e]'
                : 'bg-card text-white/45 hover:bg-surface-raised hover:text-white/80'
        }
        cursor-pointer
    `;

    if (onEpisodeClick) {
        return (
            <button
                ref={isActive ? (activeRef as React.RefObject<HTMLButtonElement>) : undefined}
                onClick={() => onEpisodeClick(ep.id)}
                className={boxClass}
                title={ep.title || `Episode ${ep.number}`}
            >
                {ep.number}
            </button>
        );
    }

    return (
        <Link
            ref={isActive ? (activeRef as React.RefObject<HTMLAnchorElement>) : undefined}
            href={`/watch/${animeId}/${ep.id}`}
            className={boxClass}
            title={ep.title || `Episode ${ep.number}`}
        >
            {ep.number}
        </Link>
    );
};

/* ── Menu Icon ───────────────────────────────────────────── */
const MenuIcon = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

export default EpisodeList;
