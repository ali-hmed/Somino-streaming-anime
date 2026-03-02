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
    if (!relations || relations.length === 0) return null;

    return (
        <div className="mt-10">
            <div className="flex items-center gap-2 mb-5">
                <GitBranch size={16} className="text-primary" />
                <h3 className="text-[13px] font-black text-white tracking-[0.1em]">related anime</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                {relations.map((rel, idx) => (
                    <Link
                        key={idx}
                        href={`/watch/${rel.entry.mal_id}`}
                        className="group flex gap-3 p-2.5 rounded-[6px] bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06] hover:border-primary/30 transition-all active:scale-[0.98]"
                    >
                        {/* Image Thumbnail */}
                        <div className="w-14 h-20 shrink-0 rounded-[6px] overflow-hidden relative shadow-lg">
                            <img
                                src={rel.entry.image}
                                alt=""
                                className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                                <span className="text-[8px] font-black text-white block text-center truncate">
                                    {rel.entry.type || 'tv'}
                                </span>
                            </div>
                        </div>

                        {/* Metadata Content */}
                        <div className="flex flex-col justify-center min-w-0 flex-1">
                            <span className="text-[9px] font-bold text-primary tracking-tighter mb-0.5">
                                {rel.relation}
                            </span>
                            <h4 className="text-[12px] font-bold text-white/90 leading-snug line-clamp-2 group-hover:text-white transition-colors mb-1.5">
                                {rel.entry.name}
                            </h4>
                            <div className="flex items-center gap-2.5">
                                <span className="text-[9px] font-black text-white/30">
                                    {rel.entry.subEpisodes || rel.entry.episodes || '?'} sub
                                </span>
                                {rel.entry.dubEpisodes && rel.entry.dubEpisodes > 0 ? (
                                    <>
                                        <div className="w-1 h-1 rounded-full bg-white/10" />
                                        <span className="text-[9px] font-black text-white/30">
                                            {rel.entry.dubEpisodes} dub
                                        </span>
                                    </>
                                ) : null}
                                <div className="w-1 h-1 rounded-full bg-white/10" />
                                <span className="text-[9px] font-bold text-white/20 truncate">
                                    {rel.entry.status?.replace('Airing', '').trim() || 'finished'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center pr-1">
                            <ChevronRight size={14} className="text-white/10 group-hover:text-primary transition-all translate-x-0 group-hover:translate-x-1" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Relations;
