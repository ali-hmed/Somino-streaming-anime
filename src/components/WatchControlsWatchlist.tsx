"use client";

import React, { useState, useRef, useEffect } from "react";
import { Heart, ChevronDown, Check, Loader2, Trash2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { AnimatePresence, motion } from "framer-motion";

interface WatchControlsWatchlistProps {
    animeId: string;
    animeTitle: string;
    animeImage: string;
}

const STATUS_OPTIONS = ['Watching', 'Completed', 'Planned', 'Dropped'] as const;
type WatchlistStatus = (typeof STATUS_OPTIONS)[number];

export default function WatchControlsWatchlist({ animeId, animeTitle, animeImage }: WatchControlsWatchlistProps) {
    const { user, isAuthenticated, setWatchlist, setAuthModalOpen } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const itemInList = user?.watchlist?.find((item) => item.animeId === animeId);
    const currentStatus = itemInList?.status;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleUpdateStatus = async (status: WatchlistStatus) => {
        if (!isAuthenticated) {
            setAuthModalOpen(true);
            return;
        }

        setIsLoading(true);
        const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://somino-backend.vercel.app') + '/api/v1';

        try {
            const res = await fetch(`${BASE_URL}/auth/watchlist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify({
                    animeId,
                    animeTitle,
                    animeImage,
                    status
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setWatchlist(data.data);
                }
            }
        } catch (error) {
            console.error("Watchlist error:", error);
        } finally {
            setIsLoading(false);
            setIsOpen(false);
        }
    };

    const handleRemove = async () => {
        setIsLoading(true);
        const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://somino-backend.vercel.app') + '/api/v1';

        try {
            const res = await fetch(`${BASE_URL}/auth/watchlist/${animeId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });

            const data = await res.json();
            if (data.success) {
                setWatchlist(data.data);
            }
        } catch (error) {
            console.error("Watchlist remove error:", error);
        } finally {
            setIsLoading(false);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    if (!isAuthenticated) {
                        setAuthModalOpen(true);
                        return;
                    }
                    setIsOpen(!isOpen);
                }}
                disabled={isLoading}
                className={`flex items-center gap-2 text-[8.5px] font-bold transition-all whitespace-nowrap ${currentStatus ? 'text-primary' : 'text-white/40 hover:text-white'
                    }`}
            >
                {isLoading ? (
                    <Loader2 size={12} className="animate-spin text-primary" />
                ) : (
                    <>
                        <Heart size={12} className={currentStatus ? 'fill-current' : ''} strokeWidth={2.5} />
                        {currentStatus || "Bookmark"}
                    </>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 min-w-[120px] bg-[#0f1115]/95 backdrop-blur-2xl border border-white/5 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-50 p-1.5"
                    >
                        <div className="flex flex-col gap-0.5">
                            {STATUS_OPTIONS.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => handleUpdateStatus(status)}
                                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${currentStatus === status
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-white/40 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    {status}
                                    {currentStatus === status && <Check size={11} />}
                                </button>
                            ))}

                            {currentStatus && (
                                <>
                                    <div className="h-px bg-white/5 mx-2 my-1" />
                                    <button
                                        onClick={handleRemove}
                                        className="flex items-center justify-between px-3 py-1.5 rounded-lg text-[10px] font-bold text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                    >
                                        Remove
                                        <Trash2 size={11} />
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
