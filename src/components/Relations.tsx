'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface RelationsProps {
    relations: {
        relation: string;
        entry: {
            mal_id: number;
            type: string;
            name: string;
            image?: string;
            episodes?: number;
            subEpisodes?: number;
            dubEpisodes?: number;
            status?: string;
        };
    }[];
}

const Relations: React.FC<RelationsProps> = ({ relations }) => {
    const [showAll, setShowAll] = React.useState(false);

    if (!relations || relations.length === 0) return null;

    const displayRelations = showAll ? relations : relations.slice(0, 4);

    return (
        <section className="bg-[#141418] rounded-xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-black text-white tracking-widest pl-3 border-l-4 border-primary">Relations</h2>
                </div>
                {relations.length > 4 && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-[11px] font-bold text-white/50 hover:text-primary transition-colors flex items-center gap-1"
                    >
                        {showAll ? 'Show less' : 'See more'}
                        <ChevronRight size={14} className={`transition-transform duration-300 ${showAll ? '-rotate-90' : 'rotate-90'}`} />
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {displayRelations.map((rel: any, i: number) => (
                    <Link
                        key={i}
                        href={`/watch/${rel.entry.mal_id}`}
                        className="group flex items-center gap-3 bg-background/40 hover:bg-white/5 transition-all p-3 rounded-lg"
                    >
                        <div className="w-12 h-16 shrink-0 rounded overflow-hidden">
                            {rel.entry.image && (
                                <img src={rel.entry.image} alt={rel.entry.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-[12px] font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">{rel.entry.name}</h4>
                            <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1">
                                <span className="text-[9px] font-black text-primary/80 uppercase">{rel.relation}</span>
                                <span className="text-[9px] text-white/30 truncate">{rel.entry.type || 'TV'} · {rel.entry.subEpisodes || rel.entry.episodes || '?'} eps</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default Relations;
