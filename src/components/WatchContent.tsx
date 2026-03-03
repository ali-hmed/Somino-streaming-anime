"use client";

import React, { useState, useEffect } from 'react';
import WatchControls from './WatchControls';
import EpisodeList from './EpisodeList';
import WatchComments from './WatchComments';
import { Mic, MessageSquare, Star, Home } from 'lucide-react';
import { Episode, getTitle } from '@/types/anime';
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
    const router = useRouter();

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

    return (
        <div className="flex flex-col gap-12">
            {/* Upper Section: 3-Column Layout on Desktop */}
            <div className="flex flex-col lg:flex-row gap-5 lg:items-stretch lg:h-[600px]">

                {/* 1. Anime Info Panel */}
                <aside className="w-full lg:w-[260px] shrink-0 order-3 lg:order-1">
                    <div className="bg-[#0f1115] rounded-[8px] overflow-hidden shadow-2xl border border-white/[0.02] flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="relative h-32 flex items-center justify-center overflow-hidden shrink-0">
                                <div className="absolute inset-0 z-0">
                                    <img src={anime.cover || anime.image} className="w-full h-full object-cover blur-2xl opacity-40 scale-150" alt="" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115] to-transparent" />
                                </div>
                                <div className="relative z-10 w-24 aspect-[2/3] rounded-[8px] overflow-hidden shadow-2xl border border-white/10 mt-4">
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
                                    <span className={`px-1.5 py-0.5 rounded-[2px] ${String(anime.rating || '').includes('R') || String(anime.rating || '').includes('18') ? 'bg-[#FF4B12] text-white shadow-lg' : 'bg-[#FF4F18]/10 border border-[#FF4F18]/30 text-[#FF4F18]'} text-[8px] font-black lowercase tracking-tighter`}>
                                        {(() => {
                                            const r = String(anime.rating || '');
                                            if (r.includes('R') || r.includes('18')) return '18+';
                                            return 'pg 13';
                                        })()}
                                    </span>
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-[#FF6E9F]/10 border border-[#FF6E9F]/30 text-[#FF6E9F] text-[8px] font-black tracking-tighter">
                                        <MessageSquare size={9} fill="currentColor" />
                                        {anime.subEpisodes || episodes.length || 0}
                                    </div>
                                    {anime.dubEpisodes && anime.dubEpisodes > 0 ? (
                                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-[#53CCB8]/10 border border-[#53CCB8]/30 text-[#53CCB8] text-[8px] font-black tracking-tighter">
                                            <Mic size={9} fill="currentColor" />
                                            {anime.dubEpisodes}
                                        </div>
                                    ) : null}
                                    <span className="px-1.5 py-0.5 rounded-[2px] bg-white/[0.03] border border-white/5 text-white/20 text-[8px] font-black tracking-tighter">{anime.type || 'tv'}</span>
                                </div>

                                <p className="text-[10px] font-medium text-white/40 leading-relaxed mb-6 px-1 line-clamp-3">
                                    {anime.description?.replace(/<[^>]*>?/gm, '') || 'no description available.'}
                                </p>

                                <div className="w-full space-y-2.5 pt-4 border-t border-white/[0.03] text-left">
                                    <div className="flex items-start gap-2 text-[10px]">
                                        <span className="text-white/30 font-bold shrink-0">genres:</span>
                                        <span className="text-white font-bold">{anime.genres?.slice(0, 3).join(', ')}</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-[10px]">
                                        <span className="text-white/30 font-bold shrink-0">status:</span>
                                        <span className="text-white font-bold">{anime.status || 'unknown'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#0b0c10] px-5 py-6 text-center shrink-0 border-t border-white/[0.02]">
                            <h4 className="text-[12px] font-black text-[#FF4F18] mb-1 leading-tight">how&apos;d you rate this?</h4>
                            <div className="flex items-center justify-center gap-1 px-2">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} size={22} className={`${i <= Math.round((anime.score || 0) / 2) ? 'text-[#FF4F18] fill-[#FF4F18]' : 'text-white/5 fill-white/5'} transition-transform hover:scale-110 cursor-pointer`} />
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* 2. Video Player Panel */}
                <div className="flex-1 min-w-0 flex flex-col order-1 lg:order-2">
                    <div className="bg-[#141519]/80 backdrop-blur-xl rounded-[8px] overflow-hidden shadow-2xl border border-white/[0.03] flex flex-col h-full relative">
                        {isChanging && (
                            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-xs font-black text-white tracking-widest uppercase opacity-50">Loading Episode...</p>
                                </div>
                            </div>
                        )}

                        {/* Player Header */}
                        <div className="px-5 py-3 h-10 flex items-center bg-[#0b0c10]/40 border-b border-white/[0.03]">
                            <div className="flex items-center gap-2 text-[10px] font-black text-white/30 tracking-widest uppercase">
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
                        />
                    </div>
                </div>

                {/* 3. Episode List Panel */}
                <aside className="w-full lg:w-[320px] shrink-0 order-2 lg:order-3">
                    <div className="bg-[#141519] rounded-[6px] border border-white/[0.03] overflow-hidden shadow-xl flex flex-col h-[380px] lg:h-full">
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
                        <WatchComments key={currentEpisodeId} />
                    </div>
                </div>

                {/* Sidebar area: Relations & Recommended */}
                <aside className="w-full lg:w-[320px] shrink-0 space-y-10">
                    {/* 1. relations sidebar */}
                    {sidebarRelations && sidebarRelations.length > 0 && (
                        <section className="space-y-5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[13px] font-black text-white tracking-tight border-l-3 border-primary pl-2.5">relations</h3>
                            </div>
                            <div className="space-y-3">
                                {sidebarRelations.map((rel: any, i: number) => (
                                    <Link
                                        key={i}
                                        href={`/watch/${rel.id}`}
                                        className="group flex gap-3 h-16 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.03] rounded-[6px] overflow-hidden transition-all duration-300"
                                    >
                                        <div className="w-12 h-full shrink-0 overflow-hidden relative">
                                            <img src={rel.image} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" alt="" />
                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                                                <span className="text-[7px] font-black text-white/60 block text-center truncate group-hover:text-white transition-colors">
                                                    {rel.type || 'tv'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-center pr-4 min-w-0">
                                            <p className="text-[11px] font-bold text-white leading-tight truncate mb-1 group-hover:text-primary transition-colors">
                                                {rel.name}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black text-primary">{rel.relationType}</span>
                                                <div className="w-1 h-1 rounded-full bg-white/10" />
                                                <span className="text-[9px] font-bold text-white/30">{rel.subEpisodes || rel.episodes || '?'} sub</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 2. recommended */}
                    {recommended && recommended.length > 0 && (
                        <section className="space-y-5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[13px] font-black text-white tracking-tight border-l-3 border-primary pl-2.5">recommended</h3>
                            </div>
                            <div className="space-y-3">
                                {recommended.slice(0, 4).map((rec: any, i: number) => (
                                    <Link
                                        key={i}
                                        href={`/watch/${rec.id}`}
                                        className="group flex gap-3 h-16 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.03] rounded-[6px] overflow-hidden transition-all duration-300"
                                    >
                                        <div className="w-12 h-full shrink-0 overflow-hidden relative">
                                            <img src={rec.image} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" alt="" />
                                        </div>
                                        <div className="flex flex-col justify-center pr-4 min-w-0">
                                            <p className="text-[10px] font-bold text-white leading-tight truncate mb-1 group-hover:text-primary transition-colors">
                                                {getTitle(rec.title)}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1">
                                                    <Star size={8} className="text-[#FF4F18] fill-current" />
                                                    <span className="text-[9px] font-black text-white/40">{rec.score || '0.0'}</span>
                                                </div>
                                                <div className="w-1 h-1 rounded-full bg-white/10" />
                                                <span className="text-[9px] font-bold text-white/30">{rec.subEpisodes || rec.totalEpisodes || '?'} sub</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default WatchContent;
