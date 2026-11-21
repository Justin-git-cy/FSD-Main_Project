import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Award,
  CheckCircle,
  Compass,
  Settings as SettingsIcon,
  Sliders,
  Star,
} from 'lucide-react';
import {
  fetchLocations,
  getPreferences,
  getWeather,
  savePreferences,
} from '../utils/storage';
import { rankLocations } from '../utils/scoring';
import './Calibration.css';

const CATEGORY_OPTIONS = [
  {
    id: 'cat_trekking',
    title: 'Trekking & Hills',
    desc: 'Granite monoliths, hill climbs, and morning ridge routes.',
    icon: Compass,
  },
  {
    id: 'cat_abandoned',
    title: 'Abandoned & Ruins',
    desc: 'Old clay factories, brick kilns, and quiet industrial remnants.',
    icon: Star,
  },
  {
    id: 'cat_historic',
    title: 'Historic Sights',
    desc: 'Chola temples, hilltop mud forts, and ancient stepwells.',
    icon: Award,
  },
];

export default function Preferences() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState({
    cat_trekking: true,
    cat_abandoned: true,
    cat_historic: true,
  });
  const [difficulty, setDifficulty] = useState('medium');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    const prefs = getPreferences();
    if (prefs) {
      setDifficulty(prefs.preferredDifficulty || 'medium');
      if (prefs.preferredCategories) {
        setCategories({
          cat_trekking: prefs.preferredCategories.includes('cat_trekking'),
          cat_abandoned: prefs.preferredCategories.includes('cat_abandoned'),
          cat_historic: prefs.preferredCategories.includes('cat_historic'),
        });
      }
    }
    fetchLocations().then((locs) =>
      setLocations(locs.filter((l) => l.verificationStatus === 'verified'))
    );
  }, []);

  const categoryCounts = useMemo(() => {
    const counts = { cat_trekking: 0, cat_abandoned: 0, cat_historic: 0 };
    locations.forEach((loc) => {
      if (counts[loc.categoryId] !== undefined) counts[loc.categoryId] += 1;
    });
    return counts;
  }, [locations]);

  const livePreviewMatches = useMemo(() => {
    if (!locations.length) return [];
    const activeCats = Object.keys(categories).filter((k) => categories[k]);
    const simulatedPrefs = {
      ...getPreferences(),
      preferredCategories: activeCats,
      preferredDifficulty: difficulty,
    };
    return rankLocations(locations, simulatedPrefs, getWeather()).slice(0, 3);
  }, [locations, categories, difficulty]);

  const handleCategoryToggle = (catId) => {
    setCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const preferredCategories = Object.keys(categories).filter((k) => categories[k]);
    if (preferredCategories.length === 0) {
      setStatusMsg('error:Select at least one terrain category.');
      return;
    }

    savePreferences({
      ...getPreferences(),
      preferredCategories,
      preferredDifficulty: difficulty,
    });
    setStatusMsg('ok:Interests saved. Opening calibrated recommendations...');
    setTimeout(() => navigate('/recommendations'), 900);
  };

  return (
    <div className="vp-page">
      <section className="vp-page-hero">
        <svg className="vp-page-hero-contours" viewBox="0 0 600 400" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((ring) => (
            <ellipse
              key={ring}
              cx="390"
              cy="190"
              rx={80 + ring * 50}
              ry={52 + ring * 30}
              transform="rotate(-24 390 190)"
              fill="none"
              stroke="rgba(194, 214, 123, 0.24)"
              strokeWidth="1"
            />
          ))}
        </svg>
        <div className="vp-container">
          <span className="vp-eyebrow"><span className="vp-eyebrow-dot" /> Calibration Desk</span>
          <h1>Trail Interests</h1>
          <p className="vp-page-hero-lead">
            Choose which terrain categories and difficulty levels fit your pace to calibrate ViewPoint’s recommendation score.
          </p>

          <nav className="vp-cal-tabs" aria-label="Calibration sections">
            <Link to="/settings" className="vp-cal-tab">
              <SettingsIcon size={15} aria-hidden="true" /> GPS &amp; Radius
            </Link>
            <Link to="/preferences" className="vp-cal-tab is-active" aria-current="page">
              <Sliders size={15} aria-hidden="true" /> Trail Interests
            </Link>
          </nav>
        </div>
      </section>

      <section className="vp-section">
        <div className="vp-container">
          {statusMsg && (
            <div
              className={`vp-alert ${statusMsg.startsWith('ok:') ? 'vp-alert--ok' : 'vp-alert--danger'}`}
              style={{ marginBottom: 22 }}
              role="status"
            >
              <CheckCircle size={17} aria-hidden="true" />
              <span>{statusMsg.replace(/^(ok|error):/, '')}</span>
            </div>
          )}

          <div className="vp-cal-grid">
            <form className="vp-panel" onSubmit={handleSave} style={{ display: 'grid', gap: 24 }}>
              <div style={{ display: 'grid', gap: 12 }}>
                <span className="vp-eyebrow vp-eyebrow--light">Preferred Terrain Categories</span>
                {CATEGORY_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = categories[opt.id];
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleCategoryToggle(opt.id)}
                      className={`vp-interest-card${active ? ' is-active' : ''}`}
                      aria-pressed={active}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div className="vp-interest-icon">
                          <Icon size={18} aria-hidden="true" />
                        </div>
                        <div>
                          <strong style={{ display: 'block', fontSize: 14, color: 'var(--vp-ink)' }}>{opt.title}</strong>
                          <span style={{ fontSize: 12.5, color: 'var(--vp-muted)' }}>{opt.desc}</span>
                        </div>
                      </div>
                      <span className="vp-badge vp-badge--category">{categoryCounts[opt.id]} spots</span>
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                <span className="vp-eyebrow vp-eyebrow--light">Preferred Pace &amp; Difficulty</span>
                <div className="vp-diff-grid">
                  {['easy', 'medium', 'hard'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      className={`vp-diff-btn${difficulty === level ? ' is-active' : ''}`}
                      aria-pressed={difficulty === level}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="vp-btn-dark">
                <span>Save &amp; View Recommendations</span>
                <ArrowUpRight size={15} className="vp-btn-arrow" aria-hidden="true" />
              </button>
            </form>

            <div className="vp-panel" style={{ display: 'grid', gap: 14 }}>
              <span className="vp-eyebrow vp-eyebrow--light">Live Scoring Preview</span>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 24, margin: 0 }}>
                Top 3 Matches Right Now
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--vp-muted)' }}>
                Updates live as you toggle categories or difficulty.
              </p>

              <div style={{ display: 'grid', gap: 10, marginTop: 4 }}>
                {livePreviewMatches.map((spot) => (
                  <Link key={spot.id} to={`/location/${spot.id}`} className="vp-preset-btn">
                    <div>
                      <strong style={{ display: 'block', fontSize: 14 }}>{spot.name}</strong>
                      <span style={{ fontSize: 12, color: 'var(--vp-muted)' }}>
                        {spot.categoryName} · {spot.difficulty} · {spot.distance} km
                      </span>
                    </div>
                    <span className="vp-badge vp-badge--verified">{spot.score}%</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
