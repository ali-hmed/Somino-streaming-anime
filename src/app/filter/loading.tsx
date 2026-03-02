import React from 'react';
import SkeletonGrid from '@/components/SkeletonGrid';

export default function Loading() {
    return (
        <main className="min-h-screen bg-background text-foreground pb-20">
            {/* Navbar is usually fixed, but we can't show it here as it's in the root layout or page. 
               Normally it stays visible because it's in layout.tsx */}

            <div className="container mx-auto max-w-[1200px] px-4 pt-24 md:pt-32">
                {/* Breadcrumbs Skeleton */}
                <div className="flex items-center gap-2 mb-8 h-4 w-32 bg-white/5 rounded animate-pulse" />

                <div className="flex flex-col gap-8">
                    {/* Filter Panel Skeleton */}
                    <div className="bg-[#141519] border border-white/[0.04] rounded-[10px] p-6 shadow-xl animate-pulse">
                        <div className="h-4 w-20 bg-white/10 rounded mb-5" />
                        <div className="flex flex-wrap gap-2 mb-5">
                            {Array.from({ length: 7 }).map((_, i) => (
                                <div key={i} className="h-9 w-28 bg-white/5 rounded-[7px] border border-white/[0.05]" />
                            ))}
                        </div>
                        <div className="border-t border-white/[0.04] mb-5" />
                        <div className="h-3 w-16 bg-white/5 rounded mb-3" />
                        <div className="max-h-[135px] md:max-h-none overflow-hidden mb-2">
                            <div className="flex flex-wrap gap-1.5 md:mb-6">
                                {Array.from({ length: 18 }).map((_, i) => (
                                    <div key={i} className="h-6 w-16 bg-white/5 rounded-[5px]" />
                                ))}
                            </div>
                        </div>
                        <div className="mt-8 h-10 w-32 bg-white/10 rounded-[7px]" />
                    </div>

                    {/* Results Section Skeleton */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />
                        </div>
                        <SkeletonGrid count={12} />
                    </div>
                </div>
            </div>
        </main>
    );
}
