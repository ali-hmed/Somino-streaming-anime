"use client";

import React, { useState, useEffect } from "react";
import { Bell, BellOff, Check, Trash2, Loader2, User, MessageCircle, ThumbsUp, ThumbsDown, PackageOpen, Inbox } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { timeAgo } from "@/utils/dateUtils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationType {
    _id: string;
    userId: string;
    fromUserId: {
        _id: string;
        username: string;
        avatar?: string;
    };
    type: 'reply' | 'like' | 'dislike' | 'episode';
    category: 'anime' | 'community';
    commentId?: string;
    episodeId: string;
    animeId: string;
    animeTitle: string;
    episodeNumber: number;
    createdAt: string;
    isRead: boolean;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'anime' | 'community'>('anime');
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030') + '/api/v1';

    const fetchNotifications = async () => {
        if (!isAuthenticated || !user) return;
        try {
            setIsLoading(true);
            const res = await fetch(`${API_URL}/notifications`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setNotifications(data.data);
            }
        } catch (error) {
            console.error("Fetch notifications error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
        }
    }, [isAuthenticated]);

    const markAsRead = async (id: string, e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        try {
            await fetch(`${API_URL}/notifications/${id}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Mark as read error:", error);
        }
    };

    const markAllRead = async () => {
        try {
            await fetch(`${API_URL}/notifications/read-all`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Mark all as read error:", error);
        }
    };

    const clearAll = () => {
        if (confirm("Are you sure you want to clear all notifications?")) {
            setNotifications([]);
            // In a real app, you'd call a DELETE /notifications/all endpoint
        }
    };

    const getActionText = (type: string) => {
        switch (type) {
            case 'reply': return 'replied to your comment on';
            case 'like': return 'liked your comment on';
            case 'dislike': return 'disliked your comment on';
            default: return 'interacted with your comment on';
        }
    };

    const getActionIcon = (type: string) => {
        switch (type) {
            case 'reply': return <MessageCircle size={14} className="text-primary" />;
            case 'like': return <ThumbsUp size={14} className="text-primary" />;
            case 'dislike': return <ThumbsDown size={14} className="text-white/20" />;
            default: return <Bell size={14} />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    const filteredNotifications = notifications.filter(n => n.category === activeTab);

    return (
        <div className="space-y-10">
            {/* Header with Title and Action Buttons */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <Bell size={28} className="text-white" />
                        <h2 className="text-2xl font-black text-white tracking-tight">Notification</h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={markAllRead}
                            className="flex items-center gap-2 px-4 py-2 bg-[#53CCB8] text-white rounded-lg text-xs font-bold hover:brightness-110 transition-all active:scale-95"
                        >
                            <Check size={12} strokeWidth={3} />
                            Mark all as read
                        </button>
                        <button
                            onClick={clearAll}
                            className="flex items-center gap-2 px-4 py-2 bg-[#FFB800] text-white rounded-lg text-xs font-bold hover:brightness-110 transition-all active:scale-95"
                        >
                            <Trash2 size={12} />
                            Clear All
                        </button>
                    </div>
                </div>

                {/* Sub-tabs: Anime / Community */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setActiveTab('anime')}
                        className={`px-5 py-2 rounded-[6px] text-xs font-black tracking-widest uppercase transition-all ${activeTab === 'anime'
                            ? 'bg-primary text-white'
                            : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        Anime
                    </button>
                    <button
                        onClick={() => setActiveTab('community')}
                        className={`px-5 py-2 rounded-[6px] text-xs font-black tracking-widest uppercase transition-all ${activeTab === 'community'
                            ? 'bg-primary text-white'
                            : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        Community
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            <div className="min-h-[300px]">
                {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-700">
                        <div className="relative mb-6">
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            >
                                <PackageOpen size={90} strokeWidth={1} className="text-white/80" />
                            </motion.div>
                        </div>
                        <h3 className="text-sm font-black text-white/60 tracking-widest uppercase">No Notifications</h3>
                    </div>
                ) : (
                    <div className="grid gap-2.5">
                        <AnimatePresence mode="popLayout">
                            {filteredNotifications.map((n) => (
                                <motion.div
                                    key={n._id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                >
                                    <Link
                                        href={`/watch/${n.animeId}/${n.episodeId}${n.commentId ? `#comment-${n.commentId}` : ''}`}
                                        onClick={() => !n.isRead && markAsRead(n._id)}
                                        className={`group relative flex items-start gap-4 p-4 rounded-xl transition-all hover:bg-white/[0.03] active:scale-[0.99] ${n.isRead ? 'opacity-40' : 'bg-[#1a1b20]'}`}
                                    >
                                        <div className="relative shrink-0">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5">
                                                {n.fromUserId?.avatar ? (
                                                    <img src={n.fromUserId.avatar} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <User className="w-1/2 h-1/2 text-white/10" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#181818] flex items-center justify-center">
                                                {getActionIcon(n.type)}
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
                                                    <span className="text-[13px] font-black text-primary uppercase tracking-tight">
                                                        {n.fromUserId?.username || 'User'}
                                                    </span>
                                                    <span className="text-[13px] font-medium text-white/50">
                                                        {getActionText(n.type)}
                                                    </span>
                                                    <span className="text-[13px] font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                                                        {n.animeTitle} – Episode {n.episodeNumber}
                                                    </span>
                                                </div>
                                                {!n.isRead && (
                                                    <div className="shrink-0 w-2 h-2 rounded-full bg-primary" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="text-[11px] font-bold text-white/20 uppercase tracking-widest">
                                                    {timeAgo(n.createdAt)}
                                                </span>
                                                {!n.isRead && (
                                                    <button
                                                        onClick={(e) => markAsRead(n._id, e)}
                                                        className="text-[10px] font-black text-primary hover:text-primary/70 uppercase tracking-tighter hover:underline px-1"
                                                    >
                                                        Mark read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
