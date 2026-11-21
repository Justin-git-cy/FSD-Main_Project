import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Compass,
  Settings,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  fetchRecommendations,
  getPreferences,
  getWeather,
  upvoteLocation,
} from '../utils/storage';
import { useReveal } from '../engine';
import StarRating from '../components/StarRating';
import './Recommendations.css';

export default function Recommendations() {
  const pageRef = useRef(null);
  const [rankedList, setRankedList] = useState([]);
  const [prefs, setPrefs] = useState(getPreferences());
  const [climate, setClimate] = useState(getWeather());
  const [loading, setLoading] = useState(true);

  useReveal(pageRef, [rankedList.length]);

  const loadRankings = useCallback(async () => {
    const activePrefs = getPreferences();
    const activeWeather = getWeather();
    setPrefs(activePrefs);
    setClimate(activeWeather);

    const ranked = await fetchRecommendations(activePrefs, activeWeather);
    setRankedList(ranked);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRankings();
    window.addEventListener('storage', loadRankings);
    window.addEventListener('locationsUpdated', loadRankings);
    window.addEventListener('weatherChanged', loadRankings);
    window.addEventListener('preferencesChanged', loadRankings);

    return () => {
      window.removeEventListener('storage', loadRankings);
      window.removeEventListener('locationsUpdated', loadRankings);
      window.removeEventListener('weatherChanged', loadRankings);
      window.removeEventListener('preferencesChanged', loadRankings);
    };
  }, [loadRankings]);

  const handleUpvote = async (id) => {
    await upvoteLocation(id);
    loadRankings();
  };

  const radius = 36;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="vp-page" ref={pageRef}>
      <section className="vp-page-hero">
        <svg className="vp-page-hero-contours" viewBox="0 0 600 400" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((ring) => (
            <ellipse
              key={ring}
              cx="420"
              cy="190"
              rx={75 + ring * 48}
              ry={48 + ring * 30}
              transform="rotate(-28 420 190)"
              fill="none"
              stroke="rgba(194, 214, 123, 0.25)"
              strokeWidth="1"
            />
          ))}
        </svg>
        <div className="vp-container">
          <div className="vp-page-hero-inner">
            <div className="vp-page-hero-copy">
              <span className="vp-eyebrow"><span className="vp-eyebrow-dot" /> Scoring Engine</span>
              <h1>Season-Matched Routes</h1>
              <p className="vp-page-hero-lead">
                Live recommendations scored from MongoDB by proximity to your GPS coordinates, preferred difficulty, category affinity, and active weather conditions.
              </p>
            </div>
            <div className="vp-page-hero-actions">
              <Link to="/preferences" className="vp-btn-primary">
                <Sliders size={15} aria-hidden="true" />
                <span>Modify Interests</span>
              </Link>
              <Link to="/settings" className="vp-btn-outline-light">
                <Settings size={15} aria-hidden="true" />
                <span>Configure GPS</span>
              </Link>
            </div>
          </div>

          <div className="vp-telemetry-strip">
            <div className="vp-telemetry-item">
              <span>Active Climate</span>
              <strong style={{ textTransform: 'capitalize' }}>
                {climate.season} · {climate.weather}
              </strong>
            </div>
            <div className="vp-telemetry-item">
              <span>Preferred Difficulty</span>
              <strong style={{ textTransform: 'capitalize' }}>{prefs.preferredDifficulty}</strong>
            </div>
            <div className="vp-telemetry-item">
              <span>Search Radius</span>
              <strong>{prefs.searchRadius} km</strong>
            </div>
            <div className="vp-telemetry-item">
              <span>Active GPS Anchor</span>
              <strong>
                {prefs.currentLocation.lat.toFixed(2)}° N, {prefs.currentLocation.lng.toFixed(2)}° E
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="vp-section">
        <div className="vp-container">
          {loading ? (
            <div className="vp-empty-state">
              <Compass size={28} />
              <p>Calculating seasonal safety and proximity scores...</p>
            </div>
          ) : rankedList.length === 0 ? (
            <div className="vp-empty-state">
              <Compass size={32} />
              <h2>No verified spots to rank yet</h2>
              <p>Verify or add locations in the atlas to see seasonal match rankings.</p>
            </div>
          ) : (
            <div className="vp-rec-list">
              {rankedList.map((loc) => {
                const isDanger = loc.score < 45 && loc.warning;
                const scoreTier = loc.score >= 75 ? 'is-high' : loc.score >= 48 ? 'is-mid' : 'is-low';
                const dashOffset = circumference - (loc.score / 100) * circumference;

                const bars = [
                  { label: 'Proximity', val: loc.breakdown?.proximity ?? 0, max: 30 },
                  { label: 'Difficulty', val: loc.breakdown?.difficulty ?? 0, max: 25 },
                  { label: 'Category', val: loc.breakdown?.category ?? 0, max: 20 },
                  { label: 'Season', val: loc.breakdown?.season ?? 0, max: 25 },
                ];

                return (
                  <article
                    key={loc.id}
                    className={`vp-rec-card${isDanger ? ' is-danger' : ''}`}
                    data-reveal="up"
                  >
                    <div className="vp-score-ring-wrap" aria-label={`Match score ${loc.score} percent`}>
                      <svg width="84" height="84" viewBox="0 0 84 84" aria-hidden="true">
                        <circle className="vp-score-ring-bg" cx="42" cy="42" r={radius} />
                        <circle
                          className={`vp-score-ring-fg ${scoreTier}`}
                          cx="42"
                          cy="42"
                          r={radius}
                          strokeDasharray={circumference}
                          strokeDashoffset={dashOffset}
                        />
                      </svg>
                      <div className="vp-score-value">
                        <strong>{loc.score}</strong>
                        <span>match</span>
                      </div>
                    </div>

                    <Link to={`/location/${loc.id}`} className="vp-rec-thumb">
                      <img src={loc.images[0]} alt={loc.name} loading="lazy" />
                    </Link>

                    <div className="vp-rec-info">
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                        <span className="vp-badge vp-badge--category">{loc.categoryName}</span>
                        <span className="vp-badge vp-badge--verified">
                          <span className={`vp-diff-dot ${loc.difficulty}`} /> {loc.difficulty}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--vp-muted)' }}>
                          {loc.distance} km away
                        </span>
                        <StarRating rating={loc.rating} px={13} />
                      </div>

                      <h2>
                        <Link to={`/location/${loc.id}`}>{loc.name}</Link>
                      </h2>
                      <p className="vp-rec-desc">{loc.description}</p>

                      {loc.warning && (
                        <div
                          className={`vp-alert ${
                            loc.warning.includes('DANGEROUS') || loc.warning.includes('CRITICAL')
                              ? 'vp-alert--danger'
                              : 'vp-alert--warn'
                          }`}
                        >
                          {loc.warning.includes('DANGEROUS') || loc.warning.includes('CRITICAL')
                            ? <AlertCircle size={16} aria-hidden="true" />
                            : <AlertTriangle size={16} aria-hidden="true" />}
                          <span>
                            {loc.warning}
                            {loc.breakdown?.safetyPenalty < 0
                              ? ` (Safety adjustment: ${loc.breakdown.safetyPenalty} pts)`
                              : ''}
                          </span>
                        </div>
                      )}

                      <div className="vp-rec-breakdown">
                        {bars.map((bar) => (
                          <div className="vp-breakdown-bar" key={bar.label}>
                            <div>
                              <span>{bar.label}</span>
                              <span>+{bar.val}/{bar.max}</span>
                            </div>
                            <div className="vp-breakdown-track">
                              <div
                                className="vp-breakdown-fill"
                                style={{ width: `${Math.min(100, Math.round((bar.val / bar.max) * 100))}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="vp-rec-actions">
                      <Link to={`/location/${loc.id}`} className="vp-btn-dark">
                        <span>Field Dossier</span>
                        <ArrowUpRight size={14} className="vp-btn-arrow" aria-hidden="true" />
                      </Link>
                      <button
                        type="button"
                        className="vp-upvote-btn"
                        style={{ justifyContent: 'center' }}
                        onClick={() => handleUpvote(loc.id)}
                      >
                        <Sparkles size={13} aria-hidden="true" />
                        <span>{loc.upvotes} Upvotes</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
