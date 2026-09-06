import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLocations, upvoteLocation, verifyLocation } from '../utils/storage';
import { Search, ShieldAlert, CheckCircle, ThumbsUp, Award, MapPin } from 'lucide-react';
import StarRating from '../components/StarRating';

export default function Explore() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const focusId = searchParams.get('focus');

  const [locations, setLocations] = useState([]);
  const [filteredLocs, setFilteredLocs] = useState([]);
  const [selectedLoc, setSelectedLoc] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // all, verified, pending

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  // 1. Load locations
  const loadLocations = () => {
    const data = getLocations();
    setLocations(data);
  };

  useEffect(() => {
    loadLocations();
    window.addEventListener('storage', loadLocations);
    return () => window.removeEventListener('storage', loadLocations);
  }, []);

  // 2. Filter locations
  useEffect(() => {
    let result = locations;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(loc => 
        loc.name.toLowerCase().includes(q) || 
        loc.description.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter(loc => loc.categoryId === categoryFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter(loc => loc.verificationStatus === statusFilter);
    }

    setFilteredLocs(result);
  }, [locations, searchQuery, categoryFilter, statusFilter]);

  // 3. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || !window.L) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markersRef.current = {};
    }

    const defaultCenter = [12.9716, 77.5946];
    const defaultZoom = 10;

    const map = window.L.map(mapContainerRef.current).setView(defaultCenter, defaultZoom);
    mapInstanceRef.current = map;

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 4. Update markers when filtered locations change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;

    // Clear old markers
    Object.values(markersRef.current).forEach(marker => map.removeLayer(marker));
    markersRef.current = {};

    // Add new markers
    filteredLocs.forEach(loc => {
      let markerColor = 'blue';
      if (loc.categoryId === 'cat_trekking') markerColor = 'green';
      else if (loc.categoryId === 'cat_abandoned') markerColor = 'red';
      else if (loc.categoryId === 'cat_historic') markerColor = 'gold';

      if (loc.verificationStatus === 'pending') {
        markerColor = 'violet';
      }

      const iconHtml = `
        <div style="
          background-color: ${
            markerColor === 'green' ? '#10b981' : 
            markerColor === 'red' ? '#ef4444' : 
            markerColor === 'gold' ? '#f59e0b' : '#8b5cf6'
          }; 
          width: 24px; 
          height: 24px; 
          border-radius: 50% 50% 50% 0; 
          transform: rotate(-45deg); 
          border: 2px solid white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          margin-left: -12px;
          margin-top: -24px;
        "></div>
      `;

      const customIcon = window.L.divIcon({
        html: iconHtml,
        className: 'custom-pin-container',
        iconSize: [24, 24],
        iconAnchor: [12, 24]
      });

      const marker = window.L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map);
      markersRef.current[loc.id] = marker;

      // Google Maps style Tooltip on hover
      marker.bindTooltip(
        `<div style="
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 800;
          font-size: 11px;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 2px 4px;
        ">
          <span>${loc.name}</span>
          <span style="color: #f59e0b;">★</span>
          <span>${loc.rating ? loc.rating.toFixed(1) : '4.0'}</span>
        </div>`,
        {
          permanent: false,
          direction: 'top',
          offset: [0, -20],
          className: 'custom-map-tooltip'
        }
      );

      marker.on('click', () => {
        setSelectedLoc(loc);
        setSearchParams({ focus: loc.id });
      });
    });
  }, [filteredLocs, setSearchParams]);

  // 5. Handle focus from search params
  useEffect(() => {
    if (focusId && locations.length > 0) {
      const match = locations.find(l => l.id === focusId);
      if (match) {
        setSelectedLoc(match);
        const map = mapInstanceRef.current;
        if (map) {
          map.flyTo([match.lat, match.lng], 13, { duration: 1.5 });
        }
      }
    }
  }, [focusId, locations]);

  const handleUpvote = (id) => {
    const updated = upvoteLocation(id);
    loadLocations();
    if (selectedLoc && selectedLoc.id === id) {
      setSelectedLoc(updated);
    }
  };

  const handleVerify = (id) => {
    const updated = verifyLocation(id);
    loadLocations();
    if (selectedLoc && selectedLoc.id === id) {
      setSelectedLoc(updated);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white min-h-screen font-sans flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Sidebar Controls & Location list */}
      <div className="w-full md:w-[400px] border-r border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900/40 p-4 space-y-4 flex flex-col h-[50vh] md:h-[80vh] overflow-y-auto transition-colors">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Bangalore spots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-adventure-500"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-bold">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg p-2 focus:outline-none focus:border-adventure-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="cat_trekking">Trekking</option>
              <option value="cat_abandoned">Abandoned</option>
              <option value="cat_historic">Historic</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-bold">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg p-2 focus:outline-none focus:border-adventure-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="verified">Verified Only</option>
              <option value="pending">Pending Vote</option>
            </select>
          </div>
        </div>

        {/* Count */}
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold block">
          Found {filteredLocs.length} Map Locations
        </span>

        {/* Location List */}
        <div className="space-y-3 flex-grow overflow-y-auto pr-1">
          {filteredLocs.map(loc => (
            <button
              key={loc.id}
              onClick={() => setSearchParams({ focus: loc.id })}
              className={`w-full text-left rounded-xl p-3 border transition-all ${
                selectedLoc?.id === loc.id
                  ? 'bg-adventure-500/10 border-adventure-500 shadow-md text-slate-900 dark:text-white'
                  : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <h4 className="font-bold text-xs line-clamp-1">{loc.name}</h4>
                <span className={`text-[8px] uppercase tracking-wider font-extrabold px-1 rounded ${
                  loc.categoryId === 'cat_trekking' ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-300/35' :
                  loc.categoryId === 'cat_abandoned' ? 'bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-300/35' :
                  'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-300/35'
                }`}>
                  {loc.categoryId.split('_')[1]}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">{loc.description}</p>
              
              <div className="flex justify-between items-center mt-3 border-t border-slate-100 dark:border-slate-850 pt-2 text-[10px]">
                <StarRating rating={loc.rating} size={3} />
                <span className="flex items-center gap-0.5 text-slate-400 font-semibold">
                  <ThumbsUp className="h-3 w-3 text-orange-400" />
                  <span>{loc.upvotes} votes</span>
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Map display & detail overlay */}
      <div className="flex-grow relative h-[50vh] md:h-[80vh] flex flex-col justify-end">
        {/* The Leaflet Container */}
        <div ref={mapContainerRef} className="absolute inset-0 z-0 bg-slate-900" />

        {/* Selected Details Overlay Card */}
        {selectedLoc && (
          <div className="z-10 m-4 max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl relative animate-fade-in space-y-4 text-slate-900 dark:text-white transition-colors">
            <button
              onClick={() => {
                setSelectedLoc(null);
                setSearchParams({});
              }}
              className="absolute right-4 top-4 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              Close
            </button>

            <div className="flex gap-4">
              <img
                src={selectedLoc.images[0]}
                alt={selectedLoc.name}
                className="h-20 w-20 rounded-2xl object-cover bg-slate-950"
              />
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-extrabold text-slate-600 dark:text-slate-300">
                  {selectedLoc.categoryId.split('_')[1]}
                </span>
                <h3 className="font-extrabold text-base">{selectedLoc.name}</h3>
                
                {/* Rating component integrated */}
                <StarRating rating={selectedLoc.rating} size={3.5} />
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-h-24 overflow-y-auto">{selectedLoc.description}</p>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-0.5 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                  selectedLoc.verificationStatus === 'verified'
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-55 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                }`}>
                  {selectedLoc.verificationStatus === 'verified' ? <CheckCircle className="h-2.5 w-2.5 mr-0.5 text-emerald-500" /> : <ShieldAlert className="h-2.5 w-2.5 mr-0.5 text-amber-500" />}
                  {selectedLoc.verificationStatus}
                </span>
                
                <button
                  onClick={() => handleUpvote(selectedLoc.id)}
                  className="flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-850 transition px-2.5 py-1 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-300"
                >
                  <ThumbsUp className="h-3.5 w-3.5 text-orange-400" />
                  <span className="text-[10px] font-bold">{selectedLoc.upvotes} Upvotes</span>
                </button>
              </div>

              {/* Pathfinder Verification Action */}
              {selectedLoc.verificationStatus === 'pending' && user?.role === 'Pathfinder' && (
                <button
                  onClick={() => handleVerify(selectedLoc.id)}
                  className="bg-emerald-600 hover:bg-emerald-500 transition text-white px-3.5 py-1 text-[10px] rounded-lg font-bold flex items-center gap-1 shadow"
                >
                  <Award className="h-3.5 w-3.5" />
                  <span>Verify Coordinate</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-pin-container {
          cursor: pointer;
        }
        .custom-map-tooltip {
          background-color: white !important;
          border: 1px solid #cbd5e1 !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important;
        }
        .leaflet-tooltip-top:before {
          border-top-color: white !important;
        }
      `}</style>
    </div>
  );
}
