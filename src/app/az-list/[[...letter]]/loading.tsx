import React from 'react';
import Navbar from '@/components/Navbar';
import SkeletonGrid from '@/components/SkeletonGrid';

export default function AZLoading() {
    return (
        <div className="min-h-screen bg-[#161618] flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 md:px-6 pt-24 md:pt-28 pb-12">
                {/* AZ Header Skeleton */}
                <div className="mb-10 animate-pulse">
                    <div className="h-4 w-48 bg-white/5 rounded mb-4" />
                    <div className="h-10 w-96 bg-white/10 rounded-lg" />
                </div>

                {/* Grid Skeleton */}
                <SkeletonGrid count={24} />
            </main>
        </div>
    );
}
