import React from 'react';
import {
    fetchAnimeInfo,
    fetchEpisodeStreamingLinks,
    fetchEpisodeDetails,
    fetchRelatedAnime,
    fetchAnimeRelations
} from '@/lib/consumet';
import { getTitle, Episode } from '@/types/anime';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import EpisodeList from '@/components/EpisodeList';
import {
    Home,
    Moon,
    PlayCircle,
    ChevronsLeft,
    ChevronsRight,
    Bookmark,
    AlertTriangle,
    Cloud,
    List,
    Play,
    Monitor,
    Star,
    Share2,
    ChevronRight,
    Maximize2,
    Focus,
    RotateCcw,
    SkipBack,
    SkipForward,
    Users,
    Flag,
    Info,
    Calendar,
    Tv,
    Clock,
    MessageSquare,
    ChevronDown,
    Zap,
    Heart,
    FastForward,
    Mic,
    GitBranch,
    Scissors,
    Maximize
} from 'lucide-react';
import Relations from '@/components/Relations';
import WatchControls from '@/components/WatchControls';

export default async function PlayerPage({ params }: { params: Promise<{ id: string; episodeId: string }> }) {
    const { id: rawId, episodeId: rawEpisodeId } = await params;
    const id = decodeURIComponent(rawId);
    const episodeId = decodeURIComponent(rawEpisodeId);

    // Fetch all necessary data
    const [anime, epDetails, recommended] = await Promise.all([
        fetchAnimeInfo(id),
        fetchEpisodeDetails(id, episodeId).catch(() => null),
        fetchRelatedAnime(id),
    ]);
    const links = await fetchEpisodeStreamingLinks(episodeId);

    // Relations come from fetchAnimeInfo now
    const relationsData = anime?.relations || [];

    if (!anime) {
        return (
            <div className="min-h-screen bg-[#0b0b0c] flex items-center justify-center text-white font-medium">
                anime not found
            </div>
        );
    }

    const currentEpisode = anime.episodes.find((ep: Episode) => ep.id === episodeId) || anime.episodes[0];
    const episodeData = epDetails?.data;
    const title = getTitle(anime.title);

    // Find neighboring episodes
    const currentIndex = anime.episodes.findIndex((ep: Episode) => ep.id === episodeId);
    const prevEp = anime.episodes[currentIndex - 1];
    const nextEp = anime.episodes[currentIndex + 1];

    // Pick the default source
    const defaultSource = links?.sources?.find((s: any) => s.quality === 'default' || s.quality === 'auto') || links?.sources?.[0];

    const formatNum = (n?: number) => {
        if (!n) return '0';
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'm';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
        return n.toString();
    };

    // Process relations for sidebar (limit to a few relevant ones)
    const sidebarRelations = (relationsData || []).map((rel: any) => ({
        ...rel.entry,
        relationType: rel.relation
    })).slice(0, 6);

    return (
        <main className="min-h-screen bg-[#0b0b0c] text-white/90 font-sans selection:bg-primary/30">
            <Navbar />

            {/* main content container */}
            <div className="container mx-auto px-4 pt-24 md:pt-32 pb-12 max-w-[1320px]">

                {/* upper section: 3-column layout on desktop */}
                <div className="flex flex-col lg:flex-row gap-5 mb-12 lg:items-stretch lg:h-[600px]">

                    {/* 1. anime info panel */}
                    <aside className="w-full lg:w-[260px] shrink-0 order-3 lg:order-1">
                        <div className="bg-[#0f1115] rounded-[8px] overflow-hidden shadow-2xl border border-white/[0.02] flex flex-col h-full">
                            {/* scrollable content area */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {/* header with blurred cover and poster */}
                                <div className="relative h-32 flex items-center justify-center overflow-hidden shrink-0">
                                    <div className="absolute inset-0 z-0">
                                        <img src={anime.cover || anime.image} className="w-full h-full object-cover blur-2xl opacity-40 scale-150" alt="" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115] to-transparent" />
                                    </div>
                                    <div className="relative z-10 w-24 aspect-[2/3] rounded-[8px] overflow-hidden shadow-2xl border border-white/10 mt-4">
                                        <img src={anime.image} alt={title} className="w-full h-full object-cover" />
                                    </div>
                                </div>

                                {/* content section */}
                                <div className="px-5 pt-6 pb-6 flex flex-col items-center text-center">
                                    {/* titles */}
                                    <div className="space-y-2 mb-4">
                                        <h1 className="text-[15px] font-black text-white leading-tight tracking-tight">
                                            {title}
                                        </h1>
                                        <p className="text-[10px] font-medium text-white/30 leading-relaxed max-w-[200px] mx-auto line-clamp-1">
                                            {[anime.japaneseTitle, ...(Array.isArray(anime.synonyms) ? anime.synonyms : [])].filter(Boolean).slice(0, 2).join('; ')}
                                        </p>
                                    </div>

                                    {/* badges */}
                                    <div className="flex flex-wrap items-center justify-center gap-1.5 mb-5">
                                        <span className={`px-1.5 py-0.5 rounded-[2px] ${String(anime.rating ||'').includes('R') || String(anime.rating || '').includes('18') ? 'bg-[#FF4B12] text-white shadow-lg' : 'bg-[#FF4F18]/10 border border-[#FF4F18]/30 text-[#FF4F18]'} text-[8px] font-black lowercase tracking-tighter`}>
                                            {(() => {
                                                const r = String(anime.rating || '');
                                                if (r.includes('R') || r.includes('18')) return '18+';
                                                return 'pg 13';
                                            })()}
                                        </span>
                                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-[#FF6E9F]/10 border border-[#FF6E9F]/30 text-[#FF6E9F] text-[8px] font-black tracking-tighter">
                                            <MessageSquare size={9} fill="currentColor" />
                                            {anime.subEpisodes || anime.episodes?.length || 0}
                                        </div>
                                        {anime.dubEpisodes && anime.dubEpisodes > 0 ? (
                                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-[#53CCB8]/10 border border-[#53CCB8]/30 text-[#53CCB8] text-[8px] font-black tracking-tighter">
                                                <Mic size={9} fill="currentColor" />
                                                {anime.dubEpisodes}
                                            </div>
                                        ) : null}
                                        <span className="px-1.5 py-0.5 rounded-[2px] bg-white/[0.03] border border-white/5 text-white/20 text-[8px] font-black tracking-tighter">{anime.type || 'tv'}</span>
                                    </div>

                                    {/* short description */}
                                    <p className="text-[10px] font-medium text-white/40 leading-relaxed mb-6 px-1 line-clamp-3">
                                        {anime.description?.replace(/<[^>]*>?/gm, '') || 'no description available for this anime.'}
                                    </p>

                                    {/* details list */}
                                    <div className="w-full space-y-2.5 pt-4 border-t border-white/[0.03] text-left">
                                        <div className="flex items-start gap-2 text-[10px]">
                                            <span className="text-white/30 font-bold shrink-0">country:</span>
                                            <span className="text-white font-bold">japan</span>
                                        </div>
                                        <div className="flex items-start gap-2 text-[10px]">
                                            <span className="text-white/30 font-bold shrink-0">genres:</span>
                                            <span className="text-white font-bold">
                                                {anime.genres?.slice(0, 3).join(', ')}
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-2 text-[10px]">
                                            <span className="text-white/30 font-bold shrink-0">premiered:</span>
                                            <span className="text-white font-bold">{anime.premiered || 'tba'}</span>
                                        </div>
                                        <div className="flex items-start gap-2 text-[10px]">
                                            <span className="text-white/30 font-bold shrink-0">date aired:</span>
                                            <span className="text-white font-bold">{anime.releaseDate || 'tba'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* footer: rating area - fixed at bottom */}
                            <div className="bg-[#0b0c10] px-5 py-6 text-center shrink-0 border-t border-white/[0.02]">
                                <h4 className="text-[12px] font-black text-[#FF4F18] mb-1 leading-tight">how&apos;d you rate this anime?</h4>
                                <p className="text-[9px] font-bold text-white/40 mb-4">
                                    <span className="text-white">{anime.score || '0.0'}</span> by {(anime.members || 0).toLocaleString()} reviews
                                </p>
                                <div className="flex items-center justify-center gap-1 px-2">
                                    {[1, 2, 3, 4, 5].map(i => {
                                        const score = anime.score || 0;
                                        const ratingOutof5 = Math.round(score / 2);
                                        return (
                                            <Star key={i} size={22} className={`${i <= ratingOutof5 ?'text-[#FF4F18] fill-[#FF4F18]' : 'text-white/5 fill-white/5'} transition-transform hover:scale-110 cursor-pointer`} />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* 2. video player panel */}
                    <div className="flex-1 min-w-0 flex flex-col order-1 lg:order-2">
                        <div className="bg-[#141519]/80 backdrop-blur-xl rounded-[8px] overflow-hidden shadow-2xl border border-white/[0.03] flex flex-col h-full">
                            {/* 1. Header: Breadcrumbs inside the card */}
                            <div className="px-5 py-3 h-10 flex items-center bg-[#0b0c10]/40 border-b border-white/[0.03]">
                                <div className="flex items-center gap-2 text-[10px] font-black text-white/30 tracking-widest">
                                    <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1.5 focus:outline-none">
                                        <Home size={11} /> Home
                                    </Link>
                                    <span className="opacity-20 text-[12px] font-light">/</span>
                                    <span className="text-white/40">{anime.type || 'tv'}</span>
                                    <span className="opacity-20 text-[12px] font-light">/</span>
                                    <span className="text-white/60 truncate max-w-[300px]">{title}</span>
                                </div>
                            </div>

                            {/* 2. Player + Server/Sub controls — handled by WatchControls (client) */}
                            <WatchControls
                                id={id}
                                episodeId={episodeId}
                                animeId={id}
                                episodeNumber={anime.episodes.find((e: Episode) => e.id === episodeId)?.number || 1}
                                animeStatus={anime.status}
                                broadcastString={anime.broadcast?.string}
                                prevEpId={prevEp?.id}
                                nextEpId={nextEp?.id}
                                dubEpisodes={anime.dubEpisodes}
                            />
                        </div>
                    </div>

                    {/* 3. episode list panel */}
                    <aside className="w-full lg:w-[320px] shrink-0 order-2 lg:order-3">
                        <div className="bg-[#141519] rounded-[6px] border border-white/[0.03] overflow-hidden shadow-xl flex flex-col h-[380px] lg:h-full">
                            <EpisodeList
                                animeId={id}
                                episodes={anime.episodes}
                                currentEpisodeId={episodeId}
                            />
                        </div>
                    </aside>
                </div>

                {/* lower section: 2-column layout */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* main area: comments */}
                    <div className="flex-1 min-w-0">
                        {/* 1. Comments Section */}
                        <div className="bg-[#141519]/40 backdrop-blur-sm rounded-[6px] border border-white/[0.03] p-6 min-h-[400px]">
                            <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-5">
                                <MessageSquare size={20} className="text-primary" />
                                <h2 className="text-lg font-black text-white tracking-tight">Comments</h2>
                            </div>
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <p className="text-sm font-bold text-white/20 tracking-widest">the comment section is coming soon...</p>
                            </div>
                        </div>
                    </div>

                    {/* sidebar: relations & recommended */}
                    <aside className="w-full lg:w-[320px] shrink-0 space-y-10">
                        {/* 1. relations sidebar (brief) */}
                        {sidebarRelations && sidebarRelations.length > 0 && (
                            <section className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[13px] font-black text-white tracking-tight border-l-3 border-primary pl-2.5">relations</h3>
                                </div>
                                <div className="space-y-3">
                                    {sidebarRelations.map((rel: any, i: number) => (
                                        <Link
                                            key={i}
                                            href={`/watch/${rel.mal_id}`}
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
                                                    {rel.dubEpisodes > 0 && (
                                                        <>
                                                            <div className="w-1 h-1 rounded-full bg-white/10" />
                                                            <span className="text-[9px] font-bold text-white/30">{rel.dubEpisodes} dub</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* 2. recommended */}
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
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent" />
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
                                                {rec.dubEpisodes > 0 && (
                                                    <>
                                                        <div className="w-1 h-1 rounded-full bg-white/10" />
                                                        <span className="text-[9px] font-bold text-white/30">{rec.dubEpisodes} dub</span>
                                                    </>
                                                )}
                                                <div className="w-1 h-1 rounded-full bg-white/10" />
                                                <span className="text-[9px] font-bold text-white/30">{rec.type || 'tv'}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </aside>
                </div>
            </div>

        </main >
    );
}
