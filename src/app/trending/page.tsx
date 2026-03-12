import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Home } from 'lucide-react';

export default function TrendingPage() {
    return (
        <main className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
            <Navbar />

            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center px-4">
                {/* Character Image / GIF */}
                <div className="mb-0 -mt-20">
                    <img
                        src="https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3a3dtN3QwbWxmZ2dlYjVibnhzOXRyNmtueTA4cW45Mm1rMTI1enFseCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/mnEhag9YXWbxS/giphy.gif"
                        alt="Shocked Miku"
                        className="w-64 md:w-80 h-auto"
                    />
                </div>

                {/* Error Text */}
                <h1 className="text-[120px] md:text-[180px] font-display font-black text-white/5 leading-none select-none tracking-tighter -mb-8 md:-mb-12">
                    404
                </h1>

                <div className="space-y-4">
                    <h2 className="text-2xl md:text-3xl font-display font-black text-white tracking-tight">
                        404 error
                    </h2>
                    <p className="text-white/40 text-sm md:text-base font-medium max-w-sm mx-auto leading-relaxed">
                        Oops! We can't find this page.
                    </p>
                </div>

                {/* Action Button */}
                <div className="mt-10">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-hover text-black font-black text-sm rounded-full transition-all hover:scale-105 active:scale-95"
                    >
                        <Home size={16} strokeWidth={3} />
                        back to home
                    </Link>
                </div>
            </div>
        </main>
    );
}
