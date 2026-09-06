import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLocations, upvoteLocation } from '../utils/storage';
import { ArrowRight, Compass, Shield, MapPin, Star, Flame } from 'lucide-react';
import StarRating from '../components/StarRating';

export default function Home() {
  const [trendingLocs, setTrendingLocs] = useState([]);

  const loadLocations = () => {
    const allLocations = getLocations().filter(l => l.verificationStatus === 'verified');
    // Sort by upvotes descending and take top 3
    const sorted = [...allLocations].sort((a, b) => b.upvotes - a.upvotes).slice(0, 3);
    setTrendingLocs(sorted);
  };

  useEffect(() => {
    loadLocations();
    window.addEventListener('storage', loadLocations);
    return () => window.removeEventListener('storage', loadLocations);
  }, []);

  const handleUpvote = (id, e) => {
    e.preventDefault(); // prevent navigation
    upvoteLocation(id);
    loadLocations();
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white min-h-screen font-sans transition-colors duration-300">
      
      {/* 1. Hero Section (Kept dark & dramatic for adventure theme branding) */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 py-20 px-4 sm:px-6 lg:px-8 text-center border-b border-slate-900 text-white">
        <div className="mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-adventure-500/10 px-3 py-1 text-xs font-bold text-adventure-400 uppercase tracking-widest mb-6 border border-adventure-500/25">
            <Flame className="h-3.5 w-3.5" />
            Unmapped Bangalore Outskirts
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Locate Hidden Treks, Abandoned Buildings, & Historic Ruins
          </h1>
          
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The ultimate companion website for adventure travelers. Real-time proximity, local difficulty matching, and weather-dependent safety ratings.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/explore"
              className="flex items-center gap-2 rounded-xl bg-adventure-500 hover:bg-adventure-400 transition-all px-6 py-3 font-bold text-white shadow-lg shadow-adventure-900/30"
            >
              <Compass className="h-5 w-5" />
              <span>Explore Interactive Map</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/add-location"
              className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition px-6 py-3 font-bold text-slate-200"
            >
              <span>Share a Discovery</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Trending Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="h-6 w-6 text-orange-500" />
              Trending Discoveries
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Highly rated by community adventurers this week.</p>
          </div>
          <Link to="/trending" className="text-sm font-bold text-adventure-650 dark:text-adventure-400 hover:opacity-80 flex items-center gap-1">
            <span>View All Trending</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trendingLocs.map((loc) => (
            <Link
              key={loc.id}
              to={`/explore?focus=${loc.id}`}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col hover:-translate-y-1 shadow-sm dark:shadow-md dark:shadow-black/40"
            >
              {/* Image Header */}
              <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-850">
                <img
                  src={loc.images[0]}
                  alt={loc.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded border border-slate-700/50 text-white">
                  {loc.categoryId === 'cat_trekking' ? 'Trekking' : loc.categoryId === 'cat_abandoned' ? 'Abandoned' : 'Historic'}
                </div>
                <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded border border-slate-700/50 flex items-center gap-1 capitalize text-white">
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    loc.difficulty === 'easy' ? 'bg-emerald-500' : loc.difficulty === 'medium' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                  {loc.difficulty}
                </div>
              </div>

              {/* Card Details */}
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-adventure-600 dark:group-hover:text-adventure-300 transition-colors">
                    {loc.name}
                  </h3>
                  
                  {/* Rating Stars added */}
                  <div className="mb-3">
                    <StarRating rating={loc.rating} size={3.5} />
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                    {loc.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                  <span className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    Outskirts
                  </span>
                  
                  <button
                    onClick={(e) => handleUpvote(loc.id, e)}
                    className="flex items-center gap-1 bg-adventure-500/10 hover:bg-adventure-500 hover:text-white border border-adventure-500/25 text-adventure-600 dark:text-adventure-300 transition px-3 py-1 rounded-lg text-xs font-bold"
                  >
                    <Flame className="h-3.5 w-3.5 text-orange-500" />
                    <span>{loc.upvotes} Upvotes</span>
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. About This Page */}
      <section className="bg-white dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-900 py-16 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">About ViewPoint Bangalore</h2>
            <p className="text-sm text-slate-550 dark:text-slate-400 mt-2 max-w-xl mx-auto">
              A collaborative registry built for adventure travel enthusiasts to locate, document, and safely explore off-beat terrains.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Core Idea */}
            <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 transition-colors">
              <div className="h-10 w-10 bg-adventure-500/10 rounded-lg flex items-center justify-center mb-4 text-adventure-500 dark:text-adventure-400">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">1. Locate & Share</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                We catalog treks, abandoned industrial sites, and historic monuments that do not appear on standard navigation apps. Found a new spot? Pin it and submit coordinates.
              </p>
            </div>

            {/* Verification Flow */}
            <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 transition-colors">
              <div className="h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4 text-emerald-550 dark:text-emerald-400">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">2. Community Verified</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                All coordinates submitted by users start as "Pending". Once the community visits and upvotes the location, it gains "Verified Status" to prevent trespass or hazard.
              </p>
            </div>

            {/* Dynamic Scoring */}
            <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 transition-colors">
              <div className="h-10 w-10 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4 text-amber-550 dark:text-amber-400">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">3. Seasonal Scoring Engine</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Rather than static recommendations, our custom code matches your geographical coordinates, category tastes, and difficulty index with live simulated weather values.
              </p>
            </div>
          </div>

          {/* Detailed Project Purpose Box */}
          <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-2xl p-8 mt-10 transition-colors">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-lg mb-4">How the Scoring Engine Computes Matches:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-none p-4 rounded-xl shadow-sm dark:shadow-none">
                <span className="block font-bold text-slate-900 dark:text-white text-sm mb-1">Proximity (30%)</span>
                Calculates absolute distance using the Haversine formula against your simulated coordinates. Closer spots score higher.
              </div>
              <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-none p-4 rounded-xl shadow-sm dark:shadow-none">
                <span className="block font-bold text-slate-900 dark:text-white text-sm mb-1">Difficulty (25%)</span>
                Matches your preference (Easy, Medium, Hard) against the terrain. Exact matches receive full points.
              </div>
              <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-none p-4 rounded-xl shadow-sm dark:shadow-none">
                <span className="block font-bold text-slate-900 dark:text-white text-sm mb-1">Category (20%)</span>
                Boosts scores for spots belonging to your chosen interest profiles (e.g. trekking vs historic).
              </div>
              <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-none p-4 rounded-xl shadow-sm dark:shadow-none">
                <span className="block font-bold text-slate-900 dark:text-white text-sm mb-1">Climate & Safety (25%)</span>
                Applies suitability ratios for the active season. Simulating heavy rains instantly applies negative penalties to dangerous hills.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
