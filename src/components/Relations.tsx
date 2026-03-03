'use client';

import React from 'react';
import Link from 'next/link';
import { GitBranch, ChevronRight } from 'lucide-react';

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

    const displayRelations = showAll ? relations : relations.slice(0, 3);

    return (
        <div className="mt-10 rounded-2xl bg-[#0c0d10] border border-white/[0.05] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-6 pb-4">
                <div className="flex items-center gap-2">
                    <GitBranch size={16} className="text-primary" />
                    <h3 className="text-[14px] font-black text-white tracking-[0.1em] uppercase">related anime</h3>
                </div>

                {relations.length > 3 && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] font-bold text-white/50 transition-all hover:text-primary"
                    >
                        {showAll ? 'show less' : `see all (${relations.length})`}
                        <ChevronRight size={14} className={`transition-transform duration-300 ${showAll ? 'rotate-[-90deg]' : 'rotate-90'}`} />
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-2 p-2">
                {displayRelations.map((rel, idx) => (
                    <Link
                        key={idx}
                        href={`/watch/${rel.entry.mal_id}`}
                        className="group relative flex h-[80px] bg-[#0c0d10] hover:bg-white/[0.03] border border-white/[0.05] rounded-xl overflow-hidden transition-all duration-300 active:scale-[0.98]"
                    >
                        {/* Left Content */}
                        <div className="relative z-10 flex flex-col justify-center pl-6 pr-2 w-[70%] h-full">
                            <h4 className="text-[14px] font-bold text-white leading-tight truncate mb-2 group-hover:text-primary transition-colors">
                                {rel.entry.name}
                            </h4>

                            <div className="flex items-center gap-2">
                                {/* CC Badge */}
                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] border border-[#FF6E9F]/30 bg-[#FF6E9F]/10">
                                    <span className="text-[8px] font-black text-[#FF6E9F] uppercase">cc</span>
                                    <span className="text-[9px] font-black text-[#FF6E9F]">{rel.entry.subEpisodes || rel.entry.episodes || '?'}</span>
                                </div>
                                {/* Mic/Dub Badge */}
                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] border border-[#53CCB8]/30 bg-[#53CCB8]/10">
                                    <svg className="w-2 h-2 text-[#53CCB8] fill-current" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" /><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" /></svg>
                                    <span className="text-[9px] font-black text-[#53CCB8]">{rel.entry.subEpisodes || rel.entry.episodes || '?'}</span>
                                </div>
                                <span className="text-[11px] font-bold text-white/30 lowercase">{rel.entry.type || 'tv'}</span>
                                <span className="text-[10px] font-black text-white/40 lowercase truncate">{rel.relation}</span>
                            </div>
                        </div>

                        {/* Right Image Overlay */}
                        <div className="absolute top-0 right-0 w-[45%] h-full">
                            <div className="absolute inset-0 z-1 bg-gradient-to-r from-[#0c0d10] via-[#0c0d10]/60 to-transparent" />
                            <img
                                src={rel.entry.image}
                                className="w-full h-full object-cover transition-all duration-700 opacity-60 group-hover:opacity-100"
                                alt=""
                            />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Relations;
