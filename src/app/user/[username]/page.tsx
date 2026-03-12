"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
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
    History,
    Grid,
    Clock,
    EyeOff,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import AnimeCard from '@/components/AnimeCard';
import { timeAgo } from '@/utils/dateUtils';
import { getRankIconByXP } from '@/utils/rankUtils';

interface UserData {
    _id: string;
    username: string;
    avatar?: string;
    banner?: string;
    role: 'user' | 'moderator' | 'admin' | 'owner';
    createdAt: string;
    level: number;
    power: number;
    rank: string;
    watchlist: any[];
    isWatchlistPublic?: boolean;
}

interface Activity {
    _id: string;
    activityType: 'comment' | 'reply' | 'like' | 'post';
    text: string;
    animeId?: string;
    animeTitle?: string;
    animeImage?: string;
    episodeId?: string;
    episodeNumber?: number;
    commentId?: string;
    content?: string;
    parentCommentAuthor?: string;
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
    const [showExactPower, setShowExactPower] = useState(false);

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
                                if (!animeRes.ok) return {
                                    ...item,
                                    subEpisodes: item.episodeNumber || 0,
                                    totalEpisodes: item.episodeNumber || 0
                                };
                                const animeData = await animeRes.json();
                                const info = animeData?.data || {};
                                return {
                                    ...item,
                                    subEpisodes: info.episodes?.sub || item.episodeNumber || 0,
                                    dubEpisodes: info.episodes?.dub || 0,
                                    totalEpisodes: info.episodes?.eps || info.episodes?.sub || item.episodeNumber || 0,
                                    type: info.type || item.type || 'TV',
                                    score: info.MAL_score || info.score,
                                    rating: info.rating,
                                    animeImage: item.animeImage || info.poster,
                                };
                            } catch {
                                return {
                                    ...item,
                                    subEpisodes: item.episodeNumber || 0,
                                    totalEpisodes: item.episodeNumber || 0
                                };
                            }
                        })
                    );
                    setEnrichedWatchlist(enriched);

                    // Enrich activities with anime images from watchlist map
                    const enrichedActivities = (data.data.activities || []).map((act: any) => ({
                        ...act,
                        animeImage: act.animeImage || (act.animeId ? (watchlistMap[act.animeId] || null) : null),
                    }));
                    setActivities(enrichedActivities);
                    return;
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
            <div className="min-h-screen bg-background text-white flex flex-col">
                <Navbar className="bg-background/50 backdrop-blur-md !py-2 md:!py-3" />

                {/* Hero Skeleton */}
                <div className="relative w-full overflow-hidden h-[66vh]">
                    <div className="absolute inset-0 bg-[#1a1b20] animate-pulse" />
                    <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent z-[3]" />
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
                        <div className="bg-sidebar rounded-none md:rounded-[3rem] relative overflow-hidden flex flex-col items-center pt-10 pb-14 h-[280px] animate-pulse" />

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
                        <div className="bg-sidebar rounded-[2rem] overflow-hidden h-[500px] animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !userData) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
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
        { name: 'The Casual', requirement: '10,000 XP', minXP: 10001, maxXP: 45000, icon: '/The_Casual1.png' },
        { name: 'The Seeker', requirement: '45,000 XP', minXP: 45001, maxXP: 100000, icon: '/The_seeker2.png' },
        { name: 'The Otaku', requirement: '100,000 XP', minXP: 100001, maxXP: 175000, icon: '/The_otaku-3.png' },
        { name: 'The Enthusiast', requirement: '175,000 XP', minXP: 175001, maxXP: 252609, icon: '/The_Enthusiast-4.png' },
        { name: 'The Historian', requirement: '252,610 XP', minXP: 252610, maxXP: 1000000, icon: '/The_Histraions-5.png' },
    ];

    const totalXP = (userData as any).totalXP ?? userData.power ?? 0;
    
    // Find highest rank reached
    let currentRankIndex = -1;
    for (let i = ranks.length - 1; i >= 0; i--) {
        if (totalXP >= ranks[i].minXP) {
            currentRankIndex = i;
            break;
        }
    }

    // Calculate progress within current rank segment
    let progressToNext = 0;
    if (currentRankIndex === -1) {
        // Range: 0 to 10,000 (Towards Casual)
        progressToNext = Math.min(100, (totalXP / 10000) * 100);
    } else if (currentRankIndex < ranks.length - 1) {
        // Range: Current Rank Min to Next Rank Min
        const current = ranks[currentRankIndex];
        const next = ranks[currentRankIndex + 1];
        const range = next.minXP - current.minXP;
        const earned = totalXP - current.minXP;
        progressToNext = Math.min(100, Math.max(0, (earned / range) * 100));
    } else {
        // Max Rank (Historian)
        progressToNext = 100;
    }

    // Calculate marker position on the bar (0-100%)
    // The bar segments are: 
    // Start -> Casual (Idx 0) -> Seeker (Idx 1) -> Otaku (Idx 2) -> Enthusiast (Idx 3) -> Historian (Idx 4)
    // However, the bar points are the ranks themselves. 
    // Points at: 0%, 25%, 50%, 75%, 100%.
    
    let overallProgress = 0;
    const segmentSize = 25; // 100 / (5 points - 1 segment between points? No, 4 segments)

    if (currentRankIndex === -1) {
        // Moving from 0 XP to Point 0 (The Casual)
        // But the first point (Casual) is usually at 0%. 
        // If they are unranked, we'll keep them at 0% or slightly before.
        overallProgress = 0; 
    } else {
        // Between Casual (0%) and Historian (100%)
        overallProgress = (currentRankIndex * segmentSize) + ((progressToNext / 100) * segmentSize);
    }
    
    overallProgress = Math.min(100, Math.max(0, overallProgress));

    return (
        <div className="min-h-screen bg-background text-white flex flex-col">
            <Navbar className="bg-background/50 backdrop-blur-md !py-2 md:!py-3" />

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
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-[2]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40 z-[1]" />
                </div>
                {/* Top/Bottom Edge Smoothing */}
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent z-[3]" />
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-background to-transparent z-[3]" />

                {/* Profile Info Content Overlay (Requested: two-column design style) */}
                <div className="relative z-10 h-full flex flex-col justify-center md:justify-end pb-8 md:pb-12 pt-[80px] md:pt-0">
                    <div className="w-full px-4">
                        <div className="w-full max-w-[896px] h-auto md:h-[142px] mx-auto flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16">

                            <div className="flex flex-row items-center gap-5 md:contents w-full justify-center md:w-auto">
                                {/* Left: Avatar with Ring */}
                                <div className="relative shrink-0 flex items-center md:min-w-[100px] justify-center md:justify-end md:pr-4">
                                    <div className="w-[95px] h-[95px] rounded-[50%] p-0 md:p-1 bg-none md:bg-gradient-to-tr md:from-primary md:via-primary/50 md:to-pink-500">
                                        <div className="w-full h-full rounded-[50%] bg-[#181818] overflow-hidden">
                                            {userData.avatar ? (
                                                <img src={userData.avatar} className="w-full h-full object-cover" alt={userData.username} />
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
                                    <div className="flex items-center gap-1">
                                        {(() => {
                                            const rankIcon = getRankIconByXP(totalXP);
                                            return rankIcon ? (
                                                <img
                                                    src={rankIcon}
                                                    width={25}
                                                    height={25}
                                                    alt="rank icon"
                                                    className="object-contain shrink-0"
                                                />
                                            ) : null;
                                        })()}
                                        <h1 className="text-[20px] md:text-xl font-black text-white text-left">
                                            {userData!.username}
                                        </h1>
                                    </div>

                                    <div className="flex flex-col items-start gap-1.5 md:gap-3">
                                        {/* Styled Role Badge */}
                                        <div className={`inline-block px-1.5 py-[1.5px] rounded-[3px] text-[10px] md:text-[8px] font-bold uppercase tracking-wider leading-none border ${
                                            userData!.role?.toLowerCase() === 'admin'
                                                ? 'text-[#FFB941] bg-[#FFB941]/10 border-[#FFB941]/30'
                                                : userData!.role?.toLowerCase() === 'moderator'
                                                ? 'text-primary bg-primary/10 border-primary/30'
                                                : 'text-white/50 bg-white/5 border-white/10'
                                        }`}>
                                            {userData!.role?.toLowerCase() === 'user' || !userData!.role ? 'MEMBER' : userData!.role.toUpperCase()}
                                        </div>

                                        <div className="text-[12px] font-bold text-[#717282] tracking-tight text-left">
                                            Joined: {new Date(userData!.createdAt).toISOString().split('T')[0]}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Stats Column */}
                            <div className="shrink-0 w-full md:w-[240px] flex flex-col items-center md:items-start justify-center space-y-4 md:space-y-5 pt-4 md:pt-0">
                                {/* Power Display */}
                                <div className="flex items-center justify-center md:justify-start gap-3">
                                    <span className="text-sm md:text-base font-bold uppercase tracking-tight text-white/90">Power:</span>
                                    <div 
                                        className="flex items-center gap-2"
                                        onMouseEnter={() => setShowExactPower(true)}
                                        onMouseLeave={() => setShowExactPower(false)}
                                    >
                                        <div 
                                            className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-black text-primary cursor-pointer hover:bg-white/20 transition-all select-none"
                                            onClick={() => setShowExactPower(!showExactPower)}
                                            title="Exact XP"
                                        >
                                            Z
                                        </div>
                                        <span 
                                            className="text-xl font-black text-white tracking-tighter cursor-pointer select-none"
                                            onClick={() => setShowExactPower(!showExactPower)}
                                        >
                                            {showExactPower 
                                                ? userData.power.toLocaleString() 
                                                : (userData.power >= 1000 ? `${(userData.power / 1000).toFixed(0)}K` : userData.power)
                                            }
                                        </span>
                                    </div>
                                </div>

                                {/* Sub-Stats / Earning link */}
                                <div className="space-y-3 flex flex-col items-center md:items-start">
                                    <div className="flex items-center justify-center md:justify-start gap-3">
                                        <div className="h-[5px] w-[120px] bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progressToNext}%` }}
                                                className="h-full bg-white opacity-90 rounded-full"
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
            <div className="max-w-[1280px] mx-auto w-full px-0 md:px-6 pt-0 pb-6 md:py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">

                {/* Left Side: Rank System & Watchlist */}
                <div className="lg:col-span-8 flex flex-col gap-8 md:gap-0 md:space-y-8">

                    {/* Horizontal Rank Progression (Precisely 720x148 for content area) */}
                    <div className="bg-[#101010] rounded-[10px] relative overflow-hidden flex flex-col items-center">
                        <div className="role-line w-full overflow-x-auto no-scrollbar">
                            <div className="role-line-wrap flex w-[720px] h-[138px] mx-auto relative z-20">
                                {ranks.map((rank, idx) => {
                                    const isReached = idx <= currentRankIndex;
                                    const isCurrent = idx === currentRankIndex;

                                    return (
                                        <div key={rank.name} className="rlw-point w-[144px] h-[148px] flex flex-col items-center justify-center relative group">
                                            {/* Rank Name */}
                                            <span className={`text-[13px] font-black mb-1.5 transition-colors duration-500 ${isReached ? 'text-white' : 'text-white/20'}`}>
                                                {rank.name}
                                            </span>

                                            {/* Requirement with Z Icon */}
                                            <div className="flex items-center gap-1.5 mb-4">
                                                {idx > 0 && (
                                                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-black ${isReached ? 'bg-[#717282] text-white' : 'bg-white/5 text-white/5'}`}>
                                                        Z
                                                    </div>
                                                )}
                                                <span className={`text-[10px] font-bold tracking-tight transition-colors duration-500 ${isReached ? 'text-[#717282]' : 'text-white/10'}`}>
                                                    {rank.requirement}
                                                </span>
                                            </div>

                                            {/* Icon Section */}
                                            <div className="h-10 flex items-center justify-center">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-700 relative z-30 ${isCurrent ? 'bg-yellow-400' :
                                                    isReached ? 'bg-gradient-to-b from-[#4a4b5a] to-[#2a2b30]' :
                                                        'bg-[#1a1b20]'
                                                    }`}>
                                                    <img
                                                        src={rank.icon}
                                                        width={36}
                                                        height={36}
                                                        alt="rank icon"
                                                        className={`object-contain transition-all duration-500 ${!isReached ? 'opacity-10 grayscale' : isCurrent ? 'opacity-100' : 'opacity-70'}`}
                                                    />
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
                                        animate={{ width: `${overallProgress}%` }}
                                        className="h-full bg-yellow-400"
                                    />

                                    <motion.div
                                        initial={{ left: 0 }}
                                        animate={{ left: `${overallProgress}%` }}
                                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-50"
                                    >
                                        <div className="w-11 h-11 rounded-full overflow-hidden">
                                            <div className="w-full h-full rounded-full overflow-hidden">
                                                        <img
                                                            src={userData!.avatar || 'https://via.placeholder.com/150'}
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
                    {userData.isWatchlistPublic !== false ? (
                        <div className="space-y-8 px-4 md:px-0">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black tracking-tight flex items-center gap-3 text-white/90">
                                    <Grid className="text-primary" />
                                    Watch List
                                </h2>
                                <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black text-white/20 uppercase tracking-widest">
                                    {userData.watchlist.length} Title{userData.watchlist.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            {(enrichedWatchlist.length > 0 ? enrichedWatchlist : userData!.watchlist).length > 0 ? (
                                <div className="space-y-10">
                                    {/* Compact Grid: 2 columns on mobile, exactly 5 columns on desktop (2x5 layout) */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-2 gap-y-4 md:gap-x-3 md:gap-y-7">
                                        {(enrichedWatchlist.length > 0 ? enrichedWatchlist : userData!.watchlist).slice(0, watchlistLimit).map((item) => (
                                            <AnimeCard
                                                key={item.animeId}
                                                anime={{
                                                    ...item,
                                                    id: item.animeId,
                                                    title: item.animeTitle,
                                                    poster: item.animeImage,
                                                    sub: item.subEpisodes,
                                                    dub: item.dubEpisodes,
                                                    score: item.score || item.MAL_score,
                                                    totalEpisodes: item.totalEpisodes || item.subEpisodes || item.episodeNumber
                                                }}
                                                variant="portrait"
                                                isSharp={true}
                                                showEpisode={!!item.episodeNumber}
                                                showScore={false}
                                            />
                                        ))}
                                    </div>

                                    {userData!.watchlist.length > watchlistLimit && (
                                        <button
                                            onClick={() => setWatchlistLimit(prev => prev + 10)}
                                            className="w-full py-5 bg-[#101010] rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-primary hover:bg-[#181818] transition-all flex items-center justify-center gap-3 group"
                                        >
                                            View All List Items
                                            <ChevronRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-[#101010] rounded-[2rem] py-20 flex flex-col items-center justify-center opacity-25">
                                    <Clock size={48} className="mb-4" />
                                    <span className="font-bold uppercase tracking-widest text-sm">List is currently empty</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-8 px-4 md:px-0">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black tracking-tight flex items-center gap-3 text-white/90">
                                    <Grid className="text-primary" />
                                    Watch List
                                </h2>
                            </div>
                            <div className="bg-[#101010] rounded-[2rem] py-20 flex flex-col items-center justify-center opacity-25">
                                <EyeOff size={48} className="mb-4" />
                                <span className="font-bold uppercase tracking-widest text-sm">Watchlist is private</span>
                            </div>
                        </div>
                    )}
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
                                activities.map((activity: Activity) => {
                                    const activityLink = activity.animeId 
                                        ? (activity.episodeId 
                                            ? `/watch/${activity.animeId}/${activity.episodeId}${activity.commentId ? `#comment-${activity.commentId}` : ''}`
                                            : `/watch/${activity.animeId}`)
                                        : null;

                                    const ActivityContent = (
                                        <div className="flex gap-3 group cursor-pointer">
                                            {/* Anime poster thumbnail (like HiAnime) */}
                                            <div className="shrink-0 w-[52px] h-[68px] rounded-[4px] overflow-hidden bg-white/5">
                                                {activity.animeImage ? (
                                                    <img
                                                        src={activity.animeImage}
                                                        alt={activity.animeTitle || ''}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
                                                    {activity.activityType === 'like' ? <ThumbsUp size={10} /> : <MessageSquare size={10} />}
                                                    <span>{timeAgo(activity.createdAt)}</span>
                                                </div>
                                                <p className="text-[13px] text-white/80 leading-snug group-hover:text-white transition-colors line-clamp-2">
                                                    <span className="font-bold text-white mr-1.5">{userData?.username}</span>
                                                    <span className="text-white/50">
                                                        {activity.activityType === 'reply' && activity.parentCommentAuthor ? (
                                                            <>
                                                                replied to <span className="text-white font-bold">{activity.parentCommentAuthor}'s</span> comment
                                                            </>
                                                        ) : (
                                                            activity.activityType === 'comment' ? 'commented' : activity.activityType === 'reply' ? 'replied' : 'liked'
                                                        )}
                                                    </span>
                                                    {activity.animeTitle && (
                                                        <> on Anime <span className="text-primary font-semibold">{activity.animeTitle}</span></>
                                                    )}
                                                </p>
                                                {activity.content && (
                                                    <p className="text-[12px] text-white/40 italic mt-1.5 line-clamp-1 border-l border-white/10 pl-2 group-hover:text-white/60 transition-colors">
                                                        "{activity.content}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );

                                    return activityLink ? (
                                        <Link key={activity._id} href={activityLink}>
                                            {ActivityContent}
                                        </Link>
                                    ) : (
                                        <div key={activity._id}>
                                            {ActivityContent}
                                        </div>
                                    );
                                })
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
