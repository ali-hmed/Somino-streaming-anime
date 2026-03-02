"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, User, Filter, Grid, Menu, X, ChevronRight, Shuffle, Users } from 'lucide-react';
import { searchAnime } from '@/lib/consumet';
import { getTitle } from '@/types/anime';

const Navbar = () => {
    const [query, setQuery] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isGenresOpen, setIsGenresOpen] = useState(false);
    const [isMobileGenresOpen, setIsMobileGenresOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const router = useRouter();

    const genres = [
        "Action", "Adventure", "Avant Garde", "Comedy", "Detective", "Drama", "Ecchi",
        "Fantasy", "Strategy Game", "Harem", "Hentai", "Historical", "Horror", "Josei", "Kids",
        "Magic", "Martial Arts", "Mecha", "Military", "Music", "Mystery", "Mythology",
        "Parody", "Psychological", "Racing", "Romance", "Samurai", "School", "Sci-Fi", "Seinen",
        "Shoujo", "Girls Love", "Shounen", "Boys Love", "Slice of Life", "Space", "Sports",
        "Super Power", "Supernatural", "Suspense", "Vampire",
    ];

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 80);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsSearchOpen(false);
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.trim().length < 2) {
                setSuggestions([]);
                return;
            }
            setIsSearching(true);
            try {
                const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'https://somino-backend.vercel.app') + '/api/v1';
                const res = await fetch(`${BASE_URL}/search?keyword=${encodeURIComponent(query.trim())}&page=1`);
                if (!res.ok) throw new Error('API Error');
                const json = await res.json();

                const mapped = (json.data?.response || []).slice(0, 5).map((item: any) => ({
                    id: item.id?.toString(),
                    title: {
                        english: item.title,
                        romaji: item.alternativeTitle || item.title,
                        native: item.japanese || ''
                    },
                    image: item.poster,
                    type: item.type,
                    episodeNumber: item.episodes?.eps || 0,
                    episodes: item.episodes?.eps || 0,
                    subEpisodes: item.episodes?.sub || 0,
                    dubEpisodes: item.episodes?.dub || 0,
                }));

                setSuggestions(mapped);
            } catch (e) {
                console.error(e);
            } finally {
                setIsSearching(false);
            }
        };

        const debounceTimer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounceTimer);
    }, [query]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            setIsSearchOpen(false);
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    const navLinks = [
        { label: 'Genre', hasDropdown: true, href: '#' },
        { label: 'Movies', hasDropdown: false, href: '/animes/movie' },
        { label: 'Popular', hasDropdown: false, href: '/animes/most-popular' },
        { label: 'Sub Anime', hasDropdown: false, href: '/animes/subbed-anime' },
        { label: 'Dub Anime', hasDropdown: false, href: '/animes/dubbed-anime' },
        { label: 'Top Airing', hasDropdown: false, href: '/animes/top-airing' },
        { label: 'Completed', hasDropdown: false, href: '/animes/completed' },
        { label: 'Recently Added', hasDropdown: false, href: '/animes/recently-added' },
        { label: 'Upcoming', hasDropdown: false, href: '/animes/top-upcoming' },
        // { label: 'A-Z List', hasDropdown: false, href: '/animes/az-list/a' },
    ];

    return (
        <>
            <nav className={`absolute top-0 w-full z-[100] border-none shadow-none outline-none py-6 bg-gradient-to-b from-black/60 via-black/20 to-transparent`}>
                <div className="container mx-auto px-4 md:px-8 h-full flex items-center justify-between">
                    {/* Left Section: Menu (Mobile) + Logo */}
                    <div className="flex items-center gap-2 md:gap-4 h-full">
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-white/90 hover:text-white transition-colors"
                        >
                            <Menu size={24} strokeWidth={2.5} />
                        </button>

                        <Link href="/" className="flex items-center group shrink-0">
                            <img
                                src="/Somino-lg.png"
                                alt="Somino Logo"
                                className="h-6 md:h-8 w-auto object-contain"
                            />
                        </Link>
                    </div>

                    {/* Center: Navigation Links (Desktop) */}
                    <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2 inset-y-0">
                        {navLinks.map((item) => (
                            <div
                                key={item.label}
                                className="relative flex items-center group/nav"
                                onMouseEnter={() => item.hasDropdown && setIsGenresOpen(true)}
                                onMouseLeave={() => item.hasDropdown && setIsGenresOpen(false)}
                            >
                                <Link
                                    href={item.href}
                                    className="text-[14px] font-medium text-white/70 hover:text-white transition-colors py-2 flex items-center gap-1"
                                >
                                    {item.label}
                                    {item.hasDropdown && (
                                        <ChevronRight
                                            size={14}
                                            className={`transition-transform duration-300 ${isGenresOpen ? 'rotate-90' : ''} opacity-40`}
                                        />
                                    )}
                                </Link>

                                {/* Desktop Dropdown (Genre) */}
                                {item.hasDropdown && isGenresOpen && (
                                    <div className="absolute top-full left-0 pt-3 animate-in fade-in slide-in-from-top-2 duration-300 z-50">
                                        <div className="bg-[#1a1c22]/98 border border-white/5 rounded-[1.2rem] shadow-2xl p-5 w-[450px] backdrop-blur-3xl">
                                            <div className="grid grid-cols-4 gap-x-4 gap-y-2">
                                                {genres.map((g) => (
                                                    <Link
                                                        key={g}
                                                        href={`/genre/${g.toLowerCase().replace(/ /g, '-')}`}
                                                        onClick={() => setIsGenresOpen(false)}
                                                        className="text-[10px] font-medium text-white/40 hover:text-white transition-colors whitespace-nowrap"
                                                    >
                                                        {g}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 sm:gap-5">
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="p-2 text-white/80 hover:text-white transition-colors"
                        >
                            <Search size={22} strokeWidth={2.5} />
                        </button>

                        {/* Notification Icon (Style Match) */}
                        <button className="p-2 text-white/80 hover:text-white transition-colors">
                            <Bell size={22} strokeWidth={2} />
                        </button>

                        <button className="flex items-center group">
                            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white/50 group-hover:bg-primary/20 group-hover:text-primary group-hover:border-primary/40 transition-all">
                                <User size={18} />
                            </div>
                            <span className="hidden sm:inline-block ml-2 text-[14px] font-medium text-white/70 group-hover:text-white transition-colors">
                                Sign in
                            </span>
                        </button>
                    </div>
                </div>

                {/* Floating Search Overlay */}
                {isSearchOpen && (
                    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] px-4 animate-in fade-in duration-300">
                        <div
                            className="absolute inset-0 bg-black/40 backdrop-blur-md"
                            onClick={() => setIsSearchOpen(false)}
                        />
                        <div className="relative w-full max-w-xl animate-in zoom-in-95 slide-in-from-top-4 duration-300">
                            <form
                                onSubmit={handleSearch}
                                className="group relative bg-[#131314] rounded-2xl shadow-2xl overflow-hidden"
                            >
                                <div className="flex items-center h-14 px-5">
                                    <Search className="text-white/40 group-focus-within:text-primary transition-colors duration-300" size={18} strokeWidth={2.5} />
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Search movies"
                                        className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-[15px] font-medium text-white placeholder-white/20 ml-3.5"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                    />
                                    <div className="flex items-center gap-1.5 ml-4">
                                        <button
                                            type="button"
                                            onClick={() => { setIsSearchOpen(false); router.push('/filter'); }}
                                            className="flex items-center gap-2 group/filter transition-colors py-1.5"
                                        >
                                            <Filter size={18} className="text-white/80 group-hover/filter:text-primary transition-colors" />
                                            <span className="text-[13px] font-bold text-white/80 group-hover/filter:text-primary transition-colors">Filter</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setIsSearchOpen(false); setQuery(''); }}
                                            className="ml-2 p-1 text-white/10 hover:text-white transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Autocomplete Dropdown */}
                                {(query.trim().length >= 2) && (
                                    <div className="bg-[#131314] max-h-[400px] overflow-y-auto custom-scrollbar border-t border-white/5">
                                        {isSearching ? (
                                            <div className="p-4 text-center text-white/40 text-[12px] font-medium tracking-wide">Searching...</div>
                                        ) : suggestions.length > 0 ? (
                                            <div className="flex flex-col">
                                                {suggestions.map((anime: any) => (
                                                    <Link
                                                        key={anime.id}
                                                        href={`/watch/${anime.id}`}
                                                        onClick={() => { setIsSearchOpen(false); setQuery(''); }}
                                                        className="flex items-center gap-3 p-3 hover:bg-white/[0.03] transition-colors border-b border-white/[0.02] last:border-0"
                                                    >
                                                        <div className="w-10 h-12 flex-shrink-0 rounded-[4px] overflow-hidden bg-white/5">
                                                            {anime.image && (
                                                                <img
                                                                    src={anime.image}
                                                                    alt={getTitle(anime.title)}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <h4 className="text-[13px] font-bold text-white/90 line-clamp-1">
                                                                {getTitle(anime.title)}
                                                            </h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {anime.type && <span className="text-[9px] text-white/40 font-black tracking-wider">{anime.type}</span>}
                                                                {(anime.episodeNumber > 0 || anime.episodes > 0) && (
                                                                    <>
                                                                        <span className="text-[10px] text-white/20">•</span>
                                                                        <span className="text-[9px] text-white/50 font-black">sub {anime.subEpisodes || anime.episodeNumber || anime.episodes}</span>
                                                                    </>
                                                                )}
                                                                {anime.dubEpisodes > 0 && (
                                                                    <>
                                                                        <span className="text-[10px] text-white/20">•</span>
                                                                        <span className="text-[9px] text-white/50 font-black">dub {anime.dubEpisodes}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-4 text-center text-white/40 text-[12px] font-medium tracking-wide">No results found for "{query}"</div>
                                        )}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                )}
            </nav>

            {/* Mobile Floating Dropdown Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <div className="lg:hidden absolute inset-0 z-[110]">
                        <div
                            className="absolute inset-0 bg-transparent"
                            onClick={() => setIsMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                                width: isMobileGenresOpen ? '280px' : '165px'
                            }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute top-16 left-4 bg-[#1a1c22]/95 backdrop-blur-xl border border-white/[0.05] rounded-[0.3rem] shadow-2xl overflow-hidden py-4 z-[120]"
                        >
                            <div className="flex flex-col">
                                {navLinks.map((item) => (
                                    <div key={item.label} className="relative group/item">
                                        {item.label === 'Genre' ? (
                                            <div className="flex flex-col">
                                                <button
                                                    onClick={() => setIsMobileGenresOpen(!isMobileGenresOpen)}
                                                    className="flex items-center gap-3 px-5 py-2.5 transition-all text-white/70 hover:text-white w-full text-left"
                                                >
                                                    <div className="w-1.5 h-1.5 rotate-45 bg-primary group-hover/item:bg-white transition-colors flex-shrink-0" />
                                                    <span className="text-[14px] font-semibold tracking-wide flex-1">
                                                        {item.label}
                                                    </span>
                                                    <ChevronRight size={14} className={`transition-transform duration-300 ${isMobileGenresOpen ? 'rotate-90' : ''} opacity-20`} />
                                                </button>
                                                <AnimatePresence>
                                                    {isMobileGenresOpen && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden bg-black/20 mx-2 mb-2 rounded-2xl"
                                                        >
                                                            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 p-2">
                                                                {genres.map((g) => (
                                                                    <Link
                                                                        key={g}
                                                                        href={`/genre/${g.toLowerCase().replace(/ /g, '-')}`}
                                                                        onClick={() => {
                                                                            setIsMenuOpen(false);
                                                                            setIsMobileGenresOpen(false);
                                                                        }}
                                                                        className="text-[11px] font-medium text-white/40 hover:text-white transition-colors py-1 px-2 rounded-lg hover:bg-white/5"
                                                                    >
                                                                        {g}
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ) : (
                                            <Link
                                                href={item.href}
                                                onClick={() => setIsMenuOpen(false)}
                                                className="flex items-center gap-3 px-5 py-2.5 transition-all text-white/70 hover:text-white"
                                            >
                                                <div className="w-1.5 h-1.5 rotate-45 bg-primary group-hover/item:bg-white transition-colors flex-shrink-0" />
                                                <span className="text-[14px] font-medium tracking-wide">
                                                    {item.label}
                                                </span>
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
