"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    Calendar,
    Award,
    Zap,
    TrendingUp,
    MessageSquare,
    ThumbsUp,
    Reply,
    ChevronRight,
    Loader2,
    CheckCircle2,
    ShieldCheck,
    History,
    Grid,
    Clock,
    ChevronUp,
    ChevronsUp,
    ChevronDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import AnimeCard from '@/components/AnimeCard';
import { timeAgo } from '@/utils/dateUtils';

interface UserData {
    _id: string;
    username: string;
    avatar?: string;
    banner?: string;
    role: 'user' | 'moderator' | 'admin';
    createdAt: string;
    level: number;
    power: number;
    rank: string;
    watchlist: any[];
}

interface Activity {
    _id: string;
    activityType: 'comment' | 'reply' | 'like' | 'post';
    text: string;
    animeId?: string;
    animeTitle?: string;
    animeImage?: string;
    episodeNumber?: number;
    createdAt: string;
}

const PublicProfilePage = () => {
    const { username } = useParams();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [watchlistLimit, setWatchlistLimit] = useState(10);
    const [enrichedWatchlist, setEnrichedWatchlist] = useState<any[]>([]);

    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030') + '/api/v1';
    const CONSUMET_API = API_URL; // same base

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/user/${username}`);
                const data = await res.json();

                if (data.success) {
                    setUserData(data.data.user);
                    setActivities(data.data.activities);

                    // Enrich watchlist with anime details (sub/dub/episodes)
                    const watchlist = data.data.user.watchlist || [];
                    const watchlistMap: Record<string, string> = {};
                    watchlist.forEach((w: any) => { if (w.animeId) watchlistMap[w.animeId] = w.animeImage; });

                    const enriched = await Promise.all(
                        watchlist.map(async (item: any) => {
                            try {
                                const animeRes = await fetch(`${API_URL}/anime/${item.animeId}`);
                                if (!animeRes.ok) return item;
                                const animeData = await animeRes.json();
                                // API returns: { success: true, data: { episodes: { sub, dub, eps }, type, poster, ... } }
                                const info = animeData?.data || {};
                                return {
                                    ...item,
                                    subEpisodes: info.episodes?.sub || 0,
                                    dubEpisodes: info.episodes?.dub || 0,
                                    totalEpisodes: info.episodes?.eps || info.episodes?.sub || 0,
                                    type: info.type || item.type || 'TV',
                                    animeImage: item.animeImage || info.poster,
                                };
                            } catch {
                                return item;
                            }
                        })
                    );
                    setEnrichedWatchlist(enriched);

                    // Enrich activities with anime images from watchlist map
                    const enrichedActivities = (data.data.activities || []).map((act: any) => ({
                        ...act,
                        animeImage: act.animeId ? (watchlistMap[act.animeId] || null) : null,
                    }));
                    setActivities(enrichedActivities);
                    return; // already set activities above
                } else {
                    setError(data.message || 'User not found');
                }
            } catch (err) {
                setError('Error fetching profile');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (username) fetchProfile();
    }, [username, API_URL]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#161618] text-white flex flex-col">
                <Navbar className="bg-[#161618]/50 backdrop-blur-md !py-2 md:!py-3" />

                {/* Hero Skeleton */}
                <div className="relative w-full overflow-hidden h-[66vh]">
                    <div className="absolute inset-0 bg-[#1a1b20] animate-pulse" />
                    <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#161618] to-transparent z-[3]" />
                    <div className="relative z-10 h-full flex flex-col justify-center md:justify-end pb-8 md:pb-12 pt-[80px] md:pt-0">
                        <div className="w-full px-4">
                            <div className="w-full max-w-[896px] h-auto md:h-[142px] mx-auto flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16">
                                <div className="flex flex-row items-center gap-5 md:contents w-full justify-center md:w-auto">
                                    {/* Left: Avatar Skeleton */}
                                    <div className="relative shrink-0 flex items-center md:min-w-[100px] justify-center md:justify-end md:pr-4">
                                        <div className="w-[90px] h-[90px] rounded-[50%] bg-white/5 animate-pulse" />
                                    </div>

                                    {/* Center: Info Column Skeleton */}
                                    <div className="flex flex-col items-start justify-center space-y-3 md:space-y-4 w-auto md:w-[200px]">
                                        <div className="flex items-center gap-2">
                                            <div className="hidden md:flex w-5 h-5 rounded-full bg-white/5 animate-pulse" />
                                            <div className="h-6 w-32 bg-white/5 rounded-md animate-pulse" />
                                        </div>
                                        <div className="flex flex-col items-start gap-2 md:gap-3">
                                            <div className="h-4 w-16 bg-white/5 rounded-[3px] animate-pulse" />
                                            <div className="h-3 w-24 bg-white/5 rounded-md animate-pulse" />
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Stats Column Skeleton */}
                                <div className="shrink-0 w-full md:w-[240px] flex flex-col items-center md:items-start justify-center space-y-4 md:space-y-5 pt-4 md:pt-0 border-t border-white/5 md:border-transparent">
                                    <div className="flex items-center justify-center md:justify-start gap-3">
                                        <div className="h-5 w-16 bg-white/5 rounded-md animate-pulse" />
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-white/5 animate-pulse" />
                                            <div className="h-6 w-12 bg-white/5 rounded-md animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="space-y-3 flex flex-col items-center md:items-start w-full">
                                        <div className="flex items-center justify-center md:justify-start gap-3 w-full">
                                            <div className="h-[5px] w-[120px] bg-white/5 rounded-full animate-pulse" />
                                            <div className="h-3 w-8 bg-white/5 rounded-md animate-pulse" />
                                        </div>
                                        <div className="h-2 w-20 bg-white/5 rounded-md animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Sections Skeleton */}
                <div className="max-w-[1290px] mx-auto w-full px-0 md:px-6 pt-0 pb-6 md:py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                    {/* Left Side: Rank System & Watchlist */}
                    <div className="lg:col-span-8 flex flex-col gap-8 md:gap-0 md:space-y-8">
                        {/* Rank Progression Skeleton */}
                        <div className="bg-[#1f2029] rounded-none md:rounded-[3rem] shadow-none md:shadow-2xl relative overflow-hidden flex flex-col items-center pt-10 pb-14 h-[280px] animate-pulse" />

                        {/* Watch List Section Skeleton */}
                        <div className="space-y-8 px-4 md:px-0">
                            <div className="flex items-center justify-between">
                                <div className="h-6 w-32 bg-white/5 rounded-md animate-pulse" />
                                <div className="h-6 w-20 bg-white/5 rounded-full animate-pulse" />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-x-3 gap-y-7">
                                {[...Array(14)].map((_, i) => (
                                    <div key={i} className="aspect-[3/4] bg-white/5 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Activity Sidebar Section */}
                    <div className="lg:col-span-4 space-y-8 px-4 md:px-0">
                        <div className="bg-[#1e1e22]/50 border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl h-[500px] animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !userData) {
        return (
            <div className="min-h-screen bg-[#161618] flex flex-col items-center justify-center text-center px-4">
                <Navbar />
                <div className="mt-20">
                    <h2 className="text-2xl font-bold text-white mb-4">{error || 'User not found'}</h2>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-2 bg-primary text-[#0f1012] rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const ranks = [
        { name: 'New', requirement: "Let's Go", minLevel: 0, icon: 'shield-check' },
        { name: 'Angelfish', requirement: '60K ZRC', minLevel: 5, icon: 'chevron-up' },
        { name: 'Crab', requirement: '120K ZRC', minLevel: 15, icon: 'chevrons-up' },
        { name: 'Starfish', requirement: '180K ZRC', minLevel: 30, icon: 'chevrons-up' },
        { name: 'Dolphin', requirement: '240K ZRC', minLevel: 50, icon: 'chevron-down' },
    ];

    const currentRankIndex = ranks.findIndex(r => r.name === userData.rank) || 0;
    const progressToNext = (userData.level % 10) * 10; // Mock progress logic

    return (
        <div className="min-h-screen bg-[#161618] text-white flex flex-col">
            <Navbar className="bg-[#161618]/50 backdrop-blur-md !py-2 md:!py-3" />

            {/* 1. Profile Hero Section */}
            <div className="relative w-full overflow-hidden h-[66vh]">
                {/* Background Hero Image with Layers */}
                <div className="absolute inset-0">
                    {/* Banner-style Hero Background (Requested: like banner, fill the space) */}
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `url(${userData.banner || userData.avatar || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop'})`,
                            backgroundSize: 'cover', // Fills the banner area completely
                            backgroundPosition: 'center 30%', // Focused slightly higher for better framing
                            filter: 'brightness(0.6) blur(7px)', // Added a subtle blur as requested
                        }}
                    />

                    {/* Dotted Pattern Overlay with Backdrop Blur (Requested: points as blur to hide image) */}
                    <div
                        className="absolute inset-0 z-[2] opacity-[0.75]"
                        style={{
                            backgroundImage: 'radial-gradient(rgba(46, 46, 46, 0.55) 0.8px, transparent 0)',
                            backgroundSize: '5px 5px',
                            backdropFilter: 'blur(25px)',
                            WebkitBackdropFilter: 'blur(25px)',
                        }}
                    />

                    {/* Gradients like HeroCarousel & Globals.css */}
                    {/* Deep Bottom Fade (Requested: connect to below seamlessly) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#161618] via-[#161618]/40 to-transparent z-[2]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#161618]/40 via-transparent to-[#161618]/40 z-[1]" />
                </div>
                {/* Top/Bottom Edge Smoothing */}
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#161618] to-transparent z-[3]" />
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#161618] to-transparent z-[3]" />

                {/* Profile Info Content Overlay (Requested: two-column design style) */}
                <div className="relative z-10 h-full flex flex-col justify-center md:justify-end pb-8 md:pb-12 pt-[80px] md:pt-0">
                    <div className="w-full px-4">
                        <div className="w-full max-w-[896px] h-auto md:h-[142px] mx-auto flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16">
                            
                            <div className="flex flex-row items-center gap-5 md:contents w-full justify-center md:w-auto">
                                {/* Left: Avatar with Ring */}
                                <div className="relative shrink-0 flex items-center md:min-w-[100px] justify-center md:justify-end md:pr-4">
                                    <div className="w-[95px] h-[95px] rounded-[50%] p-0 md:p-1 bg-none md:bg-gradient-to-tr md:from-primary md:via-primary/50 md:to-pink-500 shadow-none md:shadow-[0_0_15px_rgba(83,204,184,0.25)]">
                                        <div className="w-full h-full rounded-[50%] border-0 md:border-[1px] md:border-[#161618] bg-[#1a1b20] overflow-hidden">
                                            {userData.avatar ? (
                                                <img src={userData.avatar} className="w-full h-full object-cover shadow-inner" alt={userData.username} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center rounded-[50%]">
                                                    <span className="text-3xl font-black text-white/5 uppercase">{userData.username[0]}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Center: Info Column */}
                                <div className="flex flex-col items-start justify-center space-y-1.5 md:space-y-4 w-auto md:w-[200px]">
                                    <div className="flex items-center gap-2">
                                        <div className="hidden md:flex w-5 h-5 rounded-full bg-yellow-500/20 items-center justify-center border border-yellow-500/30">
                                            <ChevronRight size={12} className="text-yellow-500 -rotate-90" />
                                        </div>
                                        <h1 className="text-[22px] md:text-xl font-black tracking-tight text-white drop-shadow-xl italic text-left">
                                            {userData.username}
                                        </h1>
                                    </div>

                                    <div className="flex flex-col items-start gap-1.5 md:gap-3">
                                        {/* Styled Role Badge */}
                                        <div className="inline-block px-1.5 py-[1px] rounded-[3px] border border-white/50 text-[10px] md:text-[8px] font-bold uppercase tracking-wider text-white bg-transparent leading-none">
                                            {userData.role?.toLowerCase() === 'user' || !userData.role ? 'MEMBER' : userData.role.toUpperCase()}
                                        </div>

                                        <div className="text-[12px] font-bold text-[#717282] tracking-tight text-left">
                                            Joined: {new Date(userData.createdAt).toISOString().split('T')[0]}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Stats Column */}
                            <div className="shrink-0 w-full md:w-[240px] flex flex-col items-center md:items-start justify-center space-y-4 md:space-y-5 pt-4 md:pt-0 border-t border-white/5 md:border-transparent">
                                {/* Power Display */}
                                <div className="flex items-center justify-center md:justify-start gap-3">
                                    <span className="text-sm md:text-base font-bold uppercase tracking-tight text-white/90">Power:</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-black text-primary border border-white/10 shadow-lg">Z</div>
                                        <span className="text-xl font-black text-white tracking-tighter shadow-sm">
                                            {userData.power >= 1000 ? `${(userData.power / 1000).toFixed(0)}K` : userData.power}
                                        </span>
                                    </div>
                                </div>

                                {/* Sub-Stats / Earning link */}
                                <div className="space-y-3 flex flex-col items-center md:items-start">
                                    <div className="flex items-center justify-center md:justify-start gap-3">
                                        <div className="h-[5px] w-[120px] bg-white/5 rounded-full overflow-hidden border border-white/[0.03]">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progressToNext}%` }}
                                                className="h-full bg-white opacity-90 shadow-[0_0_10px_white] rounded-full"
                                            />
                                        </div>
                                        <span className="text-[11px] font-black text-white/70 min-w-[40px] text-right md:text-left">{progressToNext.toFixed(2)}%</span>
                                    </div>
                                    <button className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-primary transition-colors block text-center md:text-left w-full md:w-auto mt-1 md:mt-0">
                                        Earning History
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Content Sections */}
            <div className="max-w-[1290px] mx-auto w-full px-0 md:px-6 pt-0 pb-6 md:py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">

                {/* Left Side: Rank System & Watchlist */}
                <div className="lg:col-span-8 flex flex-col gap-8 md:gap-0 md:space-y-8">

                    {/* Horizontal Rank Progression (Precisely 720x148 for content area) */}
                    <div className="bg-[#1f2029] rounded-none md:rounded-[3rem] shadow-none md:shadow-2xl relative overflow-hidden flex flex-col items-center">
                        <div className="role-line w-full overflow-x-auto no-scrollbar">
                            <div className="role-line-wrap flex w-[720px] h-[148px] mx-auto relative z-20">
                                {ranks.map((rank, idx) => {
                                    const isReached = idx <= currentRankIndex;
                                    const isCurrent = idx === currentRankIndex;

                                    return (
                                        <div key={rank.name} className="rlw-point w-[144px] h-[148px] flex flex-col items-center justify-center relative group">
                                            {/* Rank Name */}
                                            <span className={`text-[16px] font-black mb-1.5 transition-colors duration-500 ${isReached ? 'text-white' : 'text-white/20'}`}>
                                                {rank.name}
                                            </span>

                                            {/* Requirement with Z Icon */}
                                            <div className="flex items-center gap-1.5 mb-4">
                                                {idx > 0 && (
                                                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-black border ${isReached ? 'bg-[#717282] border-white/20 text-white' : 'bg-white/5 border-white/5 text-white/5'}`}>
                                                        Z
                                                    </div>
                                                )}
                                                <span className={`text-[11px] font-bold tracking-tight transition-colors duration-500 ${isReached ? 'text-[#717282]' : 'text-white/10'}`}>
                                                    {rank.requirement}
                                                </span>
                                            </div>

                                            {/* Icon Section */}
                                            <div className="h-12 flex items-center justify-center">
                                                <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-700 relative z-30 ${isCurrent ? 'bg-yellow-400 text-[#161618] shadow-[0_0_25px_rgba(250,204,21,0.5)]' :
                                                    isReached ? 'bg-gradient-to-b from-[#4a4b5a] to-[#2a2b30] text-yellow-400 border border-white/10 shadow-lg' :
                                                        'bg-[#1a1b20] text-white/5 border border-white/[0.02]'
                                                    }`}>
                                                    {rank.icon === 'shield-check' && (
                                                        <div className={`w-6 h-6 ${!isReached ? 'opacity-10 grayscale' : 'opacity-40'}`} style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', background: 'currentColor' }} />
                                                    )}
                                                    {rank.icon === 'chevron-up' && <ChevronUp size={24} strokeWidth={4} />}
                                                    {rank.icon === 'chevrons-up' && (
                                                        <div className="flex flex-col -space-y-3.5">
                                                            <ChevronUp size={24} strokeWidth={4} />
                                                            <ChevronUp size={24} strokeWidth={4} />
                                                        </div>
                                                    )}
                                                    {rank.icon === 'chevron-down' && (
                                                        <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-[#161618] shadow-inner">
                                                            <ChevronDown size={20} strokeWidth={4} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Vertical Dash Line */}
                                            <div className="absolute top-[108px] h-10 w-[1px] border-r border-dashed border-white/[0.15]" />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Bottom Progress Bar Section (Positioned for no extra padding) */}
                            <div className="role-line-load w-[720px] mx-auto relative h-12 z-40 px-[72px] flex items-center">
                                <div className="h-[2px] w-full bg-white/10 rounded-full relative">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(currentRankIndex / (ranks.length - 1)) * 100}%` }}
                                        className="h-full bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.7)]"
                                    />

                                    <motion.div
                                        initial={{ left: 0 }}
                                        animate={{ left: `${(currentRankIndex / (ranks.length - 1)) * 100}%` }}
                                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-50"
                                    >
                                        <div className="w-11 h-11 rounded-full p-[2px] bg-[#1f2029] border-[2.5px] border-white shadow-2xl overflow-hidden">
                                            <div className="w-full h-full rounded-full border border-yellow-400 overflow-hidden">
                                                <img
                                                    src={userData.avatar || 'https://via.placeholder.com/150'}
                                                    className="w-full h-full object-cover"
                                                    alt="Progress"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Watch List Section (Requested: smaller cards section) */}
                    <div className="space-y-8 px-4 md:px-0">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black tracking-tight flex items-center gap-3 text-white/90">
                                <Grid className="text-primary" />
                                Watch List
                            </h2>
                            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-white/40 uppercase tracking-widest">
                                {userData.watchlist.length} Title{userData.watchlist.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {(enrichedWatchlist.length > 0 ? enrichedWatchlist : userData.watchlist).length > 0 ? (
                            <div className="space-y-10">
                                {/* Compact Grid: exactly 5 cols = 2 rows of 5 */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-2 gap-y-4 md:gap-x-3 md:gap-y-7">
                                        {(enrichedWatchlist.length > 0 ? enrichedWatchlist : userData.watchlist).slice(0, watchlistLimit).map((item) => (
                                            <AnimeCard
                                                key={item.animeId}
                                                anime={{
                                                    id: item.animeId,
                                                    title: item.animeTitle,
                                                    poster: item.animeImage,
                                                    type: item.type || 'TV',
                                                    duration: item.duration,
                                                    status: item.status,
                                                    subEpisodes: item.subEpisodes,
                                                    dubEpisodes: item.dubEpisodes,
                                                    totalEpisodes: item.totalEpisodes || item.episodeNumber
                                                }}
                                                variant="portrait"
                                                isSharp={true}
                                            />
                                        ))}
                                    </div>

                                {userData.watchlist.length > watchlistLimit && (
                                    <button
                                        onClick={() => setWatchlistLimit(prev => prev + 10)}
                                        className="w-full py-5 bg-[#1e1e22]/50 border border-white/5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-primary hover:bg-[#1e1e22] transition-all flex items-center justify-center gap-3 group"
                                    >
                                        View All List Items
                                        <ChevronRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="bg-[#1e1e22]/30 border border-white/5 rounded-[2rem] py-20 flex flex-col items-center justify-center opacity-25">
                                <Clock size={48} className="mb-4" />
                                <span className="font-bold uppercase tracking-widest text-sm">List is currently empty</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Activity Sidebar Section */}
                <div className="lg:col-span-4 space-y-8 px-4 md:px-0">
                    <div className="space-y-6">

                        {/* HiAnime-style title: left accent bar + title */}
                        <div className="flex items-center gap-3">
                            <div className="w-1 self-stretch bg-primary rounded-full" />
                            <h3 className="text-[18px] font-black text-white">Latest Activities</h3>
                        </div>

                        {/* Activity List — no card, no bg, HiAnime style with anime image */}
                        <div className="flex flex-col gap-5">
                            {activities.length > 0 ? (
                                activities.map((activity: Activity) => (
                                    <div key={activity._id} className="flex gap-3 group">
                                        {/* Anime poster thumbnail (like HiAnime) */}
                                        <div className="shrink-0 w-[52px] h-[68px] rounded-[4px] overflow-hidden bg-white/5 border border-white/[0.06]">
                                            {activity.animeImage ? (
                                                <img
                                                    src={activity.animeImage}
                                                    alt={activity.animeTitle || ''}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    {activity.activityType === 'comment' && <MessageSquare size={16} className="text-blue-400/50" />}
                                                    {activity.activityType === 'reply' && <Reply size={16} className="text-green-400/50" />}
                                                    {activity.activityType === 'like' && <ThumbsUp size={16} className="text-pink-400/50" />}
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 mb-1 text-[11px] text-white/30 font-medium">
                                                <MessageSquare size={10} className="shrink-0" />
                                                <span>{timeAgo(activity.createdAt)}</span>
                                            </div>
                                            <p className="text-[13px] text-white/80 leading-snug group-hover:text-white transition-colors">
                                                <span className="font-bold text-white">
                                                    {activity.activityType === 'comment' ? 'commented' : activity.activityType === 'reply' ? 'replied' : 'liked'}
                                                </span>
                                                {activity.animeTitle && (
                                                    <> on Anime <span className="text-primary font-semibold">{activity.animeTitle}</span>
                                                        {activity.episodeNumber ? ` Ep ${activity.episodeNumber}` : ''}
                                                    </>
                                                )}
                                            </p>

                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-10 text-center opacity-20">
                                    <History size={36} className="mx-auto mb-3" />
                                    <p className="text-[11px] font-black tracking-widest">No Recent Activity</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PublicProfilePage;
