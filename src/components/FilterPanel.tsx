"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SlidersHorizontal, RotateCcw, Check, ChevronDown } from 'lucide-react';

interface FilterOption { value: string; label: string; emoji?: string; }
interface Genre { id: string | number; name: string; }

interface FilterPanelProps {
    genres: Genre[];
    types: FilterOption[];
    statuses: FilterOption[];
    ratings: FilterOption[];
    seasons: FilterOption[];
    sortOptions: FilterOption[];
    scoreOptions: FilterOption[];
    currentParams: Record<string, string | undefined>;
}

const ALL = 'all';

const LANGUAGES = [
    { value: 'sub', label: 'Subbed' },
    { value: 'dub', label: 'Dubbed' },
    { value: 'sub_dub', label: 'Both' }
];

/* ────────────────────────────────────────────────────────────
   Custom Dropdown
──────────────────────────────────────────────────────────── */
function CustomDropdown({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (v: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const isActive = value !== ALL;
    const selectedLabel = options.find(o => o.value === value)?.label ?? 'All';

    return (
        <div ref={ref} className="relative">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(p => !p)}
                className={`flex items-center gap-2 px-4 py-2 rounded-[7px] border transition-all text-left min-w-[110px] ${open ? 'bg-[#1e1e22] border-primary/50'
                    : isActive
                        ? 'bg-[#1e1e22] border-primary/30'
                        : 'bg-[#1a1c22] border-white/[0.07] hover:border-white/20'
                    }`}
            >
                <span className="text-[10px] font-bold text-white/40 shrink-0">{label}</span>
                <span className={`text-[10px] font-black flex-1 truncate ${isActive ? 'text-primary' : 'text-white/30'}`}>
                    {isActive ? selectedLabel : 'All'}
                </span>
                <ChevronDown
                    size={11}
                    strokeWidth={2.5}
                    className={`shrink-0 transition-transform text-white/20 ${open ? 'rotate-180 text-primary/60' : ''}`}
                />
            </button>

            {/* Panel */}
            {open && (
                <div className="absolute top-[calc(100%+5px)] left-0 z-50 min-w-[140px] bg-[#161618] border border-white/[0.08] rounded-[7px] shadow-2xl shadow-black/60 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <button
                        type="button"
                        onClick={() => { onChange(ALL); setOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold transition-colors ${value === ALL ? 'bg-primary/10 text-primary'
                            : 'text-white/40 hover:bg-white/[0.04] hover:text-white'
                            }`}
                    >
                        All
                        {value === ALL && <Check size={9} strokeWidth={3} className="text-primary" />}
                    </button>

                    <div className="h-px bg-white/[0.05] mx-2" />

                    <div className="max-h-[180px] overflow-y-auto no-scrollbar py-0.5">
                        {options.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => { onChange(opt.value); setOpen(false); }}
                                className={`w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-semibold transition-colors ${value === opt.value ? 'bg-primary/10 text-primary'
                                    : 'text-white/50 hover:bg-white/[0.04] hover:text-white'
                                    }`}
                            >
                                <span>{opt.label}</span>
                                {value === opt.value && <Check size={9} strokeWidth={3} className="text-primary" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ────────────────────────────────────────────────────────────
   Main FilterPanel
──────────────────────────────────────────────────────────── */
export default function FilterPanel({ genres, types, statuses, ratings, seasons, sortOptions, scoreOptions, currentParams }: FilterPanelProps) {
    const router = useRouter();

    const [type, setType] = useState(currentParams.type || ALL);
    const [status, setStatus] = useState(currentParams.status || ALL);
    const [rating, setRating] = useState(currentParams.rated || ALL);
    const [sort, setSort] = useState(currentParams.sort || ALL);
    const [season, setSeason] = useState(currentParams.season || ALL);
    const [score, setScore] = useState(currentParams.score || ALL);
    const [language, setLanguage] = useState(currentParams.language || ALL);

    const initGenres = currentParams.genres ? currentParams.genres.split(',').filter(Boolean) : [];
    const [selectedGenres, setSelectedGenres] = useState<string[]>(initGenres);

    const toggleGenre = (id: string | number) => {
        const s = String(id);
        setSelectedGenres(prev => prev.includes(s) ? prev.filter(g => g !== s) : [...prev, s]);
    };

    const applyFilters = () => {
        const p = new URLSearchParams();
        if (type !== ALL) p.set('type', type);
        if (status !== ALL) p.set('status', status);
        if (rating !== ALL) p.set('rated', rating);
        if (sort !== ALL) p.set('sort', sort);
        if (score !== ALL) p.set('score', score);
        if (season !== ALL) p.set('season', season);
        if (language !== ALL) p.set('language', language);

        if (selectedGenres.length) p.set('genres', selectedGenres.join(','));
        router.push(`/filter?${p.toString()}`);
    };

    const clearAll = () => {
        setType(ALL); setStatus(ALL); setRating(ALL);
        setSort(ALL); setSeason(ALL); setScore(ALL);
        setSelectedGenres([]); setLanguage(ALL);
        router.push('/filter');
    };

    const hasAny = type !== ALL || status !== ALL || rating !== ALL || sort !== ALL || season !== ALL || score !== ALL || language !== ALL || selectedGenres.length > 0;

    return (
        <div className="bg-[#141519] border border-white/[0.04] rounded-[10px] p-6 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal size={13} className="text-primary" strokeWidth={2.5} />
                    <h2 className="text-[13px] font-black text-white tracking-tight">filter</h2>
                </div>
                {hasAny && (
                    <button onClick={clearAll} className="flex items-center gap-1 text-[9px] font-bold text-white/30 hover:text-primary transition-colors">
                        <RotateCcw size={9} strokeWidth={2.5} /> clear
                    </button>
                )}
            </div>

            {/* Dropdowns Row */}
            <div className="flex flex-wrap gap-2 mb-5">
                <CustomDropdown label="Type" value={type} options={types} onChange={setType} />
                <CustomDropdown label="Status" value={status} options={statuses} onChange={setStatus} />
                <CustomDropdown label="Rated" value={rating} options={ratings} onChange={setRating} />
                <CustomDropdown label="Score" value={score} options={scoreOptions} onChange={setScore} />
                <CustomDropdown label="Season" value={season} options={seasons} onChange={setSeason} />
                <CustomDropdown label="Language" value={language} options={LANGUAGES} onChange={setLanguage} />
                <CustomDropdown label="Sort" value={sort} options={sortOptions} onChange={setSort} />
            </div>

            {/* Divider */}
            <div className="border-t border-white/[0.04] mb-5" />

            {/* Genre */}
            <p className="text-[9px] font-black text-white/20 tracking-[0.15em] mb-3">
                Genre {selectedGenres.length > 0 && <span className="text-primary">({selectedGenres.length})</span>}
            </p>
            <div className="max-h-[135px] md:max-h-none overflow-y-auto md:overflow-visible pr-2 md:pr-0 custom-scrollbar">
                <div className="flex flex-wrap gap-1.5 mb-2">
                    {genres.map(g => {
                        const active = selectedGenres.includes(String(g.id));
                        return (
                            <button
                                key={g.id}
                                onClick={() => toggleGenre(g.id)}
                                className={`px-2.5 py-1 rounded-[5px] text-[10px] font-semibold transition-all border ${active ? 'bg-primary/15 border-primary/50 text-primary'
                                    : 'bg-white/[0.03] border-white/[0.06] text-white/40 hover:border-white/20 hover:text-white hover:bg-white/[0.05]'
                                    }`}
                            >
                                {g.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex items-center gap-3">
                <button
                    onClick={applyFilters}
                    className="px-6 py-2.5 bg-primary text-[#0b0c10] font-black text-[11px] rounded-[7px] hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/10"
                >
                    Filters
                </button>
                {hasAny && (
                    <button onClick={clearAll} className="text-[10px] font-bold text-white/20 hover:text-white/60 transition-colors">
                        Clear all
                    </button>
                )}
            </div>
        </div>
    );
}
