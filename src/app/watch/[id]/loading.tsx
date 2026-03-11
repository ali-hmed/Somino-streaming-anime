import React from 'react';
import Navbar from '@/components/Navbar';

export default function WatchLoading() {
    return (
        <main className="min-h-screen bg-[#161618] text-white pb-20 flex-1">
            <Navbar />

            <div className="animate-pulse">
                {/* Blurred Background Hero Skeleton */}
                <div className="relative w-full">
                    <div className="absolute inset-0 h-72 bg-white/5 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-[#161618]/60 via-[#161618]/80 to-[#161618]" />
                    </div>

                    {/* Top Header Section Skeleton */}
                    <div className="relative z-10 container mx-auto px-4 md:px-6 pt-24 md:pt-28 pb-6 max-w-[1400px]">
                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="flex flex-col md:flex-row gap-6 flex-1">
                                {/* Poster Skeleton */}
                                <div className="flex-shrink-0 mx-auto md:mx-0">
                                    <div className="w-[130px] aspect-[2/3] rounded-xl bg-[#1e1e22]/80 border border-white/5 shadow-2xl" />
                                    <div className="mt-3 w-full py-2 bg-white/5 rounded-md h-8 border border-white/5" />
                                </div>

                                {/* Info Skeleton */}
                                <div className="flex-1 space-y-3">
                                    {/* Type & Status badges */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <div className="h-5 w-14 rounded bg-white/10" />
                                        <div className="h-5 w-24 rounded bg-white/10" />
                                        <div className="h-5 w-10 rounded bg-white/10" />
                                        <div className="h-4 w-20 rounded bg-white/5" />
                                    </div>

                                    {/* Title */}
                                    <div className="h-10 w-3/4 rounded-lg bg-white/15" />

                                    {/* Subtitle */}
                                    <div className="h-4 w-1/2 rounded bg-white/5 mt-2" />

                                    {/* CTA Button */}
                                    <div className="mt-4 h-10 w-36 rounded-full bg-primary/20" />

                                    {/* Stats Row */}
                                    <div className="flex flex-wrap items-center gap-3 pt-4">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center min-w-[90px] gap-2">
                                                <div className="h-2 w-10 rounded bg-white/10" />
                                                <div className="h-6 w-12 rounded-lg bg-white/15" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Sidebar - Characters Skeleton */}
                            <div className="hidden lg:block lg:w-[480px] xl:w-[600px] shrink-0 pl-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-4 w-24 bg-primary/30 rounded-md" />
                                    <div className="h-3 w-16 bg-white/10 rounded-md" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {[...Array(10)].map((_, i) => (
                                        <div key={i} className="flex flex-col gap-2 p-1.5 rounded-lg bg-[#1e1e22]/80 border border-white/5 h-[46px]" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Body Skeleton */}
                <div className="container mx-auto px-4 md:px-6 mt-6 max-w-[1400px]">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Left Sidebar */}
                        <aside className="lg:w-[260px] xl:w-[280px] flex-shrink-0">
                            <div className="h-[600px] w-full rounded-2xl bg-[#1e1e22]/80 border border-white/5 shadow-sm" />
                        </aside>

                        {/* Main Content */}
                        <div className="flex-1 space-y-6">
                            {/* Synopsis section */}
                            <div className="h-40 w-full rounded-2xl bg-[#1e1e22]/80 border border-white/5" />
                            {/* Video section */}
                            <div className="aspect-video w-full rounded-2xl bg-[#1e1e22]/80 border border-white/5 shadow-xl" />
                            {/* Recommended section */}
                            <div className="h-80 w-full rounded-2xl bg-[#1e1e22]/80 border border-white/5" />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
