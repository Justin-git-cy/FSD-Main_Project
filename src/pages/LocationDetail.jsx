import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Award,
  Check,
  CheckCircle,
  Compass,
  Copy,
  MapPin,
  MessageSquarePlus,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  fetchLocationById,
  fetchLocations,
  fetchReviewsForLocation,
  getPreferences,
  getWeather,
  submitReview,
  upvoteLocation,
  verifyLocation,
} from '../utils/storage';
import { calculateDistance, getActiveWeatherWarning } from '../utils/scoring';
import { useReveal } from '../engine';
import StarRating from '../components/StarRating';
import './LocationDetail.css';

export default function LocationDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const pageRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const [location, setLocation] = useState(null);
  const [allLocations, setAllLocations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [climate, setClimate] = useState(getWeather());
  const [prefs, setPrefs] = useState(() => getPreferences());

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState({ type: '', message: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useReveal(pageRef, [location?.id]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [locData, locsList] = await Promise.all([
      fetchLocationById(id),
      fetchLocations(),
    ]);
    setLocation(locData);
    setAllLocations(locsList);
    setActiveImage(0);

    if (locData) {
      const revs = await fetchReviewsForLocation(locData._id || locData.id);
      setReviews(revs);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
    const syncWeather = () => setClimate(getWeather());
    const syncPrefs = () => setPrefs(getPreferences());
    window.addEventListener('weatherChanged', syncWeather);
    window.addEventListener('preferencesChanged', syncPrefs);
    window.addEventListener('reviewsUpdated', loadData);
    return () => {
      window.removeEventListener('weatherChanged', syncWeather);
      window.removeEventListener('preferencesChanged', syncPrefs);
      window.removeEventListener('reviewsUpdated', loadData);
    };
  }, [loadData]);

  // Embedded Leaflet mini-map
  useEffect(() => {
    if (!location || !mapRef.current || !window.L) return undefined;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = window.L.map(mapRef.current, { scrollWheelZoom: false }).setView(
      [location.lat, location.lng],
      13
    );
    mapInstanceRef.current = map;

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const icon = window.L.divIcon({
      html: `<div style="width:20px;height:20px;border-radius:50%;background:#c2d67b;border:3px solid #131a16;box-shadow:0 2px 8px rgba(0,0,0,.45);"></div>`,
      className: 'vp-mini-pin',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
    window.L.marker([location.lat, location.lng], { icon }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [location]);

  const distanceKm = useMemo(() => {
    if (!location) return null;
    return Math.round(
      calculateDistance(
        prefs.currentLocation.lat,
        prefs.currentLocation.lng,
        location.lat,
        location.lng
      ) * 10
    ) / 10;
  }, [location, prefs]);

  const nearbySpots = useMemo(() => {
    if (!location || !allLocations.length) return [];
    return allLocations
      .filter((item) => item.id !== location.id && item.verificationStatus === 'verified')
      .map((item) => ({
        ...item,
        distanceKm:
          Math.round(calculateDistance(location.lat, location.lng, item.lat, item.lng) * 10) / 10,
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 3);
  }, [location, allLocations]);

  const activeWeatherWarning = useMemo(() => {
    return getActiveWeatherWarning(location, climate);
  }, [location, climate]);

  const handleUpvote = async () => {
    if (!location) return;
    const updated = await upvoteLocation(location.id);
    if (updated) setLocation(updated);
  };

  const handleVerify = async () => {
    if (!location) return;
    const updated = await verifyLocation(location.id);
    if (updated) setLocation(updated);
  };

  const handleCopyCoords = () => {
    if (!location) return;
    const text = `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user || !location) return;
    if (!reviewComment.trim()) {
      setReviewStatus({ type: 'danger', message: 'Please write a short trail observation before submitting.' });
      return;
    }

    setSubmittingReview(true);
    setReviewStatus({ type: '', message: '' });

    const res = await submitReview({
      location: location._id || location.id,
      user: user._id || user.id || user.username,
      rating: reviewRating,
      comment: reviewComment.trim(),
    });

    setSubmittingReview(false);
    if (res.success) {
      setReviewComment('');
      setReviewStatus({
        type: 'ok',
        message: 'Field note saved to MongoDB and community rating updated.',
      });
      await loadData();
    } else {
      setReviewStatus({ type: 'danger', message: res.message || 'Could not save review.' });
    }
  };

  if (loading) {
    return (
      <div className="vp-page">
        <div className="vp-dossier-hero">
          <div className="vp-container">
            <span className="vp-eyebrow"><span className="vp-eyebrow-dot" /> Loading Field Dossier</span>
            <h1>Surveying coordinates...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="vp-page">
        <section className="vp-section">
          <div className="vp-container">
            <div className="vp-empty-state">
              <Compass size={34} />
              <h1>Field Dossier Not Found</h1>
              <p>We could not locate this spot in the ViewPoint database. Return to the atlas to choose another route.</p>
              <Link to="/explore" className="vp-btn-dark">
                <ArrowLeft size={16} /> Back to Explore Map
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const suitability = [
    { label: 'Winter (Nov to Feb)', value: location.seasonalSuitability?.winter ?? 0.8 },
    { label: 'Summer (Mar to May)', value: location.seasonalSuitability?.summer ?? 0.5 },
    { label: 'Monsoon (Jun to Oct)', value: location.seasonalSuitability?.monsoon ?? 0.4 },
  ];

  return (
    <div className="vp-page" ref={pageRef}>
      <section className="vp-dossier-hero">
        <div className="vp-container">
          <nav className="vp-dossier-breadcrumb" aria-label="Breadcrumb">
            <Link to="/explore"><ArrowLeft size={14} aria-hidden="true" /> Field Atlas</Link>
            <span aria-hidden="true">/</span>
            <span>{location.categoryName}</span>
          </nav>

          <div className="vp-dossier-hero-grid">
            <div>
              <div className="vp-dossier-badges">
                <span className="vp-badge vp-badge--dark">{location.categoryName}</span>
                <span className={`vp-badge ${location.verificationStatus === 'verified' ? 'vp-badge--verified' : 'vp-badge--pending'}`} style={{ background: location.verificationStatus === 'verified' ? 'rgba(194, 214, 123, 0.16)' : 'rgba(218, 128, 93, 0.2)', color: location.verificationStatus === 'verified' ? '#c2d67b' : '#f4b59c', borderColor: 'transparent' }}>
                  {location.verificationStatus === 'verified' ? <CheckCircle size={12} /> : <ShieldAlert size={12} />}
                  {location.verificationStatus}
                </span>
                <span className="vp-badge vp-badge--dark">
                  <span className={`vp-diff-dot ${location.difficulty}`} /> {location.difficulty}
                </span>
              </div>

              <h1>{location.name}</h1>

              <StarRating rating={location.rating} px={16} dark />

              <div className="vp-dossier-meta">
                <span><MapPin size={15} aria-hidden="true" /> {distanceKm} km from active GPS</span>
                <span><Compass size={15} aria-hidden="true" /> Best season: {location.bestSeason}</span>
                <span>Mapped by @{location.createdByUsername}</span>
                <button type="button" className="vp-copy-coords" onClick={handleCopyCoords}>
                  {copiedCoords ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
                  {copiedCoords ? 'Copied GPS' : `${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° E`}
                </button>
              </div>

              <div className="vp-dossier-actions">
                <button type="button" className="vp-btn-primary" onClick={handleUpvote}>
                  <Sparkles size={16} aria-hidden="true" />
                  <span>Upvote ({location.upvotes})</span>
                </button>
                <Link to={`/explore?focus=${location.id}`} className="vp-btn-outline-light">
                  <span>View on Atlas Map</span>
                  <ArrowUpRight size={16} className="vp-btn-arrow" aria-hidden="true" />
                </Link>
                {location.verificationStatus === 'pending' && user?.role === 'Pathfinder' && (
                  <button type="button" className="vp-btn-outline-light" onClick={handleVerify}>
                    <Award size={16} aria-hidden="true" />
                    <span>Verify Spot</span>
                  </button>
                )}
              </div>
            </div>

            <div className="vp-dossier-gallery">
              <div className="vp-dossier-main-photo">
                <img
                  src={location.images[activeImage] || location.images[0]}
                  alt={`${location.name} view ${activeImage + 1}`}
                />
              </div>
              {location.images.length > 1 && (
                <div className="vp-dossier-thumbs" role="group" aria-label="Location photos">
                  {location.images.map((src, idx) => (
                    <button
                      key={src + idx}
                      type="button"
                      className={`vp-dossier-thumb${activeImage === idx ? ' is-active' : ''}`}
                      onClick={() => setActiveImage(idx)}
                      aria-label={`View photo ${idx + 1}`}
                      aria-pressed={activeImage === idx}
                    >
                      <img src={src} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="vp-section">
        <div className="vp-container vp-dossier-body-grid">
          <div>
            <span className="vp-eyebrow vp-eyebrow--light">
              <span className="vp-eyebrow-dot" /> 01 / Route Overview
            </span>
            <h2 className="vp-section-title">Field Notes &amp; Terrain</h2>
            <p className="vp-dossier-lead" style={{ marginTop: 14 }}>{location.description}</p>

            {activeWeatherWarning && (
              <div
                className={`vp-alert ${
                  activeWeatherWarning.includes('DANGEROUS') || activeWeatherWarning.includes('CRITICAL')
                    ? 'vp-alert--danger'
                    : 'vp-alert--warn'
                }`}
                role="status"
              >
                {activeWeatherWarning.includes('DANGEROUS') || activeWeatherWarning.includes('CRITICAL')
                  ? <AlertCircle size={18} aria-hidden="true" />
                  : <AlertTriangle size={18} aria-hidden="true" />}
                <div>
                  <strong>Active {climate.weather} advisory:</strong> {activeWeatherWarning}
                </div>
              </div>
            )}

            <div className="vp-panel" style={{ marginTop: 24 }} data-reveal="up">
              <span className="vp-eyebrow vp-eyebrow--light">02 / Seasonal Suitability</span>
              <div className="vp-season-grid">
                {suitability.map((row) => {
                  const pct = Math.round(Number(row.value) * 100);
                  return (
                    <div className="vp-season-row" key={row.label}>
                      <div className="vp-season-row-head">
                        <span>{row.label}</span>
                        <span>{pct}% fit</span>
                      </div>
                      <div className="vp-meter-track">
                        <div
                          className={`vp-meter-fill${pct >= 75 ? ' is-high' : pct <= 35 ? ' is-low' : ''}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="vp-reviews-block">
              <span className="vp-eyebrow vp-eyebrow--light">
                <span className="vp-eyebrow-dot" /> 03 / Explorer Logs ({reviews.length})
              </span>
              <h2 className="vp-section-title">Community Reviews</h2>

              {user ? (
                <form className="vp-panel vp-review-form" onSubmit={handleSubmitReview}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <span className="vp-label">Log your trail experience as @{user.username}</span>
                    <StarRating
                      rating={reviewRating}
                      px={18}
                      interactive
                      showValue={false}
                      onChange={setReviewRating}
                    />
                  </div>
                  <div className="vp-field">
                    <label htmlFor="review-comment" className="sr-only">Field observation</label>
                    <textarea
                      id="review-comment"
                      className="vp-textarea"
                      placeholder="Share trail condition, parking tips, water availability, or timing advice..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                    />
                  </div>
                  {reviewStatus.message && (
                    <div className={`vp-alert vp-alert--${reviewStatus.type === 'ok' ? 'ok' : 'danger'}`}>
                      <span>{reviewStatus.message}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="vp-btn-dark" disabled={submittingReview}>
                      <MessageSquarePlus size={16} aria-hidden="true" />
                      <span>{submittingReview ? 'Saving to MongoDB...' : 'Post Field Note'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="vp-panel" style={{ margin: '18px 0 24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 14, color: 'var(--vp-muted)' }}>
                    Sign in with your Explorer account to post a review or condition update.
                  </span>
                  <Link to="/login" className="vp-btn-dark">Sign in to review</Link>
                </div>
              )}

              {reviews.length === 0 ? (
                <div className="vp-empty-state">
                  <p>No explorer reviews logged for this coordinate yet. Be the first to add a condition report.</p>
                </div>
              ) : (
                <div className="vp-review-list">
                  {reviews.map((rev) => {
                    const author = rev.user || {};
                    return (
                      <article className="vp-review-card" key={rev._id || rev.id}>
                        <div className="vp-review-head">
                          <div className="vp-review-author">
                            <img
                              src={author.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${author.username || 'explorer'}`}
                              alt=""
                              width="34"
                              height="34"
                            />
                            <div>
                              <strong>{author.fullName || author.username || 'Explorer'}</strong>
                              <small>@{author.username || 'explorer'} · {author.role || 'Explorer'}</small>
                            </div>
                          </div>
                          <StarRating rating={rev.rating} px={13} />
                        </div>
                        <p className="vp-review-comment">{rev.comment}</p>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <aside style={{ display: 'grid', gap: 24 }}>
            <div className="vp-panel">
              <span className="vp-eyebrow vp-eyebrow--light">Sector Pin</span>
              <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 22, margin: '8px 0 12px' }}>Location Map</h3>
              <div ref={mapRef} className="vp-dossier-minimap" data-lenis-prevent />
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--vp-muted)' }}>
                <span>Lat {location.lat.toFixed(4)}</span>
                <span>Lng {location.lng.toFixed(4)}</span>
              </div>
            </div>

            {nearbySpots.length > 0 && (
              <div className="vp-panel">
                <span className="vp-eyebrow vp-eyebrow--light">Nearby Coordinates</span>
                <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 22, margin: '8px 0 4px' }}>Close to here</h3>
                <div className="vp-nearby-list">
                  {nearbySpots.map((spot) => (
                    <Link key={spot.id} to={`/location/${spot.id}`} className="vp-nearby-item">
                      <img src={spot.images[0]} alt="" loading="lazy" />
                      <div>
                        <h4>{spot.name}</h4>
                        <span>{spot.distanceKm} km away · {spot.difficulty}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}
