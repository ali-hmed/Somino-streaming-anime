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
                <h2 className="text-[18px] md:text-[22px] font-black tracking-wide text-[#ffbade]">
                    Characters & Voice Actors
                </h2>
                <Link href="#" className="text-white/50 text-[12px] md:text-[13px] hover:text-white transition-colors flex items-center gap-1 font-medium">
                    View more <ChevronRight size={14} />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                {characters.map((char, index) => {
                    const va = char.voiceActors?.[0];

                    return (
                        <div key={`${char.id}-${index}`} className="bg-[#2A2C37]/80 hover:bg-[#343644] transition-colors rounded-[8px] p-2 flex justify-between items-center group">
                            {/* Character Side */}
                            <div className="flex items-center gap-3 w-1/2">
                                <img src={char.imageUrl} alt={char.name} className="w-[38px] h-[38px] md:w-[46px] md:h-[46px] rounded-full object-cover shrink-0" />
                                <div className="flex flex-col min-w-0">
                                    <h4 className="text-[12px] md:text-[13px] font-bold text-white truncate group-hover:text-primary transition-colors">{char.name}</h4>
                                    <span className="text-[10px] md:text-[11px] text-white/50">{char.role || 'Main'}</span>
                                </div>
                            </div>

                            {/* Voice Actor Side */}
                            {va && (
                                <div className="flex items-center gap-3 w-1/2 justify-end text-right">
                                    <div className="flex flex-col min-w-0">
                                        <h4 className="text-[12px] md:text-[13px] font-bold text-white truncate group-hover:text-primary transition-colors">{va.name}</h4>
                                        <span className="text-[10px] md:text-[11px] text-white/50">{va.cast || 'Japanese'}</span>
                                    </div>
                                    <img src={va.imageUrl} alt={va.name} className="w-[38px] h-[38px] md:w-[46px] md:h-[46px] rounded-full object-cover shrink-0" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
