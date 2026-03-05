"use client";

import React, { useState } from "react";
import { Bell, BellOff, CheckCircle, Trash2 } from "lucide-react";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'episode' | 'system';
    time: string;
    read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: "1",
        title: "New Episode: Solo Leveling S2",
        message: "Episode 8 is now available for streaming.",
        type: "episode",
        time: "2 hours ago",
        read: false
    },
    {
        id: "2",
        title: "System Update",
        message: "We've added new servers for better streaming experience.",
        type: "system",
        time: "5 hours ago",
        read: false
    },
    {
        id: "3",
        title: "New Episode: Blue Lock S2",
        message: "Episode 12 is now available for streaming.",
        type: "episode",
        time: "1 day ago",
        read: true
    }
];

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const deleteOne = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-5 rounded-full" style={{ background: "var(--primary)" }} />
                    <h2 className="text-[17px] font-bold text-white">Notifications</h2>
                </div>

                {notifications.length > 0 && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={markAllRead}
                            className="text-[11px] font-bold text-white/40 hover:text-primary transition-colors"
                        >
                            Mark all as read
                        </button>
                        <button
                            onClick={clearAll}
                            className="text-[11px] font-bold text-white/40 hover:text-red-500 transition-colors flex items-center gap-1.5"
                        >
                            <Trash2 size={12} /> Clear all
                        </button>
                    </div>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="rounded-2xl p-20 flex flex-col items-center justify-center text-center space-y-4"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div className="p-4 rounded-full bg-white/5">
                        <BellOff size={32} className="text-white/20" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold">No notifications</h3>
                        <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                            You're all caught up!
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((n) => (
                        <div key={n.id}
                            className={`group relative rounded-2xl p-5 border transition-all ${n.read ? 'opacity-60' : 'opacity-100'}`}
                            style={{
                                background: n.read ? "transparent" : "var(--surface)",
                                border: n.read ? "1px solid var(--border)" : "1px solid var(--primary-alpha)"
                            }}
                        >
                            <div className="flex gap-4">
                                <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${n.type === 'episode' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-500'}`}>
                                    <Bell size={18} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <h3 className="text-[14px] font-bold text-white truncate">{n.title}</h3>
                                        <span className="text-[10px] font-bold whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{n.time}</span>
                                    </div>
                                    <p className="text-[12px] leading-relaxed mb-3" style={{ color: "var(--text-muted)" }}>{n.message}</p>

                                    <div className="flex items-center gap-3">
                                        {!n.read && (
                                            <button
                                                onClick={() => markAsRead(n.id)}
                                                className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                                            >
                                                <CheckCircle size={12} /> Mark as read
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteOne(n.id)}
                                            className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-red-500 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
