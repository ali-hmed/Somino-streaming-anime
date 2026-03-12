"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import ReleaseItem from './ReleaseItem';

interface BottomSectionsProps {
    topAiring: any[];
    mostPopular: any[];
    latestCompleted: any[];
}

const BottomSections: React.FC<BottomSectionsProps> = ({ topAiring, mostPopular, latestCompleted }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const dataSections = [
        { title: 'Top Airing', data: topAiring.slice(0, 4) },
        { title: 'Most Popular', data: mostPopular.slice(0, 4) },
        { title: 'Completed', data: latestCompleted.slice(0, 4) }
    ];

    const nextSection = () => setActiveIndex((prev) => (prev + 1) % dataSections.length);
    const prevSection = () => setActiveIndex((prev) => (prev - 1 + dataSections.length) % dataSections.length);

    return (
        <div className="mt-8 md:mt-14 w-full">
            {/* Desktop View: Grid layout */}
            <div className="hidden md:grid md:grid-cols-3 gap-8">
                {dataSections.map((section, idx) => (
                    <div key={idx} className="flex flex-col">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h3 className="text-[13px] font-black tracking-[0.15em] text-white/50">
                                {section.title}
                            </h3>
                            <ChevronRight size={14} className="text-primary/60" />
                        </div>
                        <div className="bg-[#181818] rounded-[8px] flex flex-col">
                            {section.data.map((item, i) => (
                                <ReleaseItem key={`${item.id}-${i}`} anime={item} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Mobile View: Single Paginated Card */}
            <div className="md:hidden flex flex-col">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[20px] font-black text-white/95 tracking-tight">
                        {dataSections[activeIndex].title}
                    </h3>
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5">
                        <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                        </svg>
                    </div>
                </div>

                {/* Card Container */}
                {/* Card Container */}
                <div className="bg-[#181818] rounded-[8px] mx-1 md:mx-0 relative overflow-hidden">
                    <div className="flex flex-col">
                        {dataSections[activeIndex].data.map((item, i) => (
                            <ReleaseItem key={`${item.id}-${i}`} anime={item} />
                        ))}
                    </div>

                    {/* Navigation Arrows at the bottom of the card content */}
                    <div className="flex items-center justify-center gap-20 py-4 mt-2">
                        <button
                            onClick={prevSection}
                            className="p-2 text-white/20 hover:text-white transition-colors"
                        >
                            <ChevronLeft size={28} strokeWidth={2.5} />
                        </button>
                        <button
                            onClick={nextSection}
                            className="p-2 text-primary hover:text-primary-hover transition-colors"
                        >
                            <ChevronRight size={28} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BottomSections;
