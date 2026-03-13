'use client';
import React, { useState, useEffect } from 'react';
import { getTitle } from '@/types/anime';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { fetchSchedule } from '@/lib/consumet';

interface ScheduleProps {
    scheduleList?: any[];
}

const Schedule: React.FC<ScheduleProps> = ({ scheduleList: initialList }) => {
    const [currentTime, setCurrentTime] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [list, setList] = useState<any[]>(initialList || []);
    const [loading, setLoading] = useState(false);
    const [selectedDateIndex, setSelectedDateIndex] = useState(1); // Index 1 is TODAY in our generateDays
    const [days, setDays] = useState<any[]>([]);

    const INITIAL_COUNT = 8;
    const EXPANDED_COUNT = 14;
    const displayCount = isExpanded ? EXPANDED_COUNT : INITIAL_COUNT;

    // Generate dynamic dates: Yesterday, Today, Tomorrow, +3 more
    const generateDays = () => {
        const dArr = [];
        const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

        for (let i = -1; i <= 4; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const dayNum = String(d.getDate()).padStart(2, '0');

            dArr.push({
                name: dayNames[d.getDay()],
                date: d.getDate().toString(),
                fullDate: `${year}-${month}-${dayNum}`,
                active: i === 0,
            });
        }
        return dArr;
    };

    // Setup live clock for the footer AND initialize days
    useEffect(() => {
        setDays(generateDays());

        const updateTime = () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const h = String(now.getHours()).padStart(2, '0');
            const m = String(now.getMinutes()).padStart(2, '0');
            const s = String(now.getSeconds()).padStart(2, '0');
            setCurrentTime(`${year}/${month}/${day} ${h}:${m}:${s}`);
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Fetch schedule when selected day changes
    useEffect(() => {
        if (days.length === 0) return;
        // Skip first load if we already have initialList and it's today
        if (selectedDateIndex === 1 && initialList && list === initialList) return;

        const loadDaySchedule = async () => {
            setLoading(true);
            try {
                const data = await fetchSchedule(days[selectedDateIndex].fullDate);
                setList(data);
            } catch (error) {
                console.error('Failed to load schedule for day:', error);
            } finally {
                setLoading(false);
            }
        };

        loadDaySchedule();
    }, [selectedDateIndex]);

    return (
        <div className="bg-sidebar rounded-[4px] overflow-hidden">
            {/* Day Selector Header */}
            <div className="p-3 pb-4 flex items-center justify-between bg-white/[0.01]">
                <button
                    onClick={() => setSelectedDateIndex(prev => Math.max(0, prev - 1))}
                    disabled={selectedDateIndex === 0}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${selectedDateIndex === 0 ? 'text-white/5 cursor-not-allowed' : 'bg-white/5 text-white/20 hover:text-white hover:bg-white/10'}`}
                >
                    <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-4">
                    {days.slice(Math.max(0, selectedDateIndex - 1), Math.min(days.length, selectedDateIndex + 2)).map((day, idx) => {
                        const actualIdx = days.findIndex(d => d.fullDate === day.fullDate);
                        const isActive = actualIdx === selectedDateIndex;
                        return (
                            <button
                                key={day.fullDate}
                                onClick={() => setSelectedDateIndex(actualIdx)}
                                className="flex flex-col items-center gap-2 outline-none group"
                            >
                                <span className={`text-[10px] font-black tracking-widest transition-colors ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/60'}`}>
                                    {day.name}
                                </span>
                                <div className={`w-11 h-9 rounded-xl flex items-center justify-center text-[12px] font-black transition-all ${isActive ? 'bg-primary text-white' : 'bg-[#181818] text-white/30 group-hover:bg-[#1A1A1F]'}`}>
                                    {day.date}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={() => setSelectedDateIndex(prev => Math.min(days.length - 1, prev + 1))}
                    disabled={selectedDateIndex === days.length - 1}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${selectedDateIndex === days.length - 1 ? 'text-white/5 cursor-not-allowed' : 'bg-white/5 text-white/20 hover:text-white hover:bg-white/10'}`}
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Schedule List */}
            <div className="flex flex-col bg-[#161618]/30 min-h-[300px] relative">
                {loading && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {list.length > 0 ? (
                    list.slice(0, displayCount).map((item, i) => {
                        const title = getTitle(item.title);
                        const broadcastTime = item.time || '';
                        const epNum = item.episode || '';

                        // Determine if this is upcoming
                        let isNext = false;
                        let isUpcoming = false;

                        if (broadcastTime && selectedDateIndex === 1) { // 1 is Today
                            const [h, m] = broadcastTime.split(':').map(Number);
                            const now = new Date();
                            const itemTime = new Date();
                            itemTime.setHours(h, m, 0, 0);

                            isUpcoming = itemTime > now;

                            // Find the first upcoming item to mark as "Next"
                            const firstUpcoming = list.find(it => {
                                if (!it.time) return false;
                                const [ih, im] = it.time.split(':').map(Number);
                                const itTime = new Date();
                                itTime.setHours(ih, im, 0, 0);
                                return itTime > now;
                            });
                            isNext = firstUpcoming && firstUpcoming.id === item.id && firstUpcoming.time === item.time;
                        }

                        return (
                            <Link
                                key={`${item.id}-${i}`}
                                href={`/watch/${item.id}`}
                                className="flex items-center gap-4 px-6 py-2 hover:bg-white/[0.03] transition-all group last:border-0"
                            >
                                <span className={`text-[11px] font-bold ${isNext ? 'text-primary' : 'text-white/20'} group-hover:text-white/40 transition-colors w-12 flex-shrink-0`}>
                                    {broadcastTime}
                                </span>
                                <div className="flex-1 flex items-center gap-2 min-w-0">
                                    <h5 className="text-[13px] font-bold text-white/60 group-hover:text-white transition-colors line-clamp-1 truncate tracking-tight">
                                        {title}
                                    </h5>
                                    {isNext && (
                                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" title="Next Episode" />
                                    )}
                                </div>
                                <span className="text-[10px] font-bold text-white/20 group-hover:text-white/40 tracking-widest text-right min-w-[40px]">
                                    EP {epNum}
                                </span>
                            </Link>
                        );
                    })
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 opacity-20">
                        {loading ? null : (
                            <>
                                <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/20 mb-4 animate-[spin_10s_linear_infinite]" />
                                <p className="text-[10px] font-black tracking-[0.2em]">No Schedule Found</p>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Clock & More Button */}
            <div className="px-5 py-4 bg-sidebar flex items-center justify-between">
                <div className="bg-white/[0.94] px-2.5 py-1 rounded-[4px] border border-white/[0.04]">
                    <p className="text-[11px] font-bold text-black/90">
                        {currentTime}
                    </p>
                </div>

                {list.length > INITIAL_COUNT && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-[12px] font-bold text-white/40 hover:text-white transition-all flex items-center gap-1.5 group"
                    >
                        {isExpanded ? 'Less' : 'More'}
                        <ChevronDown size={15} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} opacity-40 group-hover:opacity-100`} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Schedule;
