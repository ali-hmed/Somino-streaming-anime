import React from 'react';
import Link from 'next/link';
import { Play, ChevronRight, RotateCcw } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AnimeCard from '@/components/AnimeCard';
import TopTrending from '@/components/TopTrending';
import Schedule from '@/components/Schedule';
import HeroCarousel from '@/components/HeroCarousel';
import TrendingRow from '@/components/TrendingRow';
import ShareCard from '@/components/ShareCard';
import BottomSections from '@/components/BottomSections';
import { trendingAnime, Anime } from '@/data/anime';
import { fetchHomeData, fetchSchedule } from '@/lib/consumet';
import { getTitle } from '@/types/anime';



export default async function Home() {
  const homeData = await fetchHomeData();
  const scheduleData = await fetchSchedule();

  // If we have nothing from the API, use mock data
  const dataRef = homeData || {};
  const recentUpdates = dataRef.latestEpisode || [];
  const topAnime = dataRef.topAiring || [];
  const completedAnime = dataRef.latestCompleted || [];
  const heroList = (dataRef.spotlight?.length > 0) ? dataRef.spotlight : trendingAnime;
  const trendingData = dataRef.trending || [];

  console.log(`[API] Fetched Home Data from custom backend.`);

  return (
    <main className="min-h-screen pb-10 bg-background">
      <Navbar />

      {/* Hero Carousel */}
      <HeroCarousel animeList={heroList} />

      {/* Share Somino Card */}
      <div className="w-full max-w-[1550px] mx-auto px-4 mt-4">
        <ShareCard />
      </div>

      {/* Latest Updates Row — right below hero */}
      <div className="w-full max-w-[1550px] mx-auto px-4 mt-8">
        <TrendingRow animeList={trendingData.length > 0 ? trendingData.slice(0, 10) : trendingAnime} title="Trending" />
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-[1550px] mx-auto px-4 mt-6 md:mt-10">
        <div className="flex flex-col lg:flex-row gap-10 md:gap-12 lg:gap-8">

          {/* Left Column */}
          <div className="lg:w-3/4 space-y-12 md:space-y-16">

            {/* Continue Watching */}
            <section className="relative hidden md:block">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <RotateCcw className="text-primary" size={24} />
                  <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                    Continue Watching
                  </h2>
                </div>
                <Link href="#" className="flex items-center gap-1.5 text-xs font-bold text-muted hover:text-primary transition-colors tracking-widest">
                  view more <ChevronRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
                {(recentUpdates.length > 0 ? recentUpdates : trendingAnime).slice(0, 4).map((item: any, i: number) => (
                  <AnimeCard key={`cw-${item.id}-${i}`} anime={item} variant="continue" />
                ))}
              </div>
            </section>

            {/* Latest Episodes */}
            <section className="mt-16">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-black tracking-tighter text-white">
                    Latest Episodes
                  </h2>
                </div>
                <div className="flex items-center gap-6">
                  <Link href="/animes/recently-updated" className="flex items-center gap-1.5 text-[11px] font-black tracking-widest text-white/40 hover:text-white transition-colors">
                    view more <ChevronRight size={14} className="text-[#53CCB8]" />
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {(dataRef.latestEpisode?.length > 0 ? dataRef.latestEpisode : trendingAnime).slice(0, 12).map((item: any, i: number) => (
                  <AnimeCard key={`le-${item.id}-${i}`} anime={item} variant="portrait" isSharp={true} showEpisode={false} showScore={false} />
                ))}
              </div>
            </section>

            {/* Newly Added */}
            <section className="mt-16">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-black tracking-tighter text-white">
                    Newly Added
                  </h2>
                </div>
                <div className="flex items-center gap-6">
                  <Link href="/animes/recently-added" className="flex items-center gap-1.5 text-[11px] font-black tracking-widest text-white/40 hover:text-white transition-colors">
                    view more <ChevronRight size={14} className="text-[#53CCB8]" />
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {(dataRef.newAdded?.length > 0 ? dataRef.newAdded : trendingAnime).slice(0, 12).map((item: any, i: number) => (
                  <AnimeCard key={`na-${item.id}-${i}`} anime={item} variant="portrait" isSharp={true} showEpisode={false} showScore={false} />
                ))}
              </div>
            </section>

            {/* Top Upcoming */}
            <section className="mt-16">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-black tracking-tighter text-white">
                    Top Upcoming
                  </h2>
                </div>
                <div className="flex items-center gap-6">
                  <Link href="/animes/top-upcoming" className="flex items-center gap-1.5 text-[11px] font-black tracking-widest text-white/40 hover:text-white transition-colors">
                    view more <ChevronRight size={14} className="text-[#53CCB8]" />
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {(dataRef.topUpcoming?.length > 0 ? dataRef.topUpcoming : trendingAnime).slice(0, 12).map((item: any, i: number) => (
                  <AnimeCard key={`tu-${item.id}-${i}`} anime={item} variant="portrait" isSharp={true} showEpisode={false} showScore={false} />
                ))}
              </div>
            </section>

            {/* Tri-Column Bottom / Mobile Carousel */}
            <BottomSections
              topAiring={dataRef.topAiring?.length > 0 ? dataRef.topAiring : trendingAnime}
              mostPopular={dataRef.mostPopular?.length > 0 ? dataRef.mostPopular : trendingAnime}
              latestCompleted={dataRef.latestCompleted?.length > 0 ? dataRef.latestCompleted : trendingAnime.slice(3, 9)}
            />
          </div>

          {/* Right Column / Sidebar */}
          <div className="lg:w-1/4 space-y-10 md:space-y-12">
            <TopTrending trendingData={dataRef.top10 || {}} />
            <Schedule scheduleList={scheduleData} />

          </div>

        </div>
      </div>
    </main>
  );
}
