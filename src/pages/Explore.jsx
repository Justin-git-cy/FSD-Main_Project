import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchLocations,
  getPreferences,
  getWeather,
  upvoteLocation,
  verifyLocation,
} from '../utils/storage';
import { calculateDistance } from '../utils/scoring';
import {
  ArrowUpRight,
  Award,
  CheckCircle,
  Compass,
  List,
  Map as MapIcon,
  RotateCcw,
  Search,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import StarRating from '../components/StarRating';
import './Explore.css';

export default function Explore() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const focusId = searchParams.get('focus');

  const [locations, setLocations] = useState([]);
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [climate, setClimate] = useState(getWeather());
  const [mobileView, setMobileView] = useState('map');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('upvotes');

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const prefs = useMemo(() => getPreferences(), []);

  const loadLocations = useCallback(() => {
    fetchLocations().then((data) => {
      setLocations(data);
    });
  }, []);

  useEffect(() => {
    loadLocations();
    const syncWeather = () => setClimate(getWeather());
    window.addEventListener('storage', loadLocations);
    window.addEventListener('locationsUpdated', loadLocations);
    window.addEventListener('weatherChanged', syncWeather);
    return () => {
      window.removeEventListener('storage', loadLocations);
      window.removeEventListener('locationsUpdated', loadLocations);
      window.removeEventListener('weatherChanged', syncWeather);
    };
  }, [loadLocations]);

  const filteredLocs = useMemo(() => {
    let result = locations.map((loc) => ({
      ...loc,
      distanceKm:
        Math.round(
          calculateDistance(
            prefs.currentLocation.lat,
            prefs.currentLocation.lng,
            loc.lat,
            loc.lng
          ) * 10
        ) / 10,
    }));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (loc) =>
          loc.name.toLowerCase().includes(q) ||
          loc.description.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter((loc) => loc.categoryId === categoryFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((loc) => loc.verificationStatus === statusFilter);
    }

    result.sort((a, b) => {
      if (sortBy === 'nearest') return a.distanceKm - b.distanceKm;
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.upvotes - a.upvotes;
    });

    return result;
  }, [locations, searchQuery, categoryFilter, statusFilter, sortBy, prefs]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || !window.L) return undefined;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markersRef.current = {};
    }

    const map = window.L.map(mapContainerRef.current).setView([12.9716, 77.5946], 10);
    mapInstanceRef.current = map;

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Refresh map size when toggling mobile view
  useEffect(() => {
    if (mobileView === 'map' && mapInstanceRef.current) {
      setTimeout(() => mapInstanceRef.current?.invalidateSize(), 100);
    }
  }, [mobileView]);

  // Update markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;

    Object.values(markersRef.current).forEach((marker) => map.removeLayer(marker));
    markersRef.current = {};

    filteredLocs.forEach((loc) => {
      let pinBg = '#c2d67b';
      if (loc.categoryId === 'cat_abandoned') pinBg = '#da805d';
      else if (loc.categoryId === 'cat_historic') pinBg = '#d8b25c';

      const isPending = loc.verificationStatus === 'pending';
      const isActive = selectedLoc?.id === loc.id;
      const borderStyle = isPending ? '2px dashed #131a16' : '2px solid #131a16';

      const iconHtml = `
        <div style="
          background-color: ${pinBg};
          width: ${isActive ? '26px' : '22px'};
          height: ${isActive ? '26px' : '22px'};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: ${borderStyle};
          box-shadow: 0 4px 10px rgba(0,0,0,0.4);
          margin-left: -11px;
          margin-top: -22px;
        "></div>
      `;

      const customIcon = window.L.divIcon({
        html: iconHtml,
        className: 'custom-pin-container',
        iconSize: [24, 24],
        iconAnchor: [12, 24],
      });

      const marker = window.L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map);
      markersRef.current[loc.id] = marker;

      marker.bindTooltip(
        `<div style="font-family: 'General Sans', sans-serif; font-weight: 700; font-size: 11px; padding: 2px 4px;">
          ${loc.name} · ★ ${Number(loc.rating || 4).toFixed(1)}
        </div>`,
        {
          permanent: false,
          direction: 'top',
          offset: [0, -20],
          className: 'custom-map-tooltip',
        }
      );

      marker.on('click', () => {
        setSelectedLoc(loc);
        setSearchParams({ focus: loc.id });
        setMobileView('map');
      });
    });
  }, [filteredLocs, selectedLoc, setSearchParams]);

  // Handle focus param (ObjectId, id, or slug fallback)
  useEffect(() => {
    if (focusId && locations.length > 0) {
      const cleanFocus = focusId.toLowerCase().replace(/^loc_/, '');
      const match =
        locations.find((l) => l.id === focusId || l._id === focusId) ||
        locations.find((l) => l.name.toLowerCase().includes(cleanFocus));
      if (match) {
        setSelectedLoc(match);
        const map = mapInstanceRef.current;
        if (map) {
          map.flyTo([match.lat, match.lng], 12, { duration: 1.1 });
        }
      }
    }
  }, [focusId, locations]);

  const handleUpvote = async (id) => {
    const updated = await upvoteLocation(id);
    loadLocations();
    if (updated && selectedLoc && selectedLoc.id === id) {
      setSelectedLoc(updated);
    }
  };

  const handleVerify = async (id) => {
    const updated = await verifyLocation(id);
    loadLocations();
    if (updated && selectedLoc && selectedLoc.id === id) {
      setSelectedLoc(updated);
    }
  };

  const handleResetView = () => {
    setSelectedLoc(null);
    setSearchParams({});
    mapInstanceRef.current?.flyTo([12.9716, 77.5946], 10, { duration: 0.9 });
  };

  const activeWarning = selectedLoc?.weatherWarnings?.[climate.weather] || null;

  return (
    <div className="vp-explore">
      <div className="vp-explore-mobile-tabs">
        <button
          type="button"
          className={`vp-chip${mobileView === 'list' ? ' is-active' : ''}`}
          onClick={() => setMobileView('list')}
        >
          <List size={15} aria-hidden="true" /> List ({filteredLocs.length})
        </button>
        <button
          type="button"
          className={`vp-chip${mobileView === 'map' ? ' is-active' : ''}`}
          onClick={() => setMobileView('map')}
        >
          <MapIcon size={15} aria-hidden="true" /> Interactive Map
        </button>
      </div>

      <aside className={`vp-explore-sidebar${mobileView === 'map' ? ' is-hidden-mobile' : ''}`}>
        <div className="vp-explore-head">
          <span className="vp-eyebrow"><span className="vp-eyebrow-dot" /> Survey Index</span>
          <h1>Field Atlas</h1>
          <p>Browse Bangalore trails, forts, and ruins or click any pin on the contour map.</p>
        </div>

        <div className="vp-explore-controls">
          <div className="vp-search-wrap">
            <Search size={15} aria-hidden="true" />
            <label htmlFor="explore-search" className="sr-only">Search Bangalore spots</label>
            <input
              id="explore-search"
              type="text"
              className="vp-input"
              placeholder="Search spots, forts, monoliths..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="vp-chip-row" role="group" aria-label="Filter by category">
            {[
              { id: 'all', label: 'All' },
              { id: 'cat_trekking', label: 'Trails' },
              { id: 'cat_historic', label: 'Historic' },
              { id: 'cat_abandoned', label: 'Ruins' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`vp-chip${categoryFilter === cat.id ? ' is-active' : ''}`}
                aria-pressed={categoryFilter === cat.id}
                onClick={() => setCategoryFilter(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="vp-explore-select-row">
            <div>
              <label htmlFor="explore-status" className="sr-only">Verification status</label>
              <select
                id="explore-status"
                className="vp-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="verified">Verified Only</option>
                <option value="pending">Pending Review</option>
              </select>
            </div>
            <div>
              <label htmlFor="explore-sort" className="sr-only">Sort locations</label>
              <select
                id="explore-sort"
                className="vp-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="upvotes">Most Upvoted</option>
                <option value="nearest">Nearest GPS</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        <div className="vp-explore-meta-bar">
          <span>{filteredLocs.length} Map Locations</span>
          <span>Sorted by {sortBy}</span>
        </div>

        <div className="vp-explore-list" data-lenis-prevent>
          {filteredLocs.length === 0 ? (
            <div className="vp-empty-state" style={{ padding: 28 }}>
              <Compass size={26} />
              <p>No locations match your active search and filters.</p>
            </div>
          ) : (
            filteredLocs.map((loc) => (
              <button
                key={loc.id}
                type="button"
                onClick={() => {
                  setSelectedLoc(loc);
                  setSearchParams({ focus: loc.id });
                  setMobileView('map');
                }}
                className={`vp-explore-card${selectedLoc?.id === loc.id ? ' is-selected' : ''}`}
              >
                <div className="vp-explore-card-top">
                  <h2>{loc.name}</h2>
                  <span className="vp-badge vp-badge--category">
                    {loc.categoryId.replace('cat_', '')}
                  </span>
                </div>
                <p>{loc.description}</p>
                <div className="vp-explore-card-foot">
                  <StarRating rating={loc.rating} px={12} />
                  <span>{loc.distanceKm} km · {loc.upvotes} votes</span>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      <div className={`vp-explore-map-stage${mobileView === 'list' ? ' is-hidden-mobile' : ''}`}>
        <div className="vp-map-toolbar">
          <div className="vp-map-legend" aria-label="Map marker legend">
            <span className="vp-legend-item">
              <span className="vp-legend-dot" style={{ background: '#c2d67b' }} /> Trail
            </span>
            <span className="vp-legend-item">
              <span className="vp-legend-dot" style={{ background: '#d8b25c' }} /> Historic
            </span>
            <span className="vp-legend-item">
              <span className="vp-legend-dot" style={{ background: '#da805d' }} /> Ruins
            </span>
          </div>
          <button type="button" className="vp-map-reset-btn" onClick={handleResetView}>
            <RotateCcw size={13} aria-hidden="true" /> Reset Atlas
          </button>
        </div>

        <div ref={mapContainerRef} className="vp-explore-leaflet" data-lenis-prevent />

        {selectedLoc && (
          <div className="vp-map-overlay-card" role="region" aria-label={selectedLoc.name}>
            <button
              type="button"
              className="vp-overlay-close"
              onClick={() => {
                setSelectedLoc(null);
                setSearchParams({});
              }}
              aria-label="Close location details"
            >
              <X size={15} aria-hidden="true" />
            </button>

            <div className="vp-overlay-head">
              <img src={selectedLoc.images[0]} alt={selectedLoc.name} />
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <span className="vp-badge vp-badge--category">
                    {selectedLoc.categoryId.replace('cat_', '')}
                  </span>
                  <span
                    className={`vp-badge ${
                      selectedLoc.verificationStatus === 'verified'
                        ? 'vp-badge--verified'
                        : 'vp-badge--pending'
                    }`}
                  >
                    {selectedLoc.verificationStatus === 'verified'
                      ? <CheckCircle size={11} aria-hidden="true" />
                      : <ShieldAlert size={11} aria-hidden="true" />}
                    {selectedLoc.verificationStatus}
                  </span>
                </div>
                <h3>{selectedLoc.name}</h3>
                <StarRating rating={selectedLoc.rating} px={13} />
              </div>
            </div>

            <p className="vp-overlay-desc">{selectedLoc.description}</p>

            {activeWarning && (
              <div className="vp-alert vp-alert--warn" style={{ padding: '8px 11px', fontSize: 12 }}>
                <span><strong>{climate.weather} note:</strong> {activeWarning}</span>
              </div>
            )}

            <div className="vp-overlay-actions">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="vp-upvote-btn"
                  onClick={() => handleUpvote(selectedLoc.id)}
                >
                  <Sparkles size={13} aria-hidden="true" />
                  <span>{selectedLoc.upvotes} Upvotes</span>
                </button>
                {selectedLoc.verificationStatus === 'pending' && user?.role === 'Pathfinder' && (
                  <button
                    type="button"
                    className="vp-btn-dark"
                    style={{ minHeight: 36, padding: '5px 11px', fontSize: 12 }}
                    onClick={() => handleVerify(selectedLoc.id)}
                  >
                    <Award size={14} aria-hidden="true" />
                    <span>Verify</span>
                  </button>
                )}
              </div>

              <Link
                to={`/location/${selectedLoc.id}`}
                className="vp-btn-dark"
                style={{ minHeight: 38, padding: '7px 13px', fontSize: 12 }}
              >
                <span>Open full dossier</span>
                <ArrowUpRight size={14} className="vp-btn-arrow" aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
