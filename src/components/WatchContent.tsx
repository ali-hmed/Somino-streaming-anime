"use client";

import React, { useState, useEffect } from 'react';
import WatchControls from './WatchControls';
import EpisodeList from './EpisodeList';
import WatchComments from './WatchComments';
import AnimeCard from './AnimeCard';
import { Mic, MessageSquare, Star, Home, ChevronRight, ChevronLeft, GitBranch, Trophy, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Episode, getTitle } from '@/types/anime';
import { fetchHomeData } from '@/lib/consumet';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface WatchContentProps {
    id: string;
    initialEpisodeId: string;
    anime: any;
    recommended: any[];
    sidebarRelations: any[];
}

const WatchContent: React.FC<WatchContentProps> = ({ id, initialEpisodeId, anime, recommended, sidebarRelations }) => {
    const [currentEpisodeId, setCurrentEpisodeId] = useState(initialEpisodeId);
    const [isChanging, setIsChanging] = useState(false);
    const [showAllRelations, setShowAllRelations] = useState(false);
    const [popularAnime, setPopularAnime] = useState<any[]>([]);
    const [focusMode, setFocusMode] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchPopular = async () => {
            // First check if anime object already has the data
            if (anime.mostPopular && anime.mostPopular.length > 0) {
                setPopularAnime(anime.mostPopular.slice(0, 8));
                return;
            }
            // Fallback to fetching home data for the common popular list
            const hData = await fetchHomeData();
            if (hData?.mostPopular?.length > 0) {
                setPopularAnime(hData.mostPopular.slice(0, 8));
            }
        };
        fetchPopular();
    }, [anime.mostPopular]);

    const episodes = anime.episodes || [];
    const currentEpisodeIndex = episodes.findIndex((ep: Episode) => ep.id === currentEpisodeId);
    const currentEpisode = episodes[currentEpisodeIndex] || episodes[0];

    const prevEp = episodes[currentEpisodeIndex - 1];
    const nextEp = episodes[currentEpisodeIndex + 1];

    const handleEpisodeChange = (newId: string) => {
        if (newId === currentEpisodeId) return;

        setIsChanging(true);
        setCurrentEpisodeId(newId);

        // Update URL without full page reload
        window.history.pushState(null, '', `/watch/${id}/${newId}`);
    };

    useEffect(() => {
        if (isChanging) {
            // Short delay to simulate loading or based on component mount
            const timer = setTimeout(() => setIsChanging(false), 800);
            return () => clearTimeout(timer);
        }
    }, [currentEpisodeId]);

    const title = anime.title?.english || anime.title?.romaji || 'Anime';
    const { user, isAuthenticated, setWatchlist } = useAuthStore();
    const poster = anime.image;

    // Focus Mode Keyboard listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && focusMode) setFocusMode(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [focusMode]);

    // Disable scroll when in focus mode
    useEffect(() => {
        if (focusMode) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [focusMode]);

    return (
        <div className="flex flex-col gap-12 relative">
            {/* Focus Mode Overlay */}
            {focusMode && (
                <div 
                    className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-3xl transition-all duration-700 pointer-events-auto"
                    onClick={() => setFocusMode(false)}
                />
            )}

            {/* Upper Section: 3-Column Layout on Desktop */}
            <div className="flex flex-col lg:flex-row gap-5 lg:items-stretch lg:min-h-[620px]">
                {/* 1. Anime Info Panel */}
                {!isExpanded && (
                    <aside className="w-full lg:w-[260px] shrink-0 order-3 lg:order-1 transition-all duration-300">
                    <div className="bg-sidebar rounded-[8px] overflow-hidden flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="relative h-32 flex items-center justify-center overflow-hidden shrink-0">
                                <div className="absolute inset-0 z-0">
                                    <img src={anime.cover || anime.image} className="w-full h-full object-cover blur-2xl opacity-40 scale-150" alt="" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-sidebar to-transparent" />
                                </div>
                                <div className="relative z-10 w-24 aspect-[2/3] rounded-[8px] overflow-hidden mt-4">
                                    <img src={anime.image} alt={title} className="w-full h-full object-cover" />
                                </div>
                            </div>

                            <div className="px-5 pt-6 pb-6 flex flex-col items-center text-center">
                                <div className="space-y-2 mb-4">
                                    <h1 className="text-[15px] font-black text-white leading-tight tracking-tight">
                                        {title}
                                    </h1>
                                    <p className="text-[10px] font-medium text-white/30 leading-relaxed max-w-[200px] mx-auto line-clamp-1">
                                        {[anime.japaneseTitle, ...(Array.isArray(anime.synonyms) ? anime.synonyms : [])].filter(Boolean).slice(0, 2).join('; ')}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center justify-center gap-1.5 mb-5">
                                    {(() => {
                                        const r = String(anime.rating || '');
                                        const rUpper = r.toUpperCase();
                                        const is18 = r === 'R' || rUpper.includes('R+') || rUpper.includes('RX') || rUpper.includes('HENTAI') || r.includes('R -') || anime.is18 || anime.isAdult;

                                        if (!is18) return null;

                                        return (
                                            <span className="px-1.5 py-0.5 rounded-sm bg-[#e5534b] text-white text-[10px] font-black tracking-tighter">
                                                18+
                                            </span>
                                        );
                                    })()}
                                    <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-[4px] bg-pink/10 text-pink text-[8px] font-black tracking-tighter border border-pink/20">
                                        <div className="flex items-center justify-center bg-pink text-background rounded-[1px] px-0.5 text-[7px] leading-none h-2.5 font-black">CC</div>
                                        {anime.subEpisodes || episodes.length || 0}
                                    </div>
                                    {anime.dubEpisodes && anime.dubEpisodes > 0 ? (
                                        <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-[4px] bg-primary/10 text-primary text-[8px] font-black tracking-tighter border border-primary/20">
                                            <Mic size={9} fill="currentColor" />
                                            {anime.dubEpisodes}
                                        </div>
                                    ) : null}
                                    <span className="px-1.5 py-0.5 rounded-[2px] bg-white/[0.03] text-white/20 text-[8px] font-black tracking-tighter">{anime.type || 'TV'}</span>
                                </div>


                                <p className="text-[10px] font-medium text-white/40 leading-relaxed mb-6 px-1 line-clamp-3">
                                    {anime.description?.replace(/<[^>]*>?/gm, '') || 'no description available.'}
                                </p>

                                <div className="w-full space-y-2.5 pt-4 text-left">
                                    <div className="flex items-start gap-2 text-[10px]">
                                        <span className="text-white/30 font-bold shrink-0">Genres:</span>
                                        <span className="text-white font-bold">{anime.genres?.slice(0, 5).join(', ')}</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-[10px]">
                                        <span className="text-white/30 font-bold shrink-0">Status:</span>
                                        <span className="text-white font-bold">{anime.status || 'Unknown'}</span>
                                    </div>
                                    {anime.premiered && (
                                        <div className="flex items-start gap-2 text-[10px]">
                                            <span className="text-white/30 font-bold shrink-0">Premiered:</span>
                                            <span className="text-white font-bold">{String(anime.premiered)}</span>
                                        </div>
                                    )}
                                    {anime.broadcast?.string && (
                                        <div className="flex items-start gap-2 text-[10px]">
                                            <span className="text-white/30 font-bold shrink-0">Broadcast:</span>
                                            <span className="text-white font-bold">{String(anime.broadcast.string)}</span>
                                        </div>
                                    )}
                                    {episodes && episodes.length > 0 && (
                                        <div className="flex items-start gap-2 text-[10px]">
                                            <span className="text-white/30 font-bold shrink-0">Episodes:</span>
                                            <span className="text-white font-bold">{String(episodes.length)}</span>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-2 text-[10px]">
                                        <span className="text-white/30 font-bold shrink-0">Duration:</span>
                                        <span className="text-white font-bold">{String(anime.duration || '24m')}</span>
                                    </div>
                                    {anime.studios && anime.studios.length > 0 && (
                                        <div className="flex items-start gap-2 text-[10px]">
                                            <span className="text-white/30 font-bold shrink-0">Studios:</span>
                                            <span className="text-white font-bold truncate">
                                                {Array.isArray(anime.studios) ? anime.studios.join(', ') : String(anime.studios)}
                                            </span>
                                        </div>
                                    )}
                                    {anime.producers && anime.producers.length > 0 && (
                                        <div className="flex items-start gap-2 text-[10px]">
                                            <span className="text-white/30 font-bold shrink-0">Producers:</span>
                                            <span className="text-white font-bold truncate">
                                                {Array.isArray(anime.producers) ? anime.producers.slice(0, 2).join(', ') : String(anime.producers)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-2 text-[10px]">
                                        <span className="text-white/30 font-bold shrink-0">Score:</span>
                                        <span className="text-white font-bold">{anime.score ? `${anime.score} / 10` : 'TBA'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-footer px-5 py-6 text-center shrink-0">
                            <h4 className="text-[12px] font-black text-primary mb-1 leading-tight">How&apos;d you rate this?</h4>
                            <div className="flex items-center justify-center gap-1 px-2">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} size={22} className={`${i <= Math.round((anime.score || 0) / 2) ? 'text-primary fill-primary' : 'text-white/5 fill-white/5'} transition-transform hover:scale-110 cursor-pointer`} />
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>
                )}

                {/* 2. Video Player Panel */}
                <div className="flex-1 min-w-0 flex flex-col order-1 lg:order-2 h-full">
                    <div className="bg-[#141418] rounded-[8px] overflow-hidden flex flex-col relative transition-opacity duration-500">
                        {isChanging && (
                            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-10 h-10 rounded-full animate-spin"></div>
                                    <p className="text-xs font-black text-white tracking-widest opacity-50">Loading Episode...</p>
                                </div>
                            </div>
                        )}

                        {/* Player Header */}
                        <div className="px-5 py-3 h-10 flex items-center bg-background/40">
                            <div className="flex items-center gap-2 text-[10px] font-black text-white/30 tracking-widest">
                                <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1.5 focus:outline-none">
                                    <Home size={11} /> Home
                                </Link>
                                <span className="opacity-20 text-[12px] font-light">/</span>
                                <span className="text-primary">{anime.type || 'TV'}</span>
                                <span className="opacity-20 text-[12px] font-light">/</span>
                                <span className="text-white/40 truncate max-w-[200px] lg:max-w-[400px]">{title}</span>


                            </div>
                        </div>

                        <WatchControls
                            id={id}
                            episodeId={currentEpisodeId}
                            animeId={id}
                            animeTitle={title}
                            animeImage={anime.image}
                            episodeNumber={currentEpisode?.number || 1}
                            animeStatus={anime.status}
                            broadcastString={anime.broadcast?.string}
                            prevEpId={prevEp?.id}
                            nextEpId={nextEp?.id}
                            dubEpisodes={anime.dubEpisodes}
                            subEpisodes={anime.subEpisodes || episodes.length || 0}
                            onEpisodeChange={handleEpisodeChange}
                            isLoading={isChanging}
                            isFocusMode={focusMode}
                            onToggleFocus={() => setFocusMode(!focusMode)}
                            isExpanded={isExpanded}
                            onToggleExpand={() => setIsExpanded(!isExpanded)}
                        />

                        {/* ── More from this Franchise (seasons + relations merged) ── */}
                        {(() => {
                            const TYPE_ORDER: Record<string, number> = {
                                prequel: 0, sequel: 1, 'alternative version': 2, season: 3,
                                movie: 4, special: 5, ova: 6, ona: 7, music: 8, spinoff: 9, other: 10
                            };

                            const seasonItems = (anime.moreSeasons || []).map((s: any) => ({
                                id: s.id?.toString(),
                                name: getTitle(s.title),
                                image: s.image || anime.image,
                                relationType: 'Season',
                                sortKey: 3,
                            }));

                            const relItems = (anime.relations || []).map((rel: any) => {
                                const rType = (rel.relation || 'other').toLowerCase();
                                return {
                                    id: rel.entry.mal_id?.toString(),
                                    name: rel.entry.name,
                                    image: rel.entry.image || anime.image,
                                    relationType: rel.relation || 'Related',
                                    sortKey: TYPE_ORDER[rType] ?? 10,
                                };
                            });

                            const seenIds = new Set<string>();
                            const merged = [...seasonItems, ...relItems]
                                .filter(item => {
                                    if (!item.id || seenIds.has(item.id)) return false;
                                    seenIds.add(item.id);
                                    return true;
                                })
                                .sort((a, b) => a.sortKey - b.sortKey);

                            if (merged.length === 0) return null;

                            // Counter per label type for numbered suffixes (Movie 2, OVA 3, etc.)
                            const labelCount: Record<string, number> = {};
                            const getShortLabel = (name: string, relationType: string, idx: number): string => {
                                // 1. Try to extract "Season X" or "Part X" from the title
                                const seasonMatch = name.match(/Season\s*\d+|Part\s*\d+|Cour\s*\d+|\bS(\d+)\b/i);
                                if (seasonMatch) return seasonMatch[0];

                                // 2. If it has an explicit ordinal number in the title (e.g. "2nd Season")
                                const ordinalMatch = name.match(/(\d+(?:st|nd|rd|th)\s+Season)/i);
                                if (ordinalMatch) return ordinalMatch[1];

                                // 3. For non-TV types use the type as the label, numbered if multiple
                                const rType = relationType.toLowerCase();
                                const shortTypeMap: Record<string, string> = {
                                    movie: 'Movie', special: 'Special', ova: 'OVA',
                                    ona: 'ONA', music: 'Music', spinoff: 'Spin-off',
                                };
                                const typeLabel = shortTypeMap[rType];
                                if (typeLabel) {
                                    labelCount[typeLabel] = (labelCount[typeLabel] || 0) + 1;
                                    return labelCount[typeLabel] > 1 ? `${typeLabel} ${labelCount[typeLabel]}` : typeLabel;
                                }

                                // 4. Fallback: first meaningful word-segment up to 13 chars
                                const clean = name.replace(/^[^:·—]+[:\s·—]+/u, '').trim() || name;
                                return clean.length > 13 ? clean.slice(0, 12) + '…' : clean;
                            };

                            return (
                                <div className="px-6 py-6 bg-card/20">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-[14px] font-bold text-white/90 tracking-tight">
                                            Watch more seasons of this anime
                                        </h3>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => {
                                                    const el = document.getElementById('seasons-scroll');
                                                    if (el) el.scrollBy({ left: -200, behavior: 'smooth' });
                                                }}
                                                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all active:scale-90"
                                            >
                                                <ChevronLeft size={14} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const el = document.getElementById('seasons-scroll');
                                                    if (el) el.scrollBy({ left: 200, behavior: 'smooth' });
                                                }}
                                                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all active:scale-90"
                                            >
                                                <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <div
                                        id="seasons-scroll"
                                        className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-1"
                                    >
                                        {merged.map((item, i) => {
                                            const isActive = item.id === id;
                                            return (
                                                <Link
                                                    key={`franchise-${item.id ?? i}`}
                                                    href={`/watch/${item.id}`}
                                                    className={`group relative overflow-hidden rounded-xl h-[52px] min-w-[130px] md:min-w-[150px] flex items-center justify-center transition-all duration-300 shrink-0 ${isActive
                                                        ? 'bg-primary/20 scale-[1.02]'
                                                        : 'bg-white/5 hover:bg-white/10 active:scale-95'
                                                        }`}
                                                >
                                                    {/* Blurred cover background */}
                                                    <div className="absolute inset-0 z-0">
                                                        <img
                                                            src={item.image}
                                                            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-125 ${isActive ? 'opacity-50 blur-[1px]' : 'opacity-30 blur-[2px]'}`}
                                                            alt=""
                                                        />
                                                        <div className={`absolute inset-0 bg-black/40 ${isActive ? 'bg-black/10' : ''}`} />
                                                    </div>

                                                    {/* Text Label */}
                                                    <span className={`relative z-10 text-[11px] font-black tracking-widest transition-colors text-center px-4 ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white'}`}>
                                                        {getShortLabel(item.name, item.relationType, i)}
                                                    </span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* 3. Episode List Panel */}
                <aside className="w-full lg:w-[320px] shrink-0 order-2 lg:order-3">
                    <div className="bg-sidebar rounded-[6px] overflow-hidden flex flex-col h-[300px] lg:h-full">
                        <EpisodeList
                            animeId={id}
                            episodes={episodes}
                            currentEpisodeId={currentEpisodeId}
                            onEpisodeClick={handleEpisodeChange}
                        />
                    </div>
                </aside>
            </div>

            {/* Lower Section: Comments & Sidebar */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main area: Comments */}
                <div className="flex-1 min-w-0 relative">
                    <div className={isChanging ? 'opacity-30 pointer-events-none transition-opacity duration-300' : 'transition-opacity duration-300'}>
                        <WatchComments
                            episodeId={currentEpisodeId}
                            animeId={id}
                            animeTitle={title}
                            animeImage={anime.image}
                            episodeNumber={currentEpisode?.number || 1}
                            key={currentEpisodeId}
                        />
                    </div>
                </div>

                {/* Sidebar area: Relations & Recommended */}
                <aside className="w-full lg:w-[320px] shrink-0 space-y-10">
                    {/* 1. relations sidebar */}
                    {sidebarRelations && sidebarRelations.length > 0 && (
                        <div className="rounded-2xl bg-sidebar overflow-hidden">
                            <div className="flex items-center justify-between p-5 pb-3">
                                <div className="flex items-center gap-2">
                                    <GitBranch size={16} className="text-primary" />
                                    <h3 className="text-[13px] font-black text-white tracking-widest">Relations</h3>
                                </div>
                                {sidebarRelations.length > 3 && (
                                    <button
                                        onClick={() => setShowAllRelations(!showAllRelations)}
                                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white/40 transition-colors uppercase hover:text-primary"
                                    >
                                        {showAllRelations ? 'Less' : `All (${sidebarRelations.length})`}
                                        <ChevronRight size={12} className={`ml-1 transition-transform ${showAllRelations ? 'rotate-[-90deg]' : 'rotate-90'}`} />
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-col gap-2 p-2">
                                {(showAllRelations ? sidebarRelations : sidebarRelations.slice(0, 3)).map((rel: any, i: number) => (
                                        <Link
                                            key={i}
                                            href={`/watch/${rel.id}`}
                                            className="group relative flex h-[76px] bg-card hover:bg-surface rounded-xl overflow-hidden transition-all duration-300 active:scale-[0.98]"
                                        >
                                            {/* Left Content */}
                                            <div className="relative z-10 flex flex-col justify-center pl-4 pr-2 w-[70%] h-full">
                                                <h4 className="text-[13px] font-bold text-white leading-tight truncate mb-2 group-hover:text-primary transition-colors">
                                                    {rel.name}
                                                </h4>
    
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-[4px] bg-pink/10 text-pink shrink-0 border border-pink/20">
                                                        <div className="flex items-center justify-center bg-pink text-background rounded-[1px] px-0.5 text-[7px] leading-none h-2.5 font-black">CC</div>
                                                        <span className="text-[9px] font-black">{rel.subEpisodes || rel.episodes || '?'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-[4px] bg-primary/10 text-primary shrink-0 border border-primary/20">
                                                        <Mic size={9} fill="currentColor" />
                                                        <span className="text-[9px] font-black">{rel.dubEpisodes || rel.subEpisodes || rel.episodes || '?'}</span>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-white/30">{rel.type}</span>
                                                    <span className="text-[9px] font-black text-white/40 truncate">{rel.relationType}</span>
                                                </div>
                                            </div>
    
                                            {/* Right Image Overlay */}
                                            <div className="absolute top-0 right-0 w-[45%] h-full">
                                                <div className="absolute inset-0 z-1 bg-gradient-to-r from-[#181818] via-[#181818]/60 to-transparent" />
                                                <img src={rel.image} className="w-full h-full object-cover transition-all duration-700 opacity-60 group-hover:opacity-100" alt="" />
                                            </div>
                                        </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 2. Most Popular sidebar */}
                    {popularAnime && popularAnime.length > 0 && (
                        <section className="bg-sidebar rounded-[6px] overflow-hidden">
                            <div className="flex items-center justify-between p-4 pb-2">
                                <h3 className="text-[16px] font-bold text-white tracking-tight">Most Popular</h3>
                            </div>
                            <div className="flex flex-col">
                                {popularAnime.map((item, i) => (
                                    <Link
                                        key={item.id || i}
                                        href={`/watch/${item.id}`}
                                        className="group relative flex items-center p-3 gap-3 hover:bg-card transition-colors last:border-0"
                                    >
                                        {/* Left: Square Poster */}
                                        <div className="w-12 h-16 shrink-0 rounded-[4px] overflow-hidden bg-white/5">
                                            <img src={item.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                                        </div>

                                        {/* Center: Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-[13px] font-bold text-white leading-tight truncate mb-1.5 group-hover:text-primary transition-colors">
                                                {getTitle(item.title)}
                                            </h4>

                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-[4px] bg-pink/10 text-pink border border-pink/20">
                                                    <div className="flex items-center justify-center bg-pink text-background rounded-[1px] px-0.5 text-[7px] leading-none h-2.5 font-black">CC</div>
                                                    <span className="text-[9px] font-black">{item.subEpisodes || item.episodes || item.totalEpisodes || '?'}</span>
                                                </div>
                                                {item.dubEpisodes > 0 && (
                                                    <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-[4px] bg-primary/10 text-primary border border-primary/20">
                                                        <Mic size={9} fill="currentColor" />
                                                        <span className="text-[9px] font-black">{item.dubEpisodes}</span>
                                                    </div>
                                                )}
                                                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">•</span>
                                                <span className="text-[10px] font-bold text-white/30">{item.type || 'TV'}</span>
                                            </div>
                                        </div>

                                        {/* Right: Plus Icon */}
                                        <div className="shrink-0 text-white/10 group-hover:text-white transition-colors">
                                            <span className="text-[18px] font-light">+</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </aside>
            </div>

            {/* Recommended Section - Full Width at Bottom */}
            {recommended && recommended.length > 0 && (
                <section className="mt-12">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                        <h2 className="text-xl md:text-2xl font-black text-white tracking-widest">Recommended For You</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {recommended.map((rec: any, i: number) => (
                            <AnimeCard key={`rec-${rec.id || i}`} anime={rec} variant="portrait" isSharp={true} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default WatchContent;
