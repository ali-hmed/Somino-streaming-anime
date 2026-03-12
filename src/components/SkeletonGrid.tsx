import React from 'react';

const SkeletonCard = () => (
    <div className="flex flex-col gap-2 animate-pulse">
        <div className="aspect-[2/3] w-full bg-[#1e1e22]/80 rounded-xl" />
        <div className="h-4 w-3/4 bg-white/10 rounded-md" />
        <div className="h-3 w-1/2 bg-white/5 rounded-md" />
    </div>
);

const SkeletonGrid = ({ count = 24 }: { count?: number }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} />
        ))}
    </div>
);

export default SkeletonGrid;
