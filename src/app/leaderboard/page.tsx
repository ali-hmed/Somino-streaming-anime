"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Search,
    Trophy,
    Medal,
    Crown,
    Loader2,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    Zap,
    Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { getRankIconByXP } from '@/utils/rankUtils';
import { useAuthStore } from '@/store/authStore';
import UserAvatar from '@/components/UserAvatar';

interface LeaderboardUser {
    _id: string;
    username: string;
    displayName?: string;
    avatar?: string;
    frame?: string;
    power: number;
    level: number;
    rank: number;
    role?: string;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api-somino.up.railway.app') + '/api/v1';

// Helper for role-based frames
const getRoleFrame = (role?: string) => {
    switch(role?.toLowerCase()) {
        case 'owner': return '/frames/owner_frame.png';
        case 'admin': return '/frames/admin_frame.png';
        default: return null;
    }
};

const LeaderboardPage = () => {
    const { user: currentUser } = useAuthStore();
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsersCount, setTotalUsersCount] = useState(0);
    const [userRank, setUserRank] = useState<{ rank: number; totalUsers: number; nextTarget: any } | null>(null);

    const fetchLeaderboard = useCallback(async (p: number, search: string) => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/leaderboard?page=${p}&limit=50&search=${search}`);
            const data = await res.json();
            if (data.success) {
                setUsers(data.data.leaderboard);
                setTotalPages(Math.ceil(data.data.totalUsers / 50));
                setTotalUsersCount(data.data.totalUsers);
            }
        } catch (error) {
            console.error('Fetch Leaderboard Error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUserRank = useCallback(async () => {
        if (!currentUser?.username) return;
        try {
            const res = await fetch(`${API_URL}/user/${currentUser.username}/rank`);
            const data = await res.json();
            if (data.success) {
                setUserRank(data.data);
            }
        } catch (error) {
            console.error('Fetch User Rank Error:', error);
        }
    }, [currentUser?.username]);

    useEffect(() => {
        fetchLeaderboard(page, searchQuery);
    }, [page, searchQuery, fetchLeaderboard]);

    useEffect(() => {
        fetchUserRank();
    }, [fetchUserRank]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
    };

    const top3 = users.slice(0, 3);
    const others = users.slice(3);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <Navbar className="bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/[0.03]" />

            <div className="max-w-[1200px] mx-auto px-4 pt-24 pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-primary mb-1">
                            <Trophy size={15} className="text-yellow-500" />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Hall of Fame</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight">Community <span className="text-white/40">Leaderboard</span></h1>
                    </div>

                    {/* Search Bar Hidden as per user request */}
                    {/* <div className="flex flex-col md:flex-row gap-4 items-center">
                        <form onSubmit={handleSearch} className="relative group w-full md:w-60">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={12} />
                            <input
                                type="text"
                                placeholder="Find a user..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/[0.05] rounded-2xl py-1 pl-10 pr-4 outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all text-sm font-medium"
                            />
                        </form>

                        {currentUser && userRank && (
                            <button
                                onClick={async () => {
                                    const targetPage = Math.ceil(userRank.rank / 50);
                                    if (targetPage !== page) {
                                        setPage(targetPage);
                                    }
                                    // Give it time to load/render
                                    setTimeout(() => {
                                        const element = document.getElementById(`user-rank-${userRank.rank}`);
                                        if (element) {
                                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            element.classList.add('bg-primary/10');
                                            setTimeout(() => element.classList.remove('bg-primary/10'), 2000);
                                        }
                                    }, 1000);
                                }}
                                className="px-4 py-1.5 rounded-2xl bg-primary/10 text-primary font-black text-xs uppercase tracking-widest hover:bg-primary/20 transition-all active:scale-95 border border-primary/20"
                            >
                                Jump to My Rank
                            </button>
                        )}
                    </div> */}
                </div>

                {/* Top 3 Section */}
                {!loading && page === 1 && !searchQuery && top3.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-8 mb-16 items-end">
                        {/* Rank #2 */}
                        {top3[1] && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="order-1"
                            >
                                <LeaderboardTopCard user={top3[1]} rank={2} color="#C0C0C0" />
                            </motion.div>
                        )}

                        {/* Rank #1 */}
                        {top3[0] && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="order-2"
                            >
                                <LeaderboardTopCard user={top3[0]} rank={1} color="#FFD700" isMain={true} />
                            </motion.div>
                        )}

                        {/* Rank #3 */}
                        {top3[2] && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="order-3"
                            >
                                <LeaderboardTopCard user={top3[2]} rank={3} color="#CD7F32" />
                            </motion.div>
                        )}
                    </div>
                )}

                {/* User's own rank card if logged in */}
                {currentUser && userRank && !searchQuery && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-10 p-4 rounded-xl bg-[#0d0d0d] border border-white/[0.03] flex flex-row items-center justify-between gap-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center font-black text-primary text-base shadow-lg shadow-primary/5 shrink-0">
                                #{userRank.rank}
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-black text-white truncate">Your Ranking</h3>
                                <p className="text-[11px] text-white/40 font-bold truncate">Ranked #{userRank.rank} of {userRank.totalUsers.toLocaleString()}</p>
                            </div>
                        </div>

                        {userRank.nextTarget && (
                            <div className="flex flex-col items-end shrink-0">
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary/40 mb-0.5">TARGET: RANK #{userRank.nextTarget.rank}</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-base font-black text-white">{userRank.nextTarget.pointsNeeded.toLocaleString()}</span>
                                    <span className="text-[9px] font-bold text-white/20 whitespace-nowrap">points to go</span>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Table Header */}
                <div className="grid grid-cols-12 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 border-b border-white/[0.03]">
                    <div className="col-span-1">Rank</div>
                    <div className="col-span-6 md:col-span-7">User</div>
                    <div className="col-span-2 hidden md:block text-center">Level</div>
                    <div className="col-span-3 md:col-span-2 text-right">Points</div>
                </div>

                {/* List Container */}
                <div className="mt-2 space-y-1">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-white/20 gap-4">
                            <Loader2 className="animate-spin text-primary" size={40} />
                            <span className="text-xs font-bold uppercase tracking-widest">Updating Leaderboard</span>
                        </div>
                    ) : (
                        <>
                            {others.length > 0 || (page === 1 && searchQuery && users.length > 0) ? (
                                (page === 1 && !searchQuery ? others : users).map((u) => (
                                    <motion.div
                                        key={u._id}
                                        id={`user-rank-${u.rank}`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="grid grid-cols-12 items-center px-8 py-4 group hover:bg-white/[0.02] transition-all rounded-xl"
                                    >
                                        <div className="col-span-1 font-black text-white/20 group-hover:text-white/60 transition-colors">
                                            #{u.rank}
                                        </div>
                                        <div className="col-span-6 md:col-span-7 flex items-center gap-4">
                                            <Link href={`/user/${u.username}`} className="shrink-0 transition-transform hover:scale-105 active:scale-95">
                                                <UserAvatar user={u} size="md" />
                                            </Link>
                                            <div className="min-w-0">
                                                <Link href={`/user/${u.username}`} className="block font-black text-[14px] hover:text-primary transition-colors truncate">
                                                    {u.displayName || u.username}
                                                </Link>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-wider">@{u.username}</span>
                                                    {getRankIconByXP(u.power) && (
                                                        <img src={getRankIconByXP(u.power) || ''} className="w-3.5 h-3.5 object-contain opacity-50" alt="rank" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-span-2 hidden md:flex items-center justify-center">
                                            <div className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] text-[11px] font-black text-white/60">
                                                Lv {u.level}
                                            </div>
                                        </div>
                                        <div className="col-span-3 md:col-span-2 text-right">
                                            <div className="font-black text-[14px] text-primary">{u.power.toLocaleString()}</div>
                                            <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Total Points</div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="py-20 text-center text-white/20 space-y-4">
                                    <Users size={48} className="mx-auto" />
                                    <p className="font-bold uppercase tracking-widest">No users found</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-4">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="w-11 h-11 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="text-[11px] font-black tracking-widest text-white/40">
                            PAGE <span className="text-white">{page}</span> OF {totalPages}
                        </div>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="w-11 h-11 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper Component for Top 3
const LeaderboardTopCard = ({ user, rank, color, isMain = false }: { user: LeaderboardUser; rank: number; color: string; isMain?: boolean }) => {
    // Determine podium base heights - Slightly smaller
    const podiumHeight = 
        rank === 1 ? 'h-32 md:h-44' :
        rank === 2 ? 'h-24 md:h-32' :
        'h-20 md:h-28';

    return (
        <div className={`relative flex flex-col items-center group transition-all duration-500 ${rank === 1 ? 'z-10 scale-105 md:scale-115 pt-12' : 'z-0 pt-8'}`}>
            
            {/* User Avatar + Floating Effect for Rank 1 */}
            <motion.div 
                animate={rank === 1 ? { y: [0, -10, 0] } : {}}
                transition={rank === 1 ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : {}}
                className="relative mb-5 md:mb-8"
            >
                {/* Crown for Rank 1 */}
                {rank === 1 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute left-1/2 -translate-x-1/2 -top-10 md:-top-14 z-20 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]"
                    >
                        <Crown className="w-9 h-9 md:w-12 md:h-12 text-yellow-500 fill-yellow-500/10" />
                        
                        {/* Shimmer effect for crown */}
                        <motion.div
                            animate={{ opacity: [0, 1, 0], x: [-10, 20] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
                        />
                    </motion.div>
                )}

                <Link href={`/user/${user.username}`} className="relative block">
                    <UserAvatar 
                        user={user} 
                        size={rank === 1 ? 'xl' : 'lg'} 
                        className={`transition-transform duration-500 group-hover:scale-105 ${rank !== 1 ? '!w-16 !h-16 md:!w-28 md:!h-28' : '!w-24 !h-24 md:!w-40 md:!h-40'}`} 
                    />
                    
                    {/* Visual Glow */}
                    <div className="absolute inset-0 rounded-full blur-2xl md:blur-[40px] opacity-20 md:opacity-40 -z-10 transition-opacity duration-500 group-hover:opacity-70" style={{ backgroundColor: color }} />
                </Link>

                {/* Rank Badge overlay on Avatar */}
                <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="absolute -bottom-2 -right-2 w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center font-black text-[10px] md:text-lg border-2 border-[#0a0a0a] shadow-2xl z-20"
                    style={{ backgroundColor: color, color: '#000' }}
                >
                    {rank}
                </motion.div>
            </motion.div>

            {/* User Info */}
            <div className="text-center space-y-0.5 mb-4 z-20 px-2">
                <Link href={`/user/${user.username}`} className="block text-xs md:text-lg font-black hover:text-primary transition-colors truncate max-w-[100px] md:max-w-[180px] tracking-tight text-white leading-tight">
                    {user.displayName || user.username}
                </Link>
                <div className="flex items-center justify-center gap-1.5 opacity-50 group-hover:opacity-100 transition-all duration-500">
                    <p className="text-[8px] md:text-[10px] font-black text-white/60 uppercase tracking-widest leading-none">@{user.username}</p>
                    {getRankIconByXP(user.power) && (
                        <img src={getRankIconByXP(user.power) || ''} className="h-2 md:h-3 object-contain" alt="rank" />
                    )}
                </div>
            </div>

            {/* Podium Base */}
            <div className={`relative w-full ${podiumHeight} flex flex-col items-center justify-start pt-6 md:pt-10 bg-gradient-to-b from-white/[0.08] to-transparent border-t border-white/[0.1] rounded-t-[2rem] md:rounded-t-[3rem] backdrop-blur-xl overflow-hidden group-hover:from-white/[0.12] transition-all duration-700`}>
                {/* Accent line */}
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                
                {/* Stats */}
                <div className="text-center px-2 relative z-10">
                    <div className="text-[10px] md:text-xl font-black md:tracking-wider leading-none mb-1" style={{ color: color }}>
                        {user.power.toLocaleString()}
                    </div>
                    <div className="text-[7px] md:text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Points</div>
                </div>

                {/* Level Tag */}
                <div className="mt-3 px-2 md:px-4 py-0.5 md:py-1 rounded-full bg-black/50 border border-white/[0.08] shadow-inner">
                    <span className="text-[8px] md:text-[11px] font-black text-white/40 uppercase tracking-widest mr-1">LV</span>
                    <span className="text-[9px] md:text-[12px] font-black text-white">{user.level}</span>
                </div>

                {/* Rank Number on Front of Podium - Clearly Visible */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/[0.05] font-black text-8xl md:text-[10rem] tracking-tighter select-none pointer-events-none group-hover:text-white/[0.08] transition-all duration-700">
                    {rank}
                </div>
            </div>
        </div>
    );
};

export default LeaderboardPage;
