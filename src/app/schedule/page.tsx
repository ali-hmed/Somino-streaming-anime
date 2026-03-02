'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import AnimeCard from '@/components/AnimeCard';
import { fetchSchedule } from '@/lib/consumet';
import { Calendar, Clock, ChevronRight, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DAYS = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' },
];

export default function SchedulePage() {
    const [selectedDay, setSelectedDay] = useState(() => {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return dayNames[new Date().getDay()];
    });
    const [animeList, setAnimeList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSchedule = async () => {
            setLoading(true);
            try {
                const data = await fetchSchedule(selectedDay);
                setAnimeList(data);
            } catch (error) {
                console.error('Failed to load schedule:', error);
            } finally {
                setLoading(false);
            }
        };

        loadSchedule();
    }, [selectedDay]);

    return (
        <main className="min-h-screen bg-[#0E0E11] text-foreground pb-20">
            <Navbar />

            <div className="container mx-auto px-4 pt-28 md:pt-36">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary font-black tracking-[0.2em] text-[10px] md:text-xs">
                            <Clock size={14} className="animate-pulse" /> Live Broadcasts
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-none">
                            Estimated <span className="text-primary">Schedule</span>
                        </h1>
                        <p className="text-muted text-xs md:text-sm font-bold max-w-xl opacity-60">
                            Stay updated with the latest airing times for your favorite seasonal anime. Please note times are based on JST (Japan Standard Time).
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                        <div className="px-4 py-2 text-[10px] font-black tracking-widest text-white/40 border-r border-white/5 flex items-center gap-2">
                            <Filter size={12} /> Timezone
                        </div>
                        <div className="px-4 py-2 text-[10px] font-black tracking-widest text-primary">
                            JST (GMT+9)
                        </div>
                    </div>
                </div>

                {/* Day Selection Tabs */}
                <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-6 scrollbar-hide border-b border-white/5 mb-10">
                    {DAYS.map((day) => (
                        <button
                            key={day.id}
                            onClick={() => setSelectedDay(day.id)}
                            className={`px-6 py-3.5 rounded-xl font-black text-[10px] md:text-xs tracking-[0.15em] transition-all flex-shrink-0 border ${selectedDay === day.id ?'bg-primary border-primary text-white shadow-neon scale-105 z-10'
                                : 'bg-white/5 border-white/5 text-muted hover:border-white/10 hover:text-white'
                                }`}
                        >
                            {day.label}
                        </button>
                    ))}
                </div>

                {/* Content Grid */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-40 space-y-4"
                        >
                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-neon" />
                            <p className="text-[10px] font-black tracking-[0.3em] text-primary animate-pulse">Synchronizing Data...</p>
                        </motion.div>
                    ) : animeList.length > 0 ? (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8"
                        >
                            {animeList.map((anime, i) => (
                                <AnimeCard
                                    key={`${anime.id}-${i}`}
                                    anime={anime}
                                    variant="portrait"
                                    showBroadcast={true}
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-40 bg-white/5 rounded-3xl border border-dashed border-white/10"
                        >
                            <Calendar size={48} className="mx-auto text-white/10 mb-6" />
                            <h3 className="text-xl font-black text-white/40 tracking-widest">No Broadcasts Found</h3>
                            <p className="text-[10px] font-bold text-muted mt-2 tracking-widest">Check back later or try another day.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
