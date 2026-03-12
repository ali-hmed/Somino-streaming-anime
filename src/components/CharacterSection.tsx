"use client"

import React, { useState } from 'react';

interface CharacterCardProps {
    char: any;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ char }) => {
    const va = char.voiceActors?.[0];

    return (
        <div className="flex items-center justify-between p-1.5 rounded-md bg-card hover:bg-surface transition-all group overflow-hidden">
            <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden transition-all">
                    <img
                        src={char.imageUrl}
                        alt={char.name}
                        className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500 scale-110"
                    />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold text-white/90 truncate leading-tight group-hover:text-primary transition-colors">{char.name}</span>
                    <span className="text-[8px] text-white/30 font-medium">{char.role}</span>
                </div>
            </div>
            {va && (
                <div className="flex items-center gap-1.5 text-right min-w-0 ml-1">
                    <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-bold text-white/60 truncate leading-tight">{va.name}</span>
                        <span className="text-[8px] text-white/20 font-semibold">{va.cast || 'JP'}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

interface CharacterSectionProps {
    characters: any[];
}

export default function CharacterSection({ characters }: CharacterSectionProps) {
    const [expanded, setExpanded] = useState(false);

    if (!characters) return null;
    const hasCharacters = characters.length > 0;

    const initialCount = 10;
    const displayed = expanded ? characters : characters.slice(0, initialCount);

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-[13px] font-black text-white tracking-tight border-l-3 border-primary pl-2.5">Characters</h2>
                {characters.length > initialCount && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-[10px] font-bold text-white/30 hover:text-primary transition-colors tracking-tight"
                    >
                        {expanded ? 'show less' : `view all (${characters.length})`}
                    </button>
                )}
            </div>
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-2 ${expanded ? 'max-h-[600px] overflow-y-auto pr-2 custom-scrollbar' : ''}`}>
                {hasCharacters ? (
                    displayed.map((char, i) => (
                        <CharacterCard key={`${char.id || i}-${i}`} char={char} />
                    ))
                ) : (
                    <div className="py-8 text-center bg-card rounded-lg">
                        <p className="text-[10px] font-black tracking-widest text-white/20">no characters data available</p>
                    </div>
                )}
            </div>

        </section>
    );
}
