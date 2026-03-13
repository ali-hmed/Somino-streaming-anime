'use client';

import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Character {
    name: string;
    id: string;
    imageUrl: string;
    role: string;
    voiceActors: {
        name: string;
        id: string;
        imageUrl: string;
        cast: string;
    }[];
}

interface WatchCharactersProps {
    animeId: string;
}

export default function WatchCharacters({ animeId }: WatchCharactersProps) {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCharacters = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'}/api/v1/characters/${animeId}`);
                const data = await res.json();
                if (data.success && data.data?.response) {
                    setCharacters(data.data.response.slice(0, 6)); // Show max 6 as per screenshot
                }
            } catch (error) {
                console.error("Failed to fetch characters:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (animeId) {
            fetchCharacters();
        }
    }, [animeId]);

    if (isLoading || characters.length === 0) return null;

    return (
        <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
                <h2 className="section-title text-[18px] md:text-[19px] font-black tracking-tight text-white uppercase">
                    Characters & Voice Actors
                </h2>
                <Link href="#" className="flex items-center gap-1 text-[11px] font-black tracking-widest text-white/40 hover:text-white transition-colors">
                    view more <ChevronRight size={14} className="text-primary" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                {characters.map((char, index) => {
                    const va = char.voiceActors?.[0];

                    return (
                        <div key={`${char.id}-${index}`} className="bg-surface/50 hover:bg-surface transition-colors rounded-[4px] p-2 flex justify-between items-center group border border-white/[0.03]">
                            {/* Character Side */}
                            <div className="flex items-center gap-3 w-1/2">
                                <div className="relative shrink-0">
                                    <img src={char.imageUrl} alt={char.name} className="w-[42px] h-[42px] rounded-full object-cover border border-white/10" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <h4 className="text-[12px] font-bold text-white truncate group-hover:text-primary transition-colors">{char.name}</h4>
                                    <span className="text-[10px] text-white/40 uppercase tracking-tighter font-medium">{char.role || 'Main'}</span>
                                </div>
                            </div>

                            {/* Voice Actor Side */}
                            {va && (
                                <div className="flex items-center gap-3 w-1/2 justify-end text-right">
                                    <div className="flex flex-col min-w-0">
                                        <h4 className="text-[12px] font-bold text-white truncate group-hover:text-primary transition-colors">{va.name}</h4>
                                        <span className="text-[10px] text-white/40 uppercase tracking-tighter font-medium">{va.cast || 'Japanese'}</span>
                                    </div>
                                    <div className="relative shrink-0">
                                        <img src={va.imageUrl} alt={va.name} className="w-[42px] h-[42px] rounded-full object-cover border border-white/10" />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
