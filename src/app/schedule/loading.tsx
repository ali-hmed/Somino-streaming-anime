import React from 'react';
import Navbar from '@/components/Navbar';

export default function ScheduleLoading() {
    return (
        <div className="min-h-screen bg-[#161618] flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 md:px-6 pt-24 md:pt-28 pb-12">
                <div className="animate-pulse space-y-12">
                    {/* Header */}
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="h-4 w-32 bg-white/5 rounded" />
                        <div className="h-12 w-64 bg-white/10 rounded-xl" />
                    </div>

                    {/* Day Tabs */}
                    <div className="flex gap-2 justify-center overflow-x-auto pb-4">
                        {[1, 2, 3, 4, 5, 6, 7].map(i => (
                            <div key={i} className="flex-shrink-0 w-24 h-12 rounded-xl bg-white/5 border border-white/10" />
                        ))}
                    </div>

                    {/* Schedule List */}
                    <div className="max-w-4xl mx-auto space-y-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 h-24" />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
