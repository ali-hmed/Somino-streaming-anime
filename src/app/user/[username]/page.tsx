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
    Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import AnimeCard from '@/components/AnimeCard';
import { timeAgo } from '@/utils/dateUtils';
import { getRankIconByXP } from '@/utils/rankUtils';
import { useAuthStore } from '@/store/authStore';

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
    const { user: currentUser } = useAuthStore();
    const isOwnProfile = React.useMemo(() => {
        if (!currentUser || !userData) return false;
        const curId = currentUser._id?.toString();
        const uId = userData._id?.toString();
        if (curId && uId && curId === uId) return true;
        return currentUser.username?.toLowerCase() === userData.username?.toLowerCase();
    }, [currentUser, userData]);

    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api-somino.up.railway.app') + '/api/v1';
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
                
                {/* Banner Skeleton */}
                <div className="w-full h-[230px] md:h-[350px] bg-sidebar animate-pulse" />

                {/* Profile Header Skeleton */}
                <div className="max-w-[1280px] mx-auto px-4 md:px-6 relative">
                    {/* Avatar Skeleton */}
                    <div className="absolute -top-[50px] md:-top-[75px] left-4 md:left-6">
                        <div className="w-[100px] h-[100px] md:w-[150px] md:h-[150px] rounded-full border-[4px] border-background bg-sidebar animate-pulse" />
                    </div>

                    {/* Action Button Skeleton */}
                    <div className="flex justify-end pt-3 pb-2 md:py-4 h-[70px] md:h-[80px]">
                        <div className="w-32 h-10 rounded-full bg-sidebar animate-pulse" />
                    </div>

                    {/* Info Skeleton */}
                    <div className="mt-2 md:mt-4 space-y-4 pb-6 border-b border-white/5">
                        <div className="space-y-2">
                            <div className="h-7 w-48 bg-sidebar rounded-md animate-pulse" />
                            <div className="h-4 w-32 bg-sidebar rounded-md animate-pulse" />
                        </div>
                        <div className="flex gap-4">
                            <div className="h-4 w-40 bg-sidebar rounded-md animate-pulse" />
                            <div className="h-4 w-40 bg-sidebar rounded-md animate-pulse" />
                        </div>
                        <div className="flex gap-6">
                            <div className="h-5 w-24 bg-sidebar rounded-md animate-pulse" />
                            <div className="h-5 w-24 bg-sidebar rounded-md animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Content Sections Skeleton */}
                <div className="max-w-[1290px] mx-auto w-full px-0 md:px-6 pt-6 pb-6 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                    {/* Left Side Skeleton */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="h-40 bg-sidebar rounded-xl animate-pulse" />
                        <div className="space-y-4">
                            <div className="h-6 w-32 bg-sidebar rounded-md animate-pulse" />
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {[...Array(10)].map((_, i) => (
                                    <div key={i} className="aspect-[3/4] bg-sidebar rounded-xl animate-pulse" />
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Right Side Skeleton */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="h-8 w-40 bg-sidebar rounded-md animate-pulse" />
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-20 bg-sidebar rounded-lg animate-pulse" />
                            ))}
                        </div>
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

            {/* 1. Profile Hero Section - Twitter Redesign */}
            <div className="relative w-full bg-background">
                {/* Banner Image */}
                <div className="relative w-full h-[220px] md:h-[350px] bg-sidebar overflow-hidden">
                    <img 
                        src={userData.banner || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop'} 
                        className="w-full h-full object-cover" 
                        alt="Profile Banner"
                        referrerPolicy="no-referrer"
                    />
                    {/* Shadow overlay for top navbar visibility if needed */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent h-16" />
                </div>

                {/* Profile Header Info */}
                <div className="max-w-[1280px] mx-auto px-4 md:px-6 relative">
                    {/* Avatar - overlapping banner */}
                    <div className="absolute -top-[50px] md:-top-[75px] left-4 md:left-6">
                        <div className="w-[100px] h-[100px] md:w-[150px] md:h-[150px] rounded-full border-[4px] border-background bg-sidebar overflow-hidden shadow-xl">
                            {userData.avatar ? (
                                <img src={userData.avatar} className="w-full h-full object-cover" alt={userData.username} referrerPolicy="no-referrer" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                    <span className="text-4xl font-black text-white/10 uppercase">{userData.username[0]}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons - moved back to right as requested */}
                    <div className="flex justify-end pt-3 pb-2 md:py-4 h-[70px] md:h-[80px]">
                        {isOwnProfile ? (
                            <Link 
                                href="/profile" 
                                className="px-5 py-2 h-fit rounded-full border border-white/20 font-bold text-[13px] md:text-[14px] hover:bg-white/5 transition-all"
                            >
                                Edit profile
                            </Link>
                        ) : (
                            <button 
                                className="px-5 py-2 h-fit rounded-full bg-white text-black font-bold text-[13px] md:text-[14px] hover:opacity-90 transition-all"
                            >
                                Follow
                            </button>
                        )}
                    </div>

                    {/* Basic Info */}
                    <div className="mt-2 md:mt-4 space-y-3 pb-6 border-b border-white/5">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <h1 className={`text-xl md:text-2xl font-black tracking-tight ${
                                    userData!.role?.toLowerCase() === 'admin' ? 'text-[#EF4444]' : 
                                    userData!.role?.toLowerCase() === 'owner' ? 'text-[#FFB941]' : 'text-white'
                                }`}>
                                    {userData.username}
                                </h1>
                                {(() => {
                                    const rankIcon = getRankIconByXP(totalXP);
                                    return rankIcon ? (
                                        <img src={rankIcon} width={22} height={22} alt="rank icon" className="object-contain" />
                                    ) : null;
                                })()}
                            </div>
                            <p className="text-white/40 text-[14px] md:text-[15px]">@{userData.username.toLowerCase()}</p>
                        </div>

                        {/* Joined & Location & Role */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-white/50 text-[13px] md:text-[14px]">
                            <div className="flex items-center gap-1">
                                <Calendar size={16} />
                                <span>Joined {new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                            </div>
                            
                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] text-[10px] font-bold uppercase tracking-wider border ${
                                userData!.role?.toLowerCase() === 'owner'
                                    ? 'text-[#FFB941] bg-[#FFB941]/10 border-[#FFB941]/30'
                                    : userData!.role?.toLowerCase() === 'admin'
                                    ? 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30'
                                    : userData!.role?.toLowerCase() === 'moderator'
                                    ? 'text-primary bg-primary/10 border-primary/30'
                                    : 'text-white/50 bg-white/5 border-white/10'
                            }`}>
                                {userData!.role?.toLowerCase() === 'user' || !userData!.role ? 'MEMBER' : userData!.role.toUpperCase()}
                            </div>
                        </div>

                        {/* Somino Stats (Level/Power) */}
                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-[14px]">
                            <div className="flex gap-1.5 items-center">
                                <span className="text-white/50">Power:</span>
                                <span className="font-bold text-primary">{userData.power.toLocaleString()}</span>
                            </div>
                            <div className="flex gap-1.5 items-center border-l border-white/10 pl-5">
                                <span className="text-white/50">Level:</span>
                                <span className="font-bold text-white">{userData.level || 1}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Content Sections */}
            <div className="max-w-[1280px] mx-auto w-full px-0 md:px-6 pt-6 pb-6 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">

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
