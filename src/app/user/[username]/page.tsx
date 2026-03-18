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
    Trophy,
    ArrowRight,
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
    const [userRank, setUserRank] = useState<{ rank: number; totalUsers: number; nextTarget: any } | null>(null);

    const isOwnProfile = React.useMemo(() => {
        if (!currentUser || !userData) return false;
        const curId = currentUser._id?.toString();
        const uId = userData._id?.toString();
        if (curId && uId && curId === uId) return true;
        return currentUser.username?.toLowerCase() === userData.username?.toLowerCase();
    }, [currentUser, userData]);

    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api-somino.up.railway.app') + '/api/v1';

    // Fetch user rank separately
    useEffect(() => {
        const fetchUserRank = async () => {
            if (!username) return;
            try {
                const res = await fetch(`${API_URL}/user/${username}/rank`);
                const data = await res.json();
                if (data.success) {
                    setUserRank(data.data);
                }
            } catch (err) {
                console.error('Error fetching user rank:', err);
            }
        };
        fetchUserRank();
    }, [username, API_URL]);

    // Fetch profile data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/user/${username}`);
                const data = await res.json();

                if (data.success) {
                    setUserData(data.data.user);
                    setActivities(data.data.activities);

                    // Enrich watchlist with anime details
                    const watchlist = data.data.user.watchlist || [];
                    const watchlistMap: Record<string, string> = {};
                    watchlist.forEach((w: any) => { if (w.animeId) watchlistMap[w.animeId] = w.animeImage; });

                    const enriched = await Promise.all(
                        watchlist.map(async (item: any) => {
                            try {
                                const animeRes = await fetch(`${API_URL}/anime/${item.animeId}`);
                                if (!animeRes.ok) return { ...item, subEpisodes: item.episodeNumber || 0, totalEpisodes: item.episodeNumber || 0 };
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
                                return { ...item, subEpisodes: item.episodeNumber || 0, totalEpisodes: item.episodeNumber || 0 };
                            }
                        })
                    );
                    setEnrichedWatchlist(enriched);

                    // Enrich activities
                    const enrichedActivities = (data.data.activities || []).map((act: any) => ({
                        ...act,
                        animeImage: act.animeImage || (act.animeId ? (watchlistMap[act.animeId] || null) : null),
                    }));
                    setActivities(enrichedActivities);
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
                <div className="w-full h-[230px] md:h-[350px] bg-sidebar animate-pulse" />
                <div className="max-w-[1280px] mx-auto px-4 md:px-6 relative">
                    <div className="absolute -top-[50px] md:-top-[75px] left-4 md:left-6">
                        <div className="w-[100px] h-[100px] md:w-[150px] md:h-[150px] rounded-full border-[4px] border-background bg-sidebar animate-pulse" />
                    </div>
                    <div className="flex justify-end pt-3 pb-2 md:py-4 h-[70px] md:h-[80px]">
                        <div className="w-32 h-10 rounded-full bg-sidebar animate-pulse" />
                    </div>
                    <div className="mt-2 md:mt-4 space-y-4 pb-6 border-b border-white/5">
                        <div className="h-7 w-48 bg-sidebar rounded-md animate-pulse" />
                        <div className="h-4 w-32 bg-sidebar rounded-md animate-pulse" />
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
                    <button onClick={() => window.location.href = '/'} className="px-6 py-2 bg-primary text-black rounded-full font-bold uppercase tracking-widest text-xs">Back to Home</button>
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
    
    let currentRankIndex = -1;
    for (let i = ranks.length - 1; i >= 0; i--) {
        if (totalXP >= ranks[i].minXP) {
            currentRankIndex = i;
            break;
        }
    }

    let progressToNext = 0;
    if (currentRankIndex === -1) {
        progressToNext = Math.min(100, (totalXP / 10000) * 100);
    } else if (currentRankIndex < ranks.length - 1) {
        const current = ranks[currentRankIndex];
        const next = ranks[currentRankIndex + 1];
        const range = next.minXP - current.minXP;
        const earned = totalXP - current.minXP;
        progressToNext = Math.min(100, Math.max(0, (earned / range) * 100));
    } else {
        progressToNext = 100;
    }

    const segmentSize = 25;
    let overallProgress = currentRankIndex === -1 ? 0 : (currentRankIndex * segmentSize) + ((progressToNext / 100) * segmentSize);
    overallProgress = Math.min(100, Math.max(0, overallProgress));

    return (
        <div className="min-h-screen bg-background text-white flex flex-col">
            <Navbar className="bg-background/50 backdrop-blur-md !py-2 md:!py-3" />

            {/* Banner Section */}
            <div className="relative w-full bg-background">
                <div className="relative w-full h-[220px] md:h-[350px] bg-sidebar overflow-hidden">
                    <img src={userData.banner || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop'} className="w-full h-full object-cover" alt="Banner" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent h-16" />
                </div>

                <div className="max-w-[1280px] mx-auto px-4 md:px-6 relative">
                    <div className="absolute -top-[50px] md:-top-[75px] left-4 md:left-6">
                        <div className="w-[100px] h-[100px] md:w-[150px] md:h-[150px] rounded-full border-[4px] border-background bg-sidebar overflow-hidden">
                            {userData.avatar ? (
                                <img src={userData.avatar} className="w-full h-full object-cover" alt={userData.username} referrerPolicy="no-referrer" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                    <span className="text-4xl font-black text-white/10 uppercase">{userData.username[0]}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-3 pb-2 md:py-4 h-[70px] md:h-[80px]">
                        <div className="flex items-center gap-4">
                            {userRank && (
                                <div className="flex flex-col items-end mr-4">
                                    <div className="flex items-center gap-2">
                                        <Trophy size={14} className="text-yellow-500" />
                                        <span className="text-[16px] md:text-[20px] font-black italic tracking-tighter">RANK #{userRank.rank}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">OUT OF {userRank.totalUsers.toLocaleString()}</span>
                                </div>
                            )}
                            {isOwnProfile ? (
                                <Link href="/profile" className="px-5 py-2 rounded-full border border-white/20 font-bold text-[13px] md:text-[14px] hover:bg-white/5 transition-all">Edit profile</Link>
                            ) : (
                                <button className="px-5 py-2 rounded-full bg-white text-black font-bold text-[13px] md:text-[14px] hover:opacity-90 transition-all">Follow</button>
                            )}
                        </div>
                    </div>

                    <div className="mt-2 md:mt-4 space-y-3 pb-6 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <h1 className={`text-xl md:text-2xl font-black tracking-tight ${userData.role?.toLowerCase() === 'admin' ? 'text-red-500' : userData.role?.toLowerCase() === 'owner' ? 'text-yellow-500' : 'text-white'}`}>{userData.username}</h1>
                            {(() => {
                                const rankIcon = getRankIconByXP(totalXP);
                                return rankIcon ? <img src={rankIcon} width={22} height={22} alt="rank" className="object-contain" /> : null;
                            })()}
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-white/40 text-sm">@{userData.username.toLowerCase()}</p>
                            {userRank && (
                                <Link href="/leaderboard" className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded cursor-pointer">Elite #{userRank.rank}</Link>
                            )}
                        </div>

                        {userRank?.nextTarget && userRank.nextTarget.rank && (
                            <Link href="/leaderboard" className="block max-w-[400px]">
                                <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-3 flex items-center justify-between group hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                                            <TrendingUp size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Next Goal: Rank #{userRank.nextTarget.rank}</span>
                                            <span className="text-[13px] font-bold">You are {userRank.nextTarget.pointsNeeded.toLocaleString()} points away</span>
                                        </div>
                                    </div>
                                    <ArrowRight size={16} className="text-white/20 group-hover:text-primary transition-colors" />
                                </div>
                            </Link>
                        )}

                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-white/50 text-sm">
                            <div className="flex items-center gap-1">
                                <Calendar size={16} />
                                <span>Joined {new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                            </div>
                            <div className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-bold uppercase border border-white/10">
                                {userData.role === 'user' || !userData.role ? 'MEMBER' : userData.role.toUpperCase()}
                            </div>
                        </div>

                        <div className="flex gap-5 text-sm">
                            <div className="flex gap-1.5 items-center"><span className="text-white/50">Power:</span><span className="font-bold text-primary">{userData.power.toLocaleString()}</span></div>
                            <div className="flex gap-1.5 items-center pl-5 border-l border-white/10"><span className="text-white/50">Level:</span><span className="font-bold">{userData.level || 1}</span></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1280px] mx-auto w-full px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                <div className="lg:col-span-8 space-y-8">
                    {/* Rank System */}
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
                                                        className={`object-contain transition-all duration-500 ${!isReached ? 'opacity-90' : isCurrent ? 'opacity-100' : 'opacity-70'}`}
                                                    />
                                                </div>
                                            </div>

                                            {/* Vertical Dash Line */}
                                            <div className="absolute top-[108px] h-10 w-[1px] border-r border-dashed border-white/[0.15]" />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Bottom Progress Bar Section */}
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
                                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-50 transition-all duration-500"
                                    >
                                        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                                            {userData.avatar ? (
                                                <img src={userData.avatar} className="w-full h-full object-cover" alt="Progress" />
                                            ) : (
                                                <div className="w-full h-full bg-primary flex items-center justify-center text-xs font-black">{userData.username[0]}</div>
                                            )}
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Watchlist */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black flex items-center gap-3"><Grid className="text-primary" />Watch List</h2>
                            <span className="text-xs text-white/20 font-bold uppercase">{userData.watchlist.length} TITLES</span>
                        </div>
                        {userData.watchlist.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                {(enrichedWatchlist.length > 0 ? enrichedWatchlist : userData.watchlist).slice(0, watchlistLimit).map((item) => (
                                    <AnimeCard
                                        key={item.animeId}
                                        anime={{
                                            ...item,
                                            id: item.animeId,
                                            title: item.animeTitle,
                                            poster: item.animeImage,
                                            totalEpisodes: item.totalEpisodes || item.subEpisodes || item.episodeNumber
                                        }}
                                        variant="portrait"
                                        isSharp={true}
                                        showEpisode={!!item.episodeNumber}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center opacity-20 border-2 border-dashed border-white/5 rounded-2xl"><p>Empty List</p></div>
                        )}
                        {userData.watchlist.length > watchlistLimit && (
                            <button onClick={() => setWatchlistLimit(l => l + 10)} className="w-full py-4 bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">View More</button>
                        )}
                    </div>
                </div>

                {/* Activities Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="flex items-center gap-3"><div className="w-1 h-6 bg-primary rounded-full" /><h3 className="text-lg font-black">Latest Activities</h3></div>
                    <div className="space-y-5">
                        {activities.length > 0 ? activities.map((activity) => (
                            <div key={activity._id} className="flex gap-3 group">
                                <div className="w-12 h-16 rounded overflow-hidden bg-white/5 shrink-0">
                                    {activity.animeImage && <img src={activity.animeImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="anime" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] text-white/30 mb-1">{timeAgo(activity.createdAt)}</div>
                                    <div className="text-sm line-clamp-2"><span className="font-bold">{userData.username}</span> <span className="text-white/50">{activity.activityType} on</span> <span className="text-primary">{activity.animeTitle}</span></div>
                                    {activity.content && <div className="text-xs text-white/40 italic mt-1 line-clamp-1 border-l border-white/10 pl-2">"{activity.content}"</div>}
                                </div>
                            </div>
                        )) : <div className="py-10 text-center opacity-20"><History size={36} className="mx-auto mb-2" /><p className="text-xs">No Activity</p></div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicProfilePage;
