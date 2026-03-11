import React from 'react';
import Navbar from '@/components/Navbar';

export default function HomeLoading() {
    return (
        <div className="min-h-screen bg-[#161618] flex flex-col">
            <Navbar />

            <div className="animate-pulse">
                {/* Hero Skeleton */}
                <div className="w-full h-[300px] md:h-[500px] bg-[#1a1b20]" />

                {/* Trending Row Skeleton */}
                <div className="container mx-auto px-4 mt-8">
                    <div className="h-6 w-32 bg-white/10 rounded-md mb-6" />
                    <div className="flex gap-4 overflow-hidden">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="flex-shrink-0 w-40 h-56 rounded-xl bg-[#1e1e22]/80 border border-white/5 shadow-lg" />
                        ))}
                    </div>
                </div>

                {/* Main content Area Skeleton */}
                <div className="container mx-auto px-4 mt-12">
                    <div className="flex flex-col lg:flex-row gap-10">
                        {/* Left column */}
                        <div className="lg:w-3/4 space-y-12">
                            <div className="h-8 w-48 bg-white/10 rounded-md mb-6" />
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <div key={i} className="flex flex-col gap-2">
                                        <div className="aspect-[2/3] w-full bg-[#1e1e22]/80 border border-white/5 rounded-xl shadow-lg" />
                                        <div className="h-4 w-3/4 bg-white/10 rounded-md" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right column */}
                        <div className="lg:w-1/4 space-y-8">
                            <div className="h-8 w-32 bg-white/10 rounded-md mb-6" />
                            <div className="space-y-4">
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 h-16 w-full rounded-xl bg-[#1e1e22]/80 border border-white/5 shadow-md" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
