import React from 'react';
import { fetchAnimeInfo, fetchAnimeVideos, fetchRelatedAnime, fetchAnimeCharacters, fetchAnimeThemes, fetchAnimeRelations } from '@/lib/consumet';
import { getTitle } from '@/types/anime';
import Navbar from '@/components/Navbar';
import AnimeCard from '@/components/AnimeCard';
import { Star, BookmarkPlus, ChevronRight, Play } from 'lucide-react';
import Link from 'next/link';
import CharacterSection from '@/components/CharacterSection';
import WatchComments from '@/components/WatchComments';

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const [anime, videosData, recommended, characters, themeSongs, relations] = await Promise.all([
        fetchAnimeInfo(id),
        fetchAnimeVideos(id).catch(() => null),
        fetchRelatedAnime(id),
        fetchAnimeCharacters(id),
        fetchAnimeThemes(id),
        fetchAnimeRelations(id),
    ]);

    if (!anime) {
        return (
            <div className="min-h-screen bg-[#161618] flex flex-col items-center justify-center p-4 text-center">
                <img src="/miku-not-found.png" alt="Not Found" className="w-44 h-44 object-contain mb-2 opacity-90 select-none" draggable={false} />
                <h1 className="text-2xl font-bold mb-2 text-white/40">Anime Not Found</h1>
                <p className="text-white/30 text-sm mb-6">The series you&apos;re looking for might have been moved or doesn&apos;t exist.</p>
                <Link href="/" className="bg-primary px-8 py-3 rounded-lg font-bold text-sm hover:opacity-90 transition-all">Go back home</Link>
            </div>
        );
    }

    const title = getTitle(anime.title);

    // Extract YouTube trailer — prefer /videos promo array, fall back to /full trailer.
    // Only return a trailer object when embedUrl is a non-null string.
    const trailer = (() => {
        const fallback = (anime as any).trailer;
        if (fallback?.embedUrl) return fallback;
        return null;
    })();

    // Format large numbers
    const formatNum = (val: any) => {
        const n = typeof val === 'number' ? val : parseInt(val);
        if (!n || isNaN(n)) return 'N/A';
        if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
        if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
        return n.toLocaleString();
    };

    const synopsis = anime.description?.replace(/<[^>]*>/g, '').trim() || 'No synopsis available.';
    const japaneseTitle = anime.japaneseTitle;
    const synonyms = (anime.synonyms || []).join(', ');
    const aired = anime.releaseDate;
    const duration = anime.duration;
    const status = anime.status;
    const episodes = anime.episodes?.length || anime.totalEpisodes;
    const rating = typeof anime.rating === 'string' ? anime.rating : null;
    const score = anime.score;
    const studios = anime.studios || [];
    const genres = anime.genres || [];

    // The /full endpoint gives us rank, popularity, members, favorites in the raw data
    // They are mapped via the anime object's structure
    const animeRaw = anime as any;
    const rank = animeRaw.rank;
    const popularity = animeRaw.popularity;
    const members = animeRaw.members;
    const favorites = animeRaw.favorites;
    const demographics = animeRaw.demographics?.map((d: any) => d.name) || [];

    return (
        <main className="min-h-screen bg-[#161618] text-white pb-20">
            <Navbar />

            {/* Blurred Background Hero */}
            <div className="relative w-full">
                <div className="absolute inset-0 h-72 overflow-hidden">
                    <img
                        src={anime.cover || anime.image}
                        alt=""
                        className="w-full h-full object-cover blur-[60px] scale-110 opacity-25"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#161618]/60 via-[#161618]/80 to-[#161618]" />
                </div>

                {/* Breadcrumbs */}
                <div className="relative z-10 container mx-auto px-4 md:px-6 pt-24 md:pt-32">
                    <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-white/30 mb-8">
                        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1.5">
                            Home
                        </Link>
                        <ChevronRight size={10} className="opacity-40" />
                        <span className="text-white/60">Details</span>
                        <ChevronRight size={10} className="opacity-40" />
                        <span className="text-primary truncate max-w-[200px]">{title}</span>
                    </div>
                </div>

                {/* Top Header Section */}
                <div className="relative z-10 container mx-auto px-4 md:px-6 pt-4 pb-6">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex flex-col md:flex-row gap-6 flex-1">
                            {/* Poster */}
                            <div className="flex-shrink-0 mx-auto md:mx-0">
                                <div className="w-[130px] rounded-lg overflow-hidden shadow-2xl border border-white/10 mx-auto">
                                    <img src={anime.image} alt={title} className="w-full h-full object-cover" />
                                </div>
                                <button className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-[10px] font-semibold text-white/70 hover:text-white transition-all">
                                    <BookmarkPlus size={13} />
                                    Add To List
                                </button>
                            </div>

                            {/* Info */}
                            <div className="flex-1 space-y-3">
                                {/* Type & Status badges */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    {anime.type && (
                                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white/10 border border-white/10 text-white/80">
                                            {anime.type}
                                        </span>
                                    )}
                                    {status && (
                                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded border ${status.toLowerCase().includes('airing')
                                            ? 'bg-[#2ECC71]/15 border-[#2ECC71]/40 text-[#2ECC71]'
                                            : 'bg-white/5 border-white/10 text-white/60'
                                            }`}>
                                            {status}
                                        </span>
                                    )}
                                    {score && (
                                        <div className="flex items-center gap-1 text-[12px] font-bold text-[#FFB941]">
                                            <Star size={12} fill="currentColor" />
                                            {score}
                                        </div>
                                    )}
                                    {studios.length > 0 && (
                                        <span className="text-[11px] font-semibold text-white/40 tracking-wide">
                                            {studios[0]}
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <h1 className="text-2xl md:text-3xl xl:text-4xl font-black text-white leading-tight tracking-tight">
                                    {title}
                                </h1>

                                {/* Japanese / Synonyms subtitle */}
                                {(japaneseTitle || synonyms) && (
                                    <p className="text-[12px] text-white/40 font-bold tracking-wider mb-4">
                                        {[japaneseTitle, synonyms].filter(Boolean).join(' · ')}
                                    </p>
                                )}

                                {/* Main CTA Buttons */}
                                <div className="flex flex-wrap items-center gap-3 mt-4">
                                    {anime.episodes?.[0] ? (
                                        <Link
                                            href={`/watch/${id}/${anime.episodes[0].id}`}
                                            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-full font-black text-sm transition-all shadow-lg hover:scale-105 active:scale-95"
                                        >
                                            <Play size={10} className="fill-current" />
                                            Watch Now
                                        </Link>
                                    ) : (
                                        <button className="flex items-center gap-2 bg-white/10 text-white/40 px-6 py-2.5 rounded-full font-black text-sm cursor-not-allowed">
                                            No Episodes
                                        </button>
                                    )}
                                </div>

                                {/* Stats Cards Row */}
                                <div className="flex flex-wrap items-center gap-3 pt-4">
                                    {/* <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center min-w-[100px]">
                                        <span className="text-[9px] font-black text-white/30 tracking-[0.2em] mb-1">Score</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-lg font-black text-white">{score ?? 'N/A'}</span>
                                            <Star size={12} className="text-[#FFB941] fill-current" />
                                        </div>
                                        {members && <span className="text-[8px] font-bold text-white/20 mt-0.5">{formatNum(members)} users</span>}
                                    </div> */}
                                    {rank && (
                                        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center min-w-[90px]">
                                            <span className="text-[9px] font-black text-white/30 tracking-[0.2em] mb-1">Rank</span>
                                            <span className="text-lg font-black text-white">#{rank}</span>
                                        </div>
                                    )}
                                    {popularity && (
                                        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center min-w-[90px]">
                                            <span className="text-[9px] font-black text-white/30 tracking-[0.2em] mb-1">Popularity</span>
                                            <span className="text-lg font-black text-white">#{popularity}</span>
                                        </div>
                                    )}
                                    {members && members > 0 && (
                                        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center min-w-[90px]">
                                            <span className="text-[9px] font-black text-white/30 tracking-[0.2em] mb-1">Members</span>
                                            <span className="text-lg font-black text-white">{formatNum(members)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar - Characters */}
                        <div className="hidden lg:block lg:w-[480px] xl:w-[600px] shrink-0 pl-4">
                            <CharacterSection characters={characters || []} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Body */}
            <div className="container mx-auto px-4 md:px-6 mt-6">
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* ─── LEFT SIDEBAR ─── */}
                    <aside className="lg:w-[260px] xl:w-[280px] flex-shrink-0 space-y-0 lg:self-start lg:sticky lg:top-24">
                        <div className="bg-[#1e1e22] rounded-xl border border-white/5 overflow-hidden">

                            {/* Alternative Titles */}
                            <div className="px-5 py-4 border-b border-white/5">
                                <h3 className="text-[11px] font-black tracking-widest text-white mb-3">Alternative Titles</h3>
                                {japaneseTitle && (
                                    <div className="mb-2">
                                        <p className="text-[10px] font-bold text-white/30 mb-0.5">Japanese</p>
                                        <p className="text-[12px] text-white/80 break-words">{japaneseTitle}</p>
                                    </div>
                                )}
                                {synonyms && (
                                    <div>
                                        <p className="text-[10px] font-bold text-white/30 mb-0.5">Synonyms</p>
                                        <p className="text-[12px] text-white/80 break-words">{synonyms}</p>
                                    </div>
                                )}
                                {!japaneseTitle && !synonyms && (
                                    <p className="text-[11px] text-white/30">None</p>
                                )}
                            </div>

                            {/* Basic Info */}
                            <div className="px-5 py-4 border-b border-white/5">
                                <h3 className="text-[11px] font-black tracking-widest text-white mb-3">Basic Info</h3>
                                <div className="space-y-2">
                                    {[
                                        { label: 'Type', value: anime.type },
                                        { label: 'Sub Episodes', value: anime.subEpisodes || anime.episodes?.length || anime.totalEpisodes },
                                        { label: 'Dub Episodes', value: (anime.dubEpisodes && anime.dubEpisodes > 0) ? anime.dubEpisodes : null },
                                        { label: 'Status', value: status },
                                        { label: 'Aired', value: aired },
                                        { label: 'Season', value: anime.premiered },
                                        { label: 'Genres', value: genres },
                                        { label: 'Duration', value: duration },
                                        { label: 'Rating', value: rating },
                                    ].map(({ label, value }) => value ? (
                                        <div key={label} className="flex items-start justify-between gap-2">
                                            <span className="text-[11px] font-bold text-white/40 shrink-0">{label}</span>
                                            {label === 'Genres' && Array.isArray(value) ? (
                                                <div className="flex flex-wrap justify-end gap-1">
                                                    {(value as string[]).map((g, i) => (
                                                        <Link
                                                            key={i}
                                                            href={`/genre/${g.toLowerCase().replace(/ /g, '-')}`}
                                                            className="hover:text-primary transition-colors text-[11px] text-white/80"
                                                        >
                                                            {g}{i < (value as string[]).length - 1 ? ',' : ''}
                                                        </Link>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-[11px] text-white/80 text-right">{String(value)}</span>
                                            )}
                                        </div>
                                    ) : null)}
                                </div>
                            </div>

                            {/* Credits */}
                            {studios.length > 0 && (
                                <div className="px-5 py-4 border-b border-white/5">
                                    <h3 className="text-[11px] font-black tracking-widest text-white mb-3">Credits</h3>
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="text-[11px] font-bold text-white/40 shrink-0">Studio</span>
                                        <span className="text-[11px] text-white/80 text-right">{studios.join(', ')}</span>
                                    </div>
                                    {demographics.length > 0 && (
                                        <div className="flex items-start justify-between gap-2 mt-2">
                                            <span className="text-[11px] font-bold text-white/40 shrink-0">Demographics</span>
                                            <span className="text-[11px] text-white/80 text-right">{demographics.join(', ')}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Statistics */}
                            <div className="px-5 py-4">
                                <h3 className="text-[11px] font-black tracking-widest text-white mb-3">Statistics</h3>
                                <div className="space-y-2">
                                    {[
                                        { label: 'Rank', value: rank ? `#${rank}` : null },
                                        { label: 'Popularity', value: popularity ? `#${popularity}` : null },
                                        { label: 'Members', value: members ? members.toLocaleString() : null },
                                        { label: 'Favorites', value: favorites ? favorites.toLocaleString() : null },
                                    ].map(({ label, value }) => value ? (
                                        <div key={label} className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-white/40">{label}</span>
                                            <span className="text-[11px] font-black text-white/80">{value}</span>
                                        </div>
                                    ) : null)}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* ─── MAIN CONTENT ─── */}
                    <div className="flex-1 space-y-6 min-w-0">

                        {/* Synopsis */}
                        <section className="bg-white/[0.03] rounded-xl border border-white/5 p-6 md:p-8">
                            <div className="flex items-center gap-2 mb-4">
                                <h2 className="text-sm font-black text-white tracking-widest border-l-4 border-primary pl-3">Synopsis</h2>
                            </div>
                            <p className="text-[13px] md:text-sm text-white/60 leading-relaxed font-medium">
                                {synopsis}
                            </p>
                        </section>

                        {/* Trailer */}
                        {trailer?.embedUrl && (
                            <section className="bg-white/[0.03] rounded-xl border border-white/5 p-6 md:p-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <h2 className="text-sm font-black text-white tracking-widest border-l-4 border-primary pl-3">Trailer</h2>
                                </div>
                                <div className="aspect-video w-full rounded-lg overflow-hidden shadow-2xl border border-white/5 bg-black/40">
                                    <iframe
                                        src={trailer.embedUrl}
                                        title={`${title} Trailer`}
                                        className="w-full h-full"
                                        allowFullScreen
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    />
                                </div>
                            </section>
                        )}





                        {/* More Seasons Section */}
                        {anime.moreSeasons && anime.moreSeasons.length > 0 && (
                            <section className="bg-white/[0.03] rounded-xl border border-white/5 p-6 md:p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-sm font-black text-white tracking-widest border-l-4 border-primary pl-3">More Seasons</h2>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {anime.moreSeasons.map((season: any, i: number) => {
                                        const seasonTitle = getTitle(season.title);
                                        return (
                                            <Link key={i} href={`/watch/${season.id}`} className={`flex flex-col gap-2 p-3 rounded-lg border border-white/5 transition-all hover:bg-white/5 ${season.isActive ? "bg-white/10 border-primary/50 pointer-events-none" : "bg-[#0b0c10]/40"}`}>
                                                <div className="relative aspect-video rounded-md overflow-hidden bg-white/5">
                                                    {season.image ? <img src={season.image} className="w-full h-full object-cover" /> : null}
                                                    {season.isActive && <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-sm"><Play size={20} className="text-white drop-shadow-lg" /></div>}
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <h4 className="text-[12px] font-bold text-white line-clamp-1 truncate">{seasonTitle}</h4>
                                                    <p className="text-[10px] text-white/40 truncate">{season.type || 'TV'} • {season.subEpisodes || season.totalEpisodes || '?'} eps</p>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </section>
                        )}
                        {/* Characters (Mobile) */}
                        <section className="lg:hidden bg-white/[0.03] rounded-xl border border-white/5 p-6 md:p-8">
                            <CharacterSection characters={characters || []} />
                        </section>

                        {/* Recommended Section */}
                        {anime.recommended && anime.recommended.length > 0 && (
                            <section className="bg-white/[0.03] rounded-xl border border-white/5 p-6 md:p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-sm font-black text-white tracking-widest border-l-4 border-primary pl-3">Recommendations</h2>
                                    <span className="text-[10px] font-bold text-white/30 tracking-widest flex items-center gap-1">
                                        more <ChevronRight size={12} />
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {anime.recommended.slice(0, 10).map((item: any, i: number) => (
                                        <AnimeCard key={`rec-${item.id}-${i}`} anime={item} variant="portrait" />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Most Popular Section */}
                        {anime.mostPopular && anime.mostPopular.length > 0 && (
                            <section className="bg-white/[0.03] rounded-xl border border-white/5 p-6 md:p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-sm font-black text-white tracking-widest border-l-4 border-primary pl-3">Most Popular</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {anime.mostPopular.slice(0, 9).map((item: any, i: number) => {
                                        const popularTitle = getTitle(item.title);
                                        return (
                                            <Link key={i} href={`/watch/${item.id}`} className="flex gap-3 bg-[#0b0c10]/40 hover:bg-white/5 transition-colors p-3 rounded-lg border border-white/5 group">
                                                <div className="w-12 h-16 shrink-0 rounded overflow-hidden">
                                                    <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                </div>
                                                <div className="flex flex-col justify-center min-w-0">
                                                    <p className="text-[12px] font-bold text-white truncate group-hover:text-primary transition-colors">{popularTitle}</p>
                                                    <p className="text-[10px] text-white/40 mt-1 tracking-wider flex items-center gap-1.5 flex-wrap">
                                                        <span>{item.type}</span>
                                                        {item.subEpisodes > 0 && (
                                                            <>
                                                                <span className="opacity-20">•</span>
                                                                <span className="text-white/60">SUB {item.subEpisodes}</span>
                                                            </>
                                                        )}
                                                        {item.dubEpisodes > 0 && (
                                                            <>
                                                                <span className="opacity-20">•</span>
                                                                <span className="text-primary/80">DUB {item.dubEpisodes}</span>
                                                            </>
                                                        )}
                                                    </p>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                    </div>

                </div>
            </div>
        </main>
    );
}
