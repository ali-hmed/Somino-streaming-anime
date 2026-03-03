import React from 'react';
import Navbar from '@/components/Navbar';

export default function PlayerLoading() {
    return (
        <main className="min-h-screen bg-[#0b0b0c] text-white/90">
            <Navbar />

            <div className="container mx-auto px-4 pt-24 md:pt-32 pb-12 animate-pulse max-w-[1400px]">
                {/* upper section skeleton */}
                <div className="flex flex-col lg:flex-row gap-5 mb-12 lg:items-stretch h-full">

                    {/* 1. left: info panel skeleton */}
                    <aside className="w-full lg:w-[260px] shrink-0 order-3 lg:order-1">
                        <div className="bg-[#0f1115] rounded-[6px] overflow-hidden shadow-2xl border border-white/[0.02] flex flex-col h-full">
                            <div className="h-32 bg-white/5 relative flex items-center justify-center">
                                <div className="w-20 h-28 bg-white/10 rounded-[6px] shadow-2xl z-10" />
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="space-y-2 flex flex-col items-center">
                                    <div className="h-4 w-3/4 bg-white/10 rounded-[6px]" />
                                    <div className="h-3 w-1/2 bg-white/5 rounded-[6px]" />
                                </div>
                                <div className="space-y-3 pt-4 border-t border-white/[0.05]">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="flex justify-between">
                                            <div className="h-2.5 w-10 bg-white/5 rounded-[6px]" />
                                            <div className="h-2.5 w-14 bg-white/10 rounded-[6px]" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* 2. middle: player panel skeleton */}
                    <div className="flex-1 min-w-0 flex flex-col order-1 lg:order-2">
                        <div className="bg-[#141519]/80 backdrop-blur-xl rounded-[6px] overflow-hidden shadow-2xl border border-white/[0.03] flex flex-col h-full">
                            {/* header breadcrumb skeleton */}
                            <div className="px-5 py-3 h-10 bg-[#0b0c10]/40 border-b border-white/[0.03]">
                                <div className="h-3 w-48 bg-white/5 rounded-[6px]" />
                            </div>

                            {/* player aspect area */}
                            <div className="aspect-video w-full bg-black relative" />

                            {/* action bar skeleton - Unified Row */}
                            <div className="px-4 py-2.5 bg-[#0b0c10]/60 border-b border-white/[0.03] flex items-center justify-between md:justify-center gap-4 md:gap-7 overflow-x-auto no-scrollbar shrink-0">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                                    <div key={i} className="flex items-center gap-2 shrink-0">
                                        <div className="w-3.5 h-3.5 bg-white/5 rounded-sm" />
                                        <div className="h-2.5 w-10 bg-white/5 rounded-[6px]" />
                                    </div>
                                ))}
                            </div>


                            {/* bottom section skeleton - Redesigned to match the new split/centered structure */}
                            <div className="bg-[#0b0c10]/20 min-h-[160px] md:min-h-0">
                                {/* Desktop */}
                                <div className="hidden md:flex p-6 items-center justify-between gap-6">
                                    <div className="space-y-2">
                                        <div className="h-4 w-48 bg-white/10 rounded-[6px]" />
                                        <div className="h-3 w-64 bg-white/5 rounded-[6px]" />
                                    </div>
                                    <div className="flex flex-col items-end gap-3.5">
                                        <div className="flex gap-2">
                                            {[1, 2, 3].map(i => <div key={i} className="h-4 w-14 bg-white/5 rounded-[6px]" />)}
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="h-8 w-24 bg-[#53CCB8]/20 rounded-[6px]" />
                                            <div className="h-8 w-24 bg-white/5 rounded-[6px] border border-white/5" />
                                        </div>
                                    </div>
                                </div>
                                {/* Mobile */}
                                <div className="flex md:hidden flex-col items-center p-5 px-6 gap-4">
                                    <div className="flex gap-3">
                                        {[1, 2].map(i => <div key={i} className="h-5 w-20 bg-white/5 rounded-full" />)}
                                    </div>
                                    <div className="flex gap-2 w-full max-w-[280px]">
                                        <div className="flex-1 h-8 bg-[#53CCB8]/20 rounded-[5px]" />
                                        <div className="flex-1 h-8 bg-white/5 rounded-[5px] border border-white/5" />
                                    </div>
                                    <div className="space-y-2 flex flex-col items-center mt-1">
                                        <div className="h-3.5 w-40 bg-white/10 rounded-[6px]" />
                                        <div className="h-2 w-56 bg-white/5 rounded-[6px]" />
                                    </div>
                                    <div className="w-full mt-2 h-16 bg-white/[0.03] rounded-[10px] border border-white/[0.05]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. right: episode list skeleton */}
                    <aside className="w-full lg:w-[320px] shrink-0 order-2 lg:order-3">
                        <div className="bg-[#141519] rounded-[6px] border border-white/[0.03] h-[380px] lg:h-full overflow-hidden flex flex-col">
                            <div className="p-4 px-5 space-y-4 bg-white/[0.01] border-b border-white/[0.05]">
                                <div className="flex justify-between">
                                    <div className="h-4 w-16 bg-white/10 rounded-[6px]" />
                                    <div className="flex gap-2">
                                        <div className="h-4 w-6 bg-white/5 rounded-[6px]" />
                                        <div className="h-4 w-6 bg-white/5 rounded-[6px]" />
                                    </div>
                                </div>
                                <div className="h-9 w-full bg-black/40 border border-white/[0.05] rounded-[6px]" />
                            </div>
                            <div className="p-0 flex-1 space-y-[1px]">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <div key={i} className="h-11 w-full bg-white/[0.02]" />
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>

                {/* lower section skeleton */}
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1">
                        {/* comments skeleton */}
                        <div className="h-64 w-full bg-[#141519]/20 rounded-[6px] border border-white/[0.03]" />
                    </div>
                    <aside className="w-full lg:w-[320px] shrink-0 space-y-10">
                        {/* relations skeleton */}
                        <div className="space-y-4">
                            <div className="h-4 w-24 bg-white/5 rounded-[6px] border-l-2 border-primary pl-2" />
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-16 w-full bg-[#141519]/40 rounded-[6px] border border-white/[0.03]" />
                                ))}
                            </div>
                        </div>
                        {/* recommended skeleton */}
                        <div className="space-y-4">
                            <div className="h-4 w-24 bg-white/5 rounded-[6px] border-l-2 border-primary pl-2" />
                            <div className="space-y-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-16 w-full bg-[#141519]/40 rounded-[6px] border border-white/[0.03]" />
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}
