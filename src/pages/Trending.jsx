import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Award,
  Compass,
  Flame,
  Search,
  Sparkles,
  Star,
} from 'lucide-react';
import { fetchCategories, fetchLocations, upvoteLocation } from '../utils/storage';
import { useReveal } from '../engine';
import StarRating from '../components/StarRating';
import './Trending.css';

export default function Trending() {
  const pageRef = useRef(null);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('votes');

  useReveal(pageRef, [locations.length]);

  const loadData = useCallback(() => {
    fetchLocations().then((locs) => {
      setLocations(locs.filter((l) => l.verificationStatus === 'verified'));
    });
    fetchCategories().then((cats) => setCategories(cats));
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    window.addEventListener('locationsUpdated', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('locationsUpdated', loadData);
    };
  }, [loadData]);

  const handleUpvote = async (id, e) => {
    e?.preventDefault();
    await upvoteLocation(id);
    loadData();
  };

  const filtered = useMemo(() => {
    let list = locations;
    if (activeTab !== 'all') {
      list = list.filter((loc) => loc.categoryId === activeTab);
    }
    if (difficultyFilter !== 'all') {
      list = list.filter((loc) => loc.difficulty === difficultyFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (loc) =>
          loc.name.toLowerCase().includes(q) ||
          loc.description.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      return b.upvotes - a.upvotes;
    });
  }, [locations, activeTab, difficultyFilter, searchQuery, sortBy]);

  const podium = useMemo(() => {
    if (searchQuery.trim() || activeTab !== 'all' || difficultyFilter !== 'all' || sortBy !== 'votes') {
      return [];
    }
    return filtered.slice(0, 3);
  }, [filtered, searchQuery, activeTab, difficultyFilter, sortBy]);

  const gridItems = useMemo(() => {
    return podium.length ? filtered.slice(3) : filtered;
  }, [filtered, podium]);

  const totalVotes = useMemo(
    () => locations.reduce((acc, loc) => acc + (loc.upvotes || 0), 0),
    [locations]
  );

  const getCategoryIcon = (id) => {
    switch (id) {
      case 'cat_trekking':
        return <Compass size={14} aria-hidden="true" />;
      case 'cat_abandoned':
        return <Star size={14} aria-hidden="true" />;
      case 'cat_historic':
        return <Award size={14} aria-hidden="true" />;
      default:
        return <Flame size={14} aria-hidden="true" />;
    }
  };

  return (
    <div className="vp-page" ref={pageRef}>
      <section className="vp-page-hero">
        <svg className="vp-page-hero-contours" viewBox="0 0 600 400" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((ring) => (
            <ellipse
              key={ring}
              cx="360"
              cy="200"
              rx={80 + ring * 48}
              ry={52 + ring * 30}
              transform="rotate(-24 360 200)"
              fill="none"
              stroke="rgba(194, 214, 123, 0.25)"
              strokeWidth="1"
            />
          ))}
        </svg>
        <div className="vp-container">
          <div className="vp-page-hero-inner">
            <div className="vp-page-hero-copy">
              <span className="vp-eyebrow"><span className="vp-eyebrow-dot" /> Community Consensus</span>
              <h1>Trending Sights Registry</h1>
              <p className="vp-page-hero-lead">
                Verified trails, monolith ridges, and historic sites ranked by Bangalore explorer upvotes and field ratings.
              </p>
            </div>
            <div className="vp-page-hero-actions">
              <Link to="/explore" className="vp-btn-primary">
                <span>Open Atlas Map</span>
                <ArrowUpRight size={16} className="vp-btn-arrow" aria-hidden="true" />
              </Link>
              <Link to="/add-location" className="vp-btn-outline-light">Share a spot</Link>
            </div>
          </div>

          <div className="vp-telemetry-strip">
            <div className="vp-telemetry-item">
              <span>Verified Sights</span>
              <strong data-counter={locations.length}>{locations.length}</strong>
            </div>
            <div className="vp-telemetry-item">
              <span>Community Upvotes</span>
              <strong data-counter={totalVotes}>{totalVotes}</strong>
            </div>
            <div className="vp-telemetry-item">
              <span>Active Filter Count</span>
              <strong>{filtered.length}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="vp-section">
        <div className="vp-container">
          <div className="vp-trending-toolbar">
            <div className="vp-trending-filters">
              <div className="vp-chip-row" role="group" aria-label="Filter by terrain category">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`vp-chip${activeTab === 'all' ? ' is-active' : ''}`}
                  aria-pressed={activeTab === 'all'}
                >
                  <Flame size={14} aria-hidden="true" />
                  <span>All Categories</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveTab(cat.id)}
                    className={`vp-chip${activeTab === cat.id ? ' is-active' : ''}`}
                    aria-pressed={activeTab === cat.id}
                  >
                    {getCategoryIcon(cat.id)}
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>

              <div className="vp-trending-search-sort">
                <div className="vp-search-wrap">
                  <Search size={15} aria-hidden="true" />
                  <label htmlFor="trending-search" className="sr-only">Filter sights by keyword</label>
                  <input
                    id="trending-search"
                    type="text"
                    className="vp-input"
                    placeholder="Filter spots..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="trending-difficulty" className="sr-only">Difficulty</label>
                  <select
                    id="trending-difficulty"
                    className="vp-select"
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    style={{ minHeight: 40 }}
                  >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="trending-sort" className="sr-only">Sort registry</label>
                  <select
                    id="trending-sort"
                    className="vp-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{ minHeight: 40 }}
                  >
                    <option value="votes">Sort by Upvotes</option>
                    <option value="rating">Sort by Rating</option>
                    <option value="name">Sort by Name</option>
                    <option value="newest">Newest Mapped</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {podium.length > 0 && (
            <div aria-label="Top three community favorites">
              <div className="vp-section-head">
                <div>
                  <span className="vp-eyebrow vp-eyebrow--light">01 / Podium</span>
                  <h2 className="vp-section-title">Most Endorsed Routes</h2>
                </div>
              </div>
              <div className="vp-podium-grid">
                {podium.map((loc, idx) => (
                  <article className="vp-podium-card" key={loc.id} data-reveal="up">
                    <Link to={`/location/${loc.id}`} className="vp-podium-media">
                      <img src={loc.images[0]} alt={loc.name} loading={idx === 0 ? 'eager' : 'lazy'} />
                      <span className="vp-podium-rank">RANK 0{idx + 1}</span>
                    </Link>
                    <div className="vp-podium-body">
                      <div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                          <span className="vp-badge vp-badge--category">{loc.categoryName}</span>
                          <span className="vp-badge vp-badge--verified">
                            <span className={`vp-diff-dot ${loc.difficulty}`} /> {loc.difficulty}
                          </span>
                        </div>
                        <h3><Link to={`/location/${loc.id}`}>{loc.name}</Link></h3>
                        <StarRating rating={loc.rating} px={14} />
                        <p style={{ marginTop: 10 }}>{loc.description}</p>
                      </div>
                      <div className="vp-podium-foot">
                        <span style={{ fontSize: 12, color: 'var(--vp-muted)', fontWeight: 600 }}>
                          Best season: <strong style={{ color: 'var(--vp-ink)' }}>{loc.bestSeason}</strong>
                        </span>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            className="vp-upvote-btn"
                            onClick={(e) => handleUpvote(loc.id, e)}
                          >
                            <Sparkles size={13} aria-hidden="true" />
                            <span>{loc.upvotes}</span>
                          </button>
                          <Link
                            to={`/location/${loc.id}`}
                            className="vp-btn-dark"
                            style={{ minHeight: 36, padding: '6px 12px', fontSize: 12 }}
                          >
                            Dossier <ArrowUpRight size={13} className="vp-btn-arrow" aria-hidden="true" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="vp-empty-state">
              <Compass size={32} />
              <h2>No verified sights match your filters</h2>
              <p>Try clearing your search term or switching back to All Categories.</p>
            </div>
          ) : (
            <>
              <div className="vp-section-head">
                <div>
                  <span className="vp-eyebrow vp-eyebrow--light">
                    {podium.length > 0 ? '02 / Full Directory' : '01 / Filtered Directory'}
                  </span>
                  <h2 className="vp-section-title">All Verified Sights</h2>
                </div>
              </div>
              <div className="vp-registry-grid">
                {gridItems.map((loc) => (
                  <article className="vp-registry-card" key={loc.id}>
                    <Link to={`/location/${loc.id}`} className="vp-registry-media">
                      <img src={loc.images[0]} alt={loc.name} loading="lazy" />
                      <span className="vp-podium-rank">{loc.difficulty}</span>
                    </Link>
                    <div className="vp-registry-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <span className="vp-badge vp-badge--category">{loc.categoryName}</span>
                        <span style={{ fontSize: 11, color: 'var(--vp-muted)', fontWeight: 600 }}>{loc.bestSeason}</span>
                      </div>
                      <h3><Link to={`/location/${loc.id}`}>{loc.name}</Link></h3>
                      <StarRating rating={loc.rating} px={13} />
                      <p>{loc.description}</p>
                      <div className="vp-registry-foot">
                        <button
                          type="button"
                          className="vp-upvote-btn"
                          onClick={(e) => handleUpvote(loc.id, e)}
                        >
                          <Sparkles size={13} aria-hidden="true" />
                          <span>{loc.upvotes} Upvotes</span>
                        </button>
                        <Link to={`/location/${loc.id}`} className="vp-inline-link">
                          Read dossier <ArrowUpRight size={13} aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
