"use client";

import React, { useState, useRef, useEffect } from "react";
import { BookmarkPlus, ChevronDown, Check, Loader2, Trash2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { AnimatePresence, motion } from "framer-motion";
import WatchlistToast, { WatchlistToastStatus } from "./WatchlistToast";

interface WatchlistButtonProps {
    animeId: string;
    animeTitle: string;
    animeImage: string;
}

const STATUS_OPTIONS = ['Watching', 'Completed', 'Planned', 'On-Hold', 'Dropped'] as const;
type WatchlistStatus = (typeof STATUS_OPTIONS)[number];

export default function WatchlistButton({ animeId, animeTitle, animeImage }: WatchlistButtonProps) {
    const { user, isAuthenticated, setWatchlist, setAuthModalOpen } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<WatchlistToastStatus>(null);
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const itemInList = user?.watchlist?.find((item) => item.animeId === animeId);
    const currentStatus = itemInList?.status;

    const showToast = (status: WatchlistToastStatus) => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToast(status);
        toastTimerRef.current = setTimeout(() => setToast(null), 3200);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
    }, []);

    const handleUpdateStatus = async (status: WatchlistStatus) => {
        if (!isAuthenticated) {
            setAuthModalOpen(true);
            return;
        }

        setIsLoading(true);
        const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api-somino.up.railway.app') + '/api/v1';

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
                    showToast(status);
                }
            } else {
                const text = await res.text();
                console.error("Watchlist operation error response:", text);
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
        const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api-somino.up.railway.app') + '/api/v1';

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
                showToast('Removed');
            }
        } catch (error) {
            console.error("Watchlist remove error:", error);
        } finally {
            setIsLoading(false);
            setIsOpen(false);
        }
    };

    return (
        <>
            <div className="relative w-full" ref={dropdownRef}>
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
                    className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md text-[10px] font-semibold transition-all ${currentStatus
                        ? 'bg-primary/10 text-primary hover:bg-primary/20'
                        : 'bg-white/5 text-white/70 hover:text-white'
                        }`}
                >
                    {isLoading ? (
                        <Loader2 size={12} className="animate-spin text-primary" />
                    ) : (
                        <>
                            <BookmarkPlus size={13} />
                            {currentStatus || "Add To List"}
                            <ChevronDown size={11} className={`ml-auto transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} opacity-40`} />
                        </>
                    )}
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 4, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.98 }}
                            className="absolute bottom-full left-0 w-full mb-2 bg-[#181818] rounded-xl overflow-hidden z-50 p-1.5"
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

            {/* Toast Notification */}
            <WatchlistToast
                status={toast}
                animeTitle={animeTitle}
                onClose={() => setToast(null)}
            />
        </>
    );
}
