'use client';
import React, { useState, useEffect } from 'react';
import { getTitle } from '@/types/anime';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface ScheduleProps {
    scheduleList?: any[];
}

const Schedule: React.FC<ScheduleProps> = ({ scheduleList }) => {
    const [currentTime, setCurrentTime] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const list = scheduleList && scheduleList.length > 0 ? scheduleList : [];

    const INITIAL_COUNT = 8;
    const EXPANDED_COUNT = 14;
    const displayCount = isExpanded ? EXPANDED_COUNT : INITIAL_COUNT;

    // Setup live clock for the footer
    useEffect(() => {
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

    // Generate dynamic dates around today
    const generateDays = () => {
        const days = [];
        const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const today = new Date();

        // Show yesterday, today, and tomorrow-forward to match UI style
        for (let i = -1; i <= 3; i++) {
            const d = new Date();
            d.setDate(today.getDate() + i);
            days.push({
                name: dayNames[d.getDay()],
                date: d.getDate().toString(),
                active: i === 0,
            });
        }
        return days;
    };

    const days = generateDays();

    return (
        <div className="bg-[#111114] border border-white/5 rounded-[4px] overflow-hidden shadow-2xl">
            {/* Day Selector Header */}
            <div className="p-3 pb-4 flex items-center justify-between bg-white/[0.01]">
                <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all">
                    <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-4">
                    {days.slice(1, 4).map((day) => (
                        <div key={day.name} className="flex flex-col items-center gap-2">
                            <span className={`text-[10px] font-black tracking-widest ${day.active ?'text-white' : 'text-white/40'}`}>
                                {day.name}
                            </span>
                            <div className={`w-11 h-9 rounded-xl flex items-center justify-center text-[12px] font-black transition-all ${day.active ?'bg-primary text-white' : 'bg-[#1e1e21] text-white/30'}`}>
                                {day.date}
                            </div>
                        </div>
                    ))}
                </div>

                <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all">
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Schedule List */}
            <div className="flex flex-col bg-[#161618]/30">
                {list.length > 0 ? (
                    list.slice(0, displayCount).map((item, i) => {
                        const title = getTitle(item.title);
                        const broadcastTime = item.broadcast?.time || `${String(5 + i).padStart(2, '0')}:00`;

                        return (
                            <Link
                                key={`${item.id}-${i}`}
                                href={`/watch/${item.id}`}
                                className="flex items-center gap-4 px-6 py-2 hover:bg-white/[0.03] transition-all group border-b border-white/[0.02] last:border-0"
                            >
                                <span className="text-[11px] font-bold text-white/20 group-hover:text-white/40 transition-colors w-12 flex-shrink-0">
                                    {broadcastTime}
                                </span>
                                <h5 className="flex-1 text-[13px] font-bold text-white/60 group-hover:text-white transition-colors line-clamp-1 truncate tracking-tight">
                                    {title}
                                </h5>
                                <span className="text-[10px] font-bold text-white/20 group-hover:text-white/40 tracking-widest text-right min-w-[40px]">
                                    EP {item.episodeNumber || (10 + i)}
                                </span>
                            </Link>
                        );
                    })
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 opacity-20">
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-white mb-4 animate-[spin_10s_linear_infinite]" />
                        <p className="text-[10px] font-black tracking-[0.2em]">Updating Schedule...</p>
                    </div>
                )}
            </div>

            {/* Footer Clock & More Button */}
            <div className="px-5 py-4 bg-[#111114] flex items-center justify-between border-t border-white/5">
                <p className="text-[11px] font-bold text-white/20 font-mono tracking-tighter">
                    {currentTime}
                </p>

                {list.length > INITIAL_COUNT && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-[12px] font-bold text-white/40 hover:text-white transition-all flex items-center gap-1.5 group"
                    >
                        {isExpanded ? 'Less' : 'More'}
                        <ChevronDown size={15} className={`transition-transform duration-300 ${isExpanded ?'rotate-180' : ''} opacity-40 group-hover:opacity-100`} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Schedule;
