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
    Clock
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

    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030') + '/api/v1';

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/user/${username}`);
                const data = await res.json();

                if (data.success) {
                    setUserData(data.data.user);
                    setActivities(data.data.activities);
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
            <div className="min-h-screen bg-[#161618] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
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
        { name: 'New', icon: '🐟', minLevel: 1 },
        { name: 'Angelfish', icon: '🐠', minLevel: 5 },
        { name: 'Crab', icon: '🦀', minLevel: 15 },
        { name: 'Starfish', icon: '⭐', minLevel: 30 },
        { name: 'Dolphin', icon: '🐬', minLevel: 50 },
    ];

    const currentRankIndex = ranks.findIndex(r => r.name === userData.rank) || 0;
    const progressToNext = (userData.level % 10) * 10; // Mock progress logic

    return (
        <div className="min-h-screen bg-[#161618] text-white flex flex-col">
            <Navbar />

            {/* 1. Profile Hero Section */}
            <div className="relative w-full overflow-hidden h-[45vh] md:h-[55vh]">
                {/* Background Hero Image with Layers */}
                <div className="absolute inset-0">
                    {/* Blurred ambient bg */}
                    <div
                        className="absolute inset-0 scale-110"
                        style={{
                            backgroundImage: `url(${userData.banner || userData.avatar || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop'})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'blur(50px) brightness(0.15)',
                        }}
                    />

                    {/* Main Banner Image */}
                    <div
                        className="absolute inset-0 opacity-40 md:opacity-60"
                        style={{
                            backgroundImage: `url(${userData.banner || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop'})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    />

                    {/* Gradients like HeroCarousel & Globals.css */}
                    <div className="absolute inset-0 hero-bottom-gradient" />
                    <div className="absolute inset-0 hero-gradient" />
                    <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#161618] to-transparent" />
                </div>

                {/* Profile Info Content Overlay */}
                <div className="relative z-10 h-full flex items-end pb-8 md:pb-12">
                    <div className="max-w-[1550px] mx-auto w-full px-4 md:px-12 flex flex-col items-center md:items-start md:flex-row gap-6 md:gap-8">
                        {/* Avatar */}
                        <div className="relative group shrink-0">
                            <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-[#161618] bg-[#1a1b20] overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-105">
                                {userData.avatar ? (
                                    <img src={userData.avatar} className="w-full h-full object-cover" alt={userData.username} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-4xl font-black text-white/5 uppercase">{userData.username[0]}</span>
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-2 right-2 w-8 h-8 md:w-10 md:h-10 bg-primary rounded-full border-4 border-[#161618] flex items-center justify-center shadow-lg">
                                <Zap size={16} className="text-[#161618] fill-current" />
                            </div>
                        </div>

                        {/* Stats & Name */}
                        <div className="flex-1 text-center md:text-left md:pb-4">
                            <div className="flex flex-col md:flex-row items-center gap-3 mb-3">
                                <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white drop-shadow-2xl">
                                    {userData.username}
                                </h1>
                                {userData.role !== 'user' && (
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-lg ${userData.role === 'admin' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-primary/10 border-primary/20 text-primary'
                                        }`}>
                                        {userData.role === 'admin' ? <ShieldCheck size={12} /> : <CheckCircle2 size={12} />}
                                        {userData.role}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 text-white/60 text-[12px] font-bold tracking-wide">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-primary" />
                                    <span>Joined {new Date(userData.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Award size={14} className="text-primary" />
                                    <span>Level {userData.level}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <TrendingUp size={14} className="text-primary" />
                                    <span>{userData.power} Power</span>
                                </div>
                            </div>

                            {/* Level Progress Bar (Small) */}
                            <div className="mt-5 max-w-xs mx-auto md:mx-0">
                                <div className="flex items-center justify-between mb-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                                    <span>Rank Progress</span>
                                    <span className="text-primary">{progressToNext}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressToNext}%` }}
                                        className="h-full bg-primary shadow-[0_0_10px_rgba(83,204,184,0.5)]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Content Sections */}
            <div className="max-w-[1550px] mx-auto w-full px-4 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Left Side: Rank & Watchlist */}
                <div className="lg:col-span-8 space-y-12">

                    {/* Rank System Section */}
                    <div className="bg-[#1e1e22] border border-white/[0.02] rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                            <Award size={120} />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                            <Award className="text-primary" />
                            Rank Progression
                        </h2>

                        <div className="relative py-4">
                            {/* Horizontal Line */}
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2" />
                            <div className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-1000"
                                style={{ width: `${(currentRankIndex / (ranks.length - 1)) * 100}%` }}
                            />

                            <div className="relative flex justify-between items-center">
                                {ranks.map((rank, idx) => {
                                    const isActive = idx <= currentRankIndex;
                                    const isCurrent = idx === currentRankIndex;

                                    return (
                                        <div key={rank.name} className="flex flex-col items-center gap-3">
                                            <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl md:text-2xl z-10 transition-all duration-500 ${isCurrent ? 'bg-primary scale-110 shadow-[0_0_20px_rgba(83,204,184,0.4)] text-[#161618]' :
                                                isActive ? 'bg-[#1a1b20] border-2 border-primary/50 text-white' :
                                                    'bg-[#1a1b20] border-2 border-white/5 text-white/10'
                                                }`}>
                                                {rank.icon}
                                            </div>
                                            <span className={`text-[9px] md:text-[11px] font-black uppercase tracking-widest ${isCurrent ? 'text-primary' :
                                                isActive ? 'text-white/60' :
                                                    'text-white/10'
                                                }`}>
                                                {rank.name}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Watch List Grid */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                <Grid className="text-primary" />
                                Watch List
                            </h2>
                            <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                                {userData.watchlist.length} Total
                            </div>
                        </div>

                        {userData.watchlist.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                                    {userData.watchlist.slice(0, watchlistLimit).map((item) => (
                                        <AnimeCard
                                            key={item.animeId}
                                            anime={{
                                                id: item.animeId,
                                                title: item.animeTitle,
                                                poster: item.animeImage,
                                                type: item.type || 'TV',
                                                duration: item.duration,
                                                status: item.status
                                            }}
                                            variant="portrait"
                                            isSharp={true}
                                        />
                                    ))}
                                </div>

                                {userData.watchlist.length > watchlistLimit && (
                                    <button
                                        onClick={() => setWatchlistLimit(prev => prev + 10)}
                                        className="w-full py-4 bg-[#1e1e22] border border-white/[0.05] rounded-xl text-[11px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white hover:bg-white/[0.02] transition-all flex items-center justify-center gap-2 group"
                                    >
                                        View More
                                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="bg-[#1e1e22]/50 border-2 border-dashed border-white/[0.02] rounded-2xl py-16 flex flex-col items-center justify-center opacity-20">
                                <Clock size={48} className="mb-4" />
                                <span className="font-bold uppercase tracking-widest text-sm">Watchlist is empty</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Activity Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="sticky top-28 space-y-8">
                        <div className="bg-[#1e1e22] border border-white/[0.02] rounded-2xl overflow-hidden shadow-2xl">
                            <div className="px-6 py-5 border-b border-white/[0.02] flex items-center gap-3">
                                <History size={18} className="text-primary" />
                                <h3 className="text-[14px] font-black uppercase tracking-widest">Latest Activities</h3>
                            </div>

                            <div className="divide-y divide-white/[0.02]">
                                {activities.length > 0 ? (
                                    activities.map((activity) => (
                                        <div key={activity._id} className="p-5 flex gap-4 group hover:bg-white/[0.01] transition-colors">
                                            <div className="shrink-0 w-8 h-8 rounded-full bg-[#1a1b20] border border-white/5 flex items-center justify-center">
                                                {activity.activityType === 'comment' && <MessageSquare size={14} className="text-blue-400" />}
                                                {activity.activityType === 'reply' && <Reply size={14} className="text-green-400" />}
                                                {activity.activityType === 'like' && <ThumbsUp size={14} className="text-pink-400" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[12px] text-white/70 leading-relaxed mb-1.5 group-hover:text-white transition-colors">
                                                    {activity.text}
                                                </p>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-white/20">
                                                    <span>{timeAgo(activity.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 text-center opacity-10">
                                        <History size={32} className="mx-auto mb-3" />
                                        <p className="text-[10px] uppercase font-black tracking-widest">No activity</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PublicProfilePage;
