"use client";

import React, { useState, useEffect } from "react";
import { Bell, BellOff, CheckCircle, Trash2, Loader2, User, MessageCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { timeAgo } from "@/utils/dateUtils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NotificationType {
    _id: string;
    userId: string;
    fromUserId: {
        _id: string;
        username: string;
        avatar?: string;
    };
    type: 'reply' | 'like' | 'dislike';
    commentId: string;
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

    const markAsRead = async (id: string) => {
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 rounded-full bg-primary shadow-[0_0_12px_rgba(83,204,184,0.4)]" />
                    <h2 className="text-lg font-black text-white tracking-tight uppercase">Notifications</h2>
                    {notifications.some(n => !n.isRead) && (
                        <span className="bg-primary/20 text-primary text-[10px] font-black px-2 py-0.5 rounded-full border border-primary/20 ml-1">
                            {notifications.filter(n => !n.isRead).length} NEW
                        </span>
                    )}
                </div>

                {notifications.length > 0 && notifications.some(n => !n.isRead) && (
                    <button
                        onClick={markAllRead}
                        className="text-[11px] font-bold text-white/30 hover:text-primary transition-colors uppercase tracking-widest"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="rounded-2xl p-24 flex flex-col items-center justify-center text-center space-y-6 bg-[#141519]/40 border border-white/5 backdrop-blur-md">
                    <div className="p-6 rounded-full bg-white/[0.02] border border-white/5">
                        <BellOff size={40} className="text-white/5" />
                    </div>
                    <div>
                        <h3 className="text-white font-black uppercase tracking-widest text-sm">No notifications</h3>
                        <p className="text-[12px] font-medium mt-1 text-white/20">
                            When people interact with you, it'll show up here.
                        </p>
                    </div>
                    <Link href="/" className="px-8 py-2.5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-transform active:scale-95">
                        Start Watching
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((n) => (
                        <Link
                            key={n._id}
                            href={`/watch/${n.animeId}/${n.episodeId}#comment-${n.commentId}`}
                            onClick={() => !n.isRead && markAsRead(n._id)}
                            className={`group relative flex items-start gap-4 p-4 rounded-xl border transition-all hover:scale-[1.01] active:scale-[0.99] ${n.isRead ? 'opacity-40 bg-transparent border-white/5' : 'opacity-100 bg-[#141519]/60 border-primary/20 shadow-lg'}`}
                        >
                            <div className="relative shrink-0">
                                <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-white/5">
                                    {n.fromUserId?.avatar ? (
                                        <img src={n.fromUserId.avatar} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User className="w-1/2 h-1/2 text-white/10" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#1a1b20] border border-white/10 flex items-center justify-center shadow-lg">
                                    {getActionIcon(n.type)}
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
                                        <span className="text-[13px] font-black text-primary uppercase">
                                            {n.fromUserId?.username || 'Some user'}
                                        </span>
                                        <span className="text-[13px] font-medium text-white/50">
                                            {getActionText(n.type)}
                                        </span>
                                        <span className="text-[13px] font-bold text-white group-hover:text-primary transition-colors">
                                            {n.animeTitle} – Episode {n.episodeNumber}
                                        </span>
                                    </div>
                                    {!n.isRead && (
                                        <div className="shrink-0 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(83,204,184,0.6)]" />
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-[11px] font-bold text-white/20 uppercase tracking-wider">
                                        {timeAgo(n.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
