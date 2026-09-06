import React, { useState, useEffect } from 'react';
import { getLocations, getPreferences, getWeather, upvoteLocation } from '../utils/storage';
import { rankLocations } from '../utils/scoring';
import { Sparkles, Sliders, Settings, ThumbsUp, AlertTriangle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import StarRating from '../components/StarRating';

export default function Recommendations() {
  const [rankedList, setRankedList] = useState([]);
  const [prefs, setPrefs] = useState(null);
  const [climate, setClimate] = useState(null);

  const loadRankings = () => {
    const activePrefs = getPreferences();
    const activeWeather = getWeather();
    const locations = getLocations().filter(l => l.verificationStatus === 'verified');

    setPrefs(activePrefs);
    setClimate(activeWeather);

    const ranked = rankLocations(locations, activePrefs, activeWeather);
    setRankedList(ranked);
  };

  useEffect(() => {
    loadRankings();

    const handleUpdates = () => {
      loadRankings();
    };

    window.addEventListener('weatherChanged', handleUpdates);
    window.addEventListener('preferencesChanged', handleUpdates);
    window.addEventListener('storage', handleUpdates);

    return () => {
      window.removeEventListener('weatherChanged', handleUpdates);
      window.removeEventListener('preferencesChanged', handleUpdates);
      window.removeEventListener('storage', handleUpdates);
    };
  }, []);

  const handleUpvote = (id) => {
    upvoteLocation(id);
    loadRankings();
  };

  if (!prefs || !climate) {
    return <div className="p-8 text-center text-xs text-slate-550 dark:text-slate-400">Syncing scoring metrics...</div>;
  }

  const getScoreColorClass = (score) => {
    if (score >= 80) return 'text-emerald-500 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-red-500 dark:text-red-400 border-red-500/30 bg-red-500/10';
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-adventure-500/10 rounded-2xl flex items-center justify-center text-adventure-500 dark:text-adventure-400">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Climate-Weighted Recommendations</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Calculated in real-time. Change weather in header or settings to recalculate.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/preferences"
              className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 transition-colors"
            >
              <Sliders className="h-4 w-4 text-adventure-500 dark:text-adventure-400" />
              <span>Modify Interests</span>
            </Link>
            <Link
              to="/settings"
              className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Configure GPS</span>
            </Link>
          </div>
        </div>

        {/* Active Configurations Summary Card */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 text-xs grid grid-cols-1 sm:grid-cols-2 gap-4 transition-colors">
          <div className="space-y-1">
            <span className="block text-[10px] uppercase font-extrabold text-slate-400">Active Profile Parameters</span>
            <div className="text-slate-700 dark:text-slate-300">
              Categories: <span className="font-bold text-slate-900 dark:text-white uppercase">{prefs.preferredCategories.map(c => c.split('_')[1]).join(', ')}</span>
              <br />
              Difficulty: <span className="font-bold text-slate-900 dark:text-white capitalize">{prefs.preferredDifficulty}</span>
              <br />
              Boundary: <span className="font-bold text-slate-900 dark:text-white">{prefs.searchRadius} km max</span>
            </div>
          </div>
          <div className="space-y-1 sm:border-l border-slate-100 dark:border-slate-800 sm:pl-4">
            <span className="block text-[10px] uppercase font-extrabold text-slate-400">Live Weather State</span>
            <div className="text-slate-700 dark:text-slate-300">
              Climate Season: <span className="font-bold text-slate-900 dark:text-white capitalize">{climate.season}</span>
              <br />
              Sky Condition: <span className="font-bold text-slate-900 dark:text-white capitalize">{climate.weather}</span>
              <br />
              Node Temp: <span className="font-bold text-slate-900 dark:text-white">{climate.temperature}</span>
            </div>
          </div>
        </div>

        {/* List of recommendations */}
        <div className="space-y-4">
          {rankedList.map((loc) => {
            const scoreClass = getScoreColorClass(loc.score);
            const isDanger = loc.score < 40 && loc.warning;

            return (
              <div
                key={loc.id}
                className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 shadow-sm dark:shadow-xl transition-all flex flex-col md:flex-row gap-5 items-start md:items-center ${
                  isDanger 
                    ? 'border-red-300 dark:border-red-950/70 bg-gradient-to-r from-red-50/50 to-white dark:from-slate-900 dark:to-red-950/10 text-slate-900 dark:text-white' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-750 text-slate-900 dark:text-white'
                }`}
              >
                {/* Score Progress Ring */}
                <div className={`h-16 w-16 rounded-full flex flex-col items-center justify-center border-2 font-mono flex-shrink-0 ${scoreClass}`}>
                  <span className="text-xl font-extrabold leading-none">{loc.score}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5 text-slate-400">match</span>
                </div>

                {/* Cover Image */}
                <img
                  src={loc.images[0]}
                  alt={loc.name}
                  className="h-20 w-24 rounded-2xl object-cover bg-slate-950 flex-shrink-0"
                />

                {/* Details Section */}
                <div className="flex-grow space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold text-base">{loc.name}</h3>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {loc.categoryId.split('_')[1]}
                    </span>
                    <span className="text-[9px] font-bold px-1 rounded bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 capitalize">
                      {loc.difficulty}
                    </span>
                    <StarRating rating={loc.rating} size={3.5} />
                  </div>

                  <p className="text-xs text-slate-550 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {loc.description}
                  </p>

                  {/* Weather Alert Warnings */}
                  {loc.warning && (
                    <div className={`flex items-center gap-2 p-2.5 rounded-xl text-[10px] leading-relaxed ${
                      loc.warning.includes('DANGEROUS') || loc.warning.includes('CRITICAL')
                        ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-500/25 text-red-700 dark:text-red-455 dark:text-red-400'
                        : 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/25 text-amber-700 dark:text-amber-455 dark:text-amber-400'
                    }`}>
                      {loc.warning.includes('DANGEROUS') || loc.warning.includes('CRITICAL')
                        ? <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
                        : <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-500" />}
                      <span>{loc.warning}</span>
                    </div>
                  )}

                  {/* Score Breakdown */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400 dark:text-slate-500 font-mono pt-1">
                    <span>Dist: <strong className="text-slate-600 dark:text-slate-300">{loc.distance} km</strong></span>
                    <span>•</span>
                    <span>Proximity: <strong className="text-slate-600 dark:text-slate-300">+{loc.breakdown.proximity}</strong></span>
                    <span>•</span>
                    <span>Difficulty: <strong className="text-slate-600 dark:text-slate-300">+{loc.breakdown.difficulty}</strong></span>
                    <span>•</span>
                    <span>Category: <strong className="text-slate-600 dark:text-slate-300">+{loc.breakdown.category}</strong></span>
                    <span>•</span>
                    <span>Season: <strong className="text-slate-600 dark:text-slate-300">+{loc.breakdown.season}</strong></span>
                    {loc.breakdown.safetyPenalty < 0 && (
                      <>
                        <span>•</span>
                        <span className="text-red-500 dark:text-red-400 font-bold">Penalty: <strong>{loc.breakdown.safetyPenalty}</strong></span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="w-full md:w-auto flex md:flex-col items-center justify-between gap-3 border-t border-slate-105 dark:border-slate-800 md:border-none pt-3 md:pt-0">
                  <Link
                    to={`/explore?focus=${loc.id}`}
                    className="bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition w-1/2 md:w-28 text-center"
                  >
                    View Map
                  </Link>
                  <button
                    onClick={() => handleUpvote(loc.id)}
                    className="flex items-center justify-center gap-1.5 hover:bg-adventure-500 hover:text-white border border-adventure-500/20 bg-adventure-500/5 text-adventure-650 dark:text-adventure-300 px-3 py-1.5 rounded-xl text-xs font-bold transition w-1/2 md:w-28 text-center"
                  >
                    <ThumbsUp className="h-3 w-3 text-orange-500" />
                    <span>{loc.upvotes} Votes</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
