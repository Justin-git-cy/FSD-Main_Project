import React, { useState, useEffect } from 'react';
import { getLocations, getCategories, upvoteLocation } from '../utils/storage';
import { Flame, Compass, Star, Award, ThumbsUp, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import StarRating from '../components/StarRating';

export default function Trending() {
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('votes'); // votes, name

  const loadData = () => {
    setLocations(getLocations().filter(l => l.verificationStatus === 'verified'));
    setCategories(getCategories());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const handleUpvote = (id, e) => {
    e.preventDefault();
    upvoteLocation(id);
    loadData();
  };

  // Filter & Sort
  const getFilteredList = () => {
    let list = locations;
    
    if (activeTab !== 'all') {
      list = list.filter(loc => loc.categoryId === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(loc => 
        loc.name.toLowerCase().includes(q) || 
        loc.description.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => {
      if (sortBy === 'votes') {
        return b.upvotes - a.upvotes;
      } else {
        return a.name.localeCompare(b.name);
      }
    });
  };

  const filtered = getFilteredList();

  const getCategoryIcon = (id) => {
    switch (id) {
      case 'cat_trekking': return <Compass className="h-4 w-4" />;
      case 'cat_abandoned': return <Star className="h-4 w-4" />;
      case 'cat_historic': return <Award className="h-4 w-4" />;
      default: return <Flame className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-adventure-500/10 rounded-2xl flex items-center justify-center text-adventure-500 dark:text-adventure-400">
              <Flame className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-sans">Trending Sights Registry</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Explore unmapped paths around Bangalore categorized by safety and community consensus.</p>
            </div>
          </div>
          
          {/* Search bar & Sorting */}
          <div className="flex items-center gap-3">
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filter current view..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-adventure-500 transition-colors"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-adventure-500 cursor-pointer text-slate-700 dark:text-slate-300 transition-colors"
            >
              <option value="votes">Sort by Upvotes</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>

        {/* Categories Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-900 pb-3">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-adventure-500 text-white shadow-md shadow-adventure-900/20'
                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-850'
            }`}
          >
            <Flame className="h-4 w-4 text-orange-400" />
            <span>All Categories</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === cat.id
                  ? 'bg-adventure-500 text-white shadow-md shadow-adventure-900/20'
                  : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-850'
              }`}
            >
              {getCategoryIcon(cat.id)}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Display grid */}
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 p-12 text-center text-xs text-slate-400 dark:text-slate-500 rounded-3xl">
            No verified sights found matching criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((loc) => (
              <Link
                key={loc.id}
                to={`/explore?focus=${loc.id}`}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-slate-350 dark:hover:border-slate-750 shadow-sm dark:shadow-md dark:shadow-black/45 transition flex flex-col justify-between"
              >
                {/* Image */}
                <div className="relative h-44 bg-slate-100 dark:bg-slate-950">
                  <img
                    src={loc.images[0]}
                    alt={loc.name}
                    className="w-full h-full object-cover group-hover:scale-103 transition duration-500"
                  />
                  <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-sm text-[9px] font-bold px-2 py-0.5 rounded border border-slate-800 text-white uppercase tracking-wider">
                    {loc.difficulty}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-adventure-500 dark:group-hover:text-adventure-300 transition">
                      {loc.name}
                    </h3>
                    
                    {/* Rating stars integration */}
                    <div className="py-0.5">
                      <StarRating rating={loc.rating} size={3.5} />
                    </div>

                    <p className="text-xs text-slate-550 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {loc.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-850 text-[10px]">
                    <span className="text-slate-500 dark:text-slate-400">Best: <strong className="text-slate-700 dark:text-slate-300">{loc.bestSeason}</strong></span>
                    <button
                      onClick={(e) => handleUpvote(loc.id, e)}
                      className="flex items-center gap-1.5 bg-adventure-500/10 hover:bg-adventure-500 hover:text-white border border-adventure-500/25 text-adventure-600 dark:text-adventure-300 transition-all px-2.5 py-1 rounded-lg font-bold"
                    >
                      <ThumbsUp className="h-3 w-3 text-orange-500" />
                      <span>{loc.upvotes} Upvotes</span>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
