import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  MapPin,
  PlusCircle,
  Send,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { addLocation } from '../utils/storage';
import './AddLocation.css';

const DEFAULT_IMG =
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80';

export default function AddLocation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    categoryId: 'cat_trekking',
    difficulty: 'medium',
    description: '',
    lat: '12.9716',
    lng: '77.5946',
    imageUrl: '',
    bestSeason: 'Winter',
    summerSuitability: '0.6',
    monsoonSuitability: '0.5',
    winterSuitability: '0.9',
    rainyWarning: '',
    sunnyWarning: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Interactive Click-to-Pin Map
  useEffect(() => {
    if (!user || !mapRef.current || !window.L) return undefined;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const startLat = parseFloat(formData.lat) || 12.9716;
    const startLng = parseFloat(formData.lng) || 77.5946;
    const map = window.L.map(mapRef.current).setView([startLat, startLng], 10);
    mapInstanceRef.current = map;

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const icon = window.L.divIcon({
      html: `<div style="width:20px;height:20px;border-radius:50%;background:#c2d67b;border:3px solid #131a16;box-shadow:0 3px 8px rgba(0,0,0,.45);"></div>`,
      className: 'vp-pin-picker',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const marker = window.L.marker([startLat, startLng], { icon }).addTo(map);
    markerRef.current = marker;

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      setFormData((prev) => ({
        ...prev,
        lat: lat.toFixed(4),
        lng: lng.toFixed(4),
      }));
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Sync typed coordinates to map marker
  useEffect(() => {
    const lat = parseFloat(formData.lat);
    const lng = parseFloat(formData.lng);
    if (!isNaN(lat) && !isNaN(lng) && markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }
  }, [formData.lat, formData.lng]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Location name is required.';
    if (!formData.description.trim()) newErrors.description = 'Description is required.';

    const latNum = parseFloat(formData.lat);
    if (isNaN(latNum) || latNum < 12.0 || latNum > 14.2) {
      newErrors.lat = 'Latitude must fall within the Bangalore belt (12.0 to 14.2).';
    }

    const lngNum = parseFloat(formData.lng);
    if (isNaN(lngNum) || lngNum < 76.8 || lngNum > 79.0) {
      newErrors.lng = 'Longitude must fall within the Bangalore belt (76.8 to 79.0).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || !user) return;

    setSubmitting(true);
    const weatherWarnings = {};
    if (formData.rainyWarning.trim()) weatherWarnings.rainy = formData.rainyWarning.trim();
    if (formData.sunnyWarning.trim()) weatherWarnings.sunny = formData.sunnyWarning.trim();

    const newLoc = {
      name: formData.name.trim(),
      categoryId: formData.categoryId,
      difficulty: formData.difficulty,
      description: formData.description.trim(),
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      images: formData.imageUrl.trim() ? [formData.imageUrl.trim()] : [],
      verificationStatus: user.role === 'Pathfinder' ? 'verified' : 'pending',
      createdBy: user._id || user.id,
      bestSeason: formData.bestSeason,
      seasonalSuitability: {
        summer: parseFloat(formData.summerSuitability),
        monsoon: parseFloat(formData.monsoonSuitability),
        winter: parseFloat(formData.winterSuitability),
      },
      weatherWarnings,
      rating: 4.0,
      upvotes: 0,
    };

    const added = await addLocation(newLoc);
    setSubmitting(false);
    navigate(`/location/${added.id || added._id}`);
  };

  if (!user) {
    return (
      <div className="vp-page">
        <section className="vp-page-hero">
          <div className="vp-container">
            <span className="vp-eyebrow"><span className="vp-eyebrow-dot" /> Contribution Ledger</span>
            <h1>Share a Discovery</h1>
            <p className="vp-page-hero-lead">
              Sign in as an Explorer or Pathfinder to pin new Bangalore trails, forts, and field notes to MongoDB.
            </p>
          </div>
        </section>
        <section className="vp-section">
          <div className="vp-container">
            <div className="vp-empty-state">
              <ShieldAlert size={34} />
              <h2>Explorer Session Required</h2>
              <p>Connect your explorer account so your discovery is attributed accurately and reviewed by the community.</p>
              <Link to="/login" className="vp-btn-dark">Sign in to ViewPoint</Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="vp-page">
      <section className="vp-page-hero">
        <svg className="vp-page-hero-contours" viewBox="0 0 600 400" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((ring) => (
            <ellipse
              key={ring}
              cx="380"
              cy="190"
              rx={85 + ring * 52}
              ry={52 + ring * 32}
              transform="rotate(-22 380 190)"
              fill="none"
              stroke="rgba(194, 214, 123, 0.24)"
              strokeWidth="1"
            />
          ))}
        </svg>
        <div className="vp-container">
          <div className="vp-page-hero-inner">
            <div className="vp-page-hero-copy">
              <span className="vp-eyebrow"><span className="vp-eyebrow-dot" /> Field Submission</span>
              <h1>Share a New Discovery</h1>
              <p className="vp-page-hero-lead">
                {user.role === 'Pathfinder'
                  ? 'Logged in as a Pathfinder. Your submission will be verified immediately in the atlas.'
                  : 'Pin an unmapped trail, ruin, or historic landmark. Submissions enter Pending review until verified.'}
              </p>
            </div>
            <div className="vp-page-hero-actions">
              <Link to="/explore" className="vp-btn-outline-light">
                <Compass size={15} aria-hidden="true" />
                <span>Browse Atlas</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="vp-section">
        <div className="vp-container vp-add-grid">
          <form className="vp-panel vp-add-form" onSubmit={handleSubmit}>
            <div className="vp-form-section">
              <h2>01 / Core Route Identity</h2>
              <div className="vp-form-row-2">
                <div className="vp-field">
                  <label htmlFor="loc-name" className="vp-label">Location Name</label>
                  <input
                    id="loc-name"
                    type="text"
                    name="name"
                    className="vp-input"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Makalidurga Ridge Fort"
                  />
                  {errors.name && <span className="vp-error-text">{errors.name}</span>}
                </div>

                <div className="vp-field">
                  <label htmlFor="loc-cat" className="vp-label">Terrain Category</label>
                  <select
                    id="loc-cat"
                    name="categoryId"
                    className="vp-select"
                    value={formData.categoryId}
                    onChange={handleChange}
                  >
                    <option value="cat_trekking">Trekking &amp; Hills</option>
                    <option value="cat_abandoned">Abandoned &amp; Ruins</option>
                    <option value="cat_historic">Historic Sights</option>
                  </select>
                </div>
              </div>

              <div className="vp-field">
                <label htmlFor="loc-desc" className="vp-label">Field Notes &amp; Access Description</label>
                <textarea
                  id="loc-desc"
                  name="description"
                  className="vp-textarea"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe approach trail, parking, water points, gate timings, and hazards..."
                />
                {errors.description && <span className="vp-error-text">{errors.description}</span>}
              </div>
            </div>

            <div className="vp-form-section">
              <h2>02 / Coordinates, Difficulty &amp; Imagery</h2>
              <div className="vp-form-row-3">
                <div className="vp-field">
                  <label htmlFor="loc-lat" className="vp-label">Latitude</label>
                  <input
                    id="loc-lat"
                    type="text"
                    name="lat"
                    className="vp-input"
                    value={formData.lat}
                    onChange={handleChange}
                  />
                  {errors.lat && <span className="vp-error-text">{errors.lat}</span>}
                </div>
                <div className="vp-field">
                  <label htmlFor="loc-lng" className="vp-label">Longitude</label>
                  <input
                    id="loc-lng"
                    type="text"
                    name="lng"
                    className="vp-input"
                    value={formData.lng}
                    onChange={handleChange}
                  />
                  {errors.lng && <span className="vp-error-text">{errors.lng}</span>}
                </div>
                <div className="vp-field">
                  <label htmlFor="loc-diff" className="vp-label">Difficulty</label>
                  <select
                    id="loc-diff"
                    name="difficulty"
                    className="vp-select"
                    value={formData.difficulty}
                    onChange={handleChange}
                  >
                    <option value="easy">Easy / Walk</option>
                    <option value="medium">Medium / Trek</option>
                    <option value="hard">Hard / Climb</option>
                  </select>
                </div>
              </div>

              <div className="vp-form-row-2">
                <div className="vp-field">
                  <label htmlFor="loc-img" className="vp-label">Photo URL (Optional)</label>
                  <input
                    id="loc-img"
                    type="url"
                    name="imageUrl"
                    className="vp-input"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
                <div className="vp-field">
                  <label htmlFor="loc-season" className="vp-label">Best Season</label>
                  <select
                    id="loc-season"
                    name="bestSeason"
                    className="vp-select"
                    value={formData.bestSeason}
                    onChange={handleChange}
                  >
                    <option value="Winter">Winter</option>
                    <option value="Monsoon">Monsoon</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="vp-form-section">
              <h2>03 / Seasonal Suitability &amp; Safety Advisories</h2>
              <div className="vp-form-row-3">
                <div className="vp-slider-field">
                  <div className="vp-slider-head">
                    <label htmlFor="suit-winter">Winter Fit</label>
                    <span>{Math.round(parseFloat(formData.winterSuitability) * 100)}%</span>
                  </div>
                  <input
                    id="suit-winter"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    name="winterSuitability"
                    value={formData.winterSuitability}
                    onChange={handleChange}
                    className="vp-range"
                  />
                </div>
                <div className="vp-slider-field">
                  <div className="vp-slider-head">
                    <label htmlFor="suit-summer">Summer Fit</label>
                    <span>{Math.round(parseFloat(formData.summerSuitability) * 100)}%</span>
                  </div>
                  <input
                    id="suit-summer"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    name="summerSuitability"
                    value={formData.summerSuitability}
                    onChange={handleChange}
                    className="vp-range"
                  />
                </div>
                <div className="vp-slider-field">
                  <div className="vp-slider-head">
                    <label htmlFor="suit-monsoon">Monsoon Fit</label>
                    <span>{Math.round(parseFloat(formData.monsoonSuitability) * 100)}%</span>
                  </div>
                  <input
                    id="suit-monsoon"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    name="monsoonSuitability"
                    value={formData.monsoonSuitability}
                    onChange={handleChange}
                    className="vp-range"
                  />
                </div>
              </div>

              <div className="vp-form-row-2">
                <div className="vp-field">
                  <label htmlFor="warn-rain" className="vp-label">Rainy Weather Warning</label>
                  <input
                    id="warn-rain"
                    type="text"
                    name="rainyWarning"
                    className="vp-input"
                    value={formData.rainyWarning}
                    onChange={handleChange}
                    placeholder="e.g. DANGEROUS: Steep rock gets slick"
                  />
                </div>
                <div className="vp-field">
                  <label htmlFor="warn-sun" className="vp-label">Sunny Weather Advisory</label>
                  <input
                    id="warn-sun"
                    type="text"
                    name="sunnyWarning"
                    className="vp-input"
                    value={formData.sunnyWarning}
                    onChange={handleChange}
                    placeholder="e.g. CAUTION: Carry 3L water"
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8 }}>
              <Link to="/explore" className="vp-btn-secondary">Cancel</Link>
              <button type="submit" className="vp-btn-dark" disabled={submitting}>
                <Send size={15} aria-hidden="true" />
                <span>{submitting ? 'Saving to MongoDB...' : 'Publish Coordinate'}</span>
              </button>
            </div>
          </form>

          <aside className="vp-add-aside">
            <div className="vp-panel">
              <span className="vp-eyebrow vp-eyebrow--light">
                <MapPin size={13} aria-hidden="true" /> Click Map to Pin
              </span>
              <p style={{ margin: '8px 0 12px', fontSize: 13, color: 'var(--vp-muted)' }}>
                Click anywhere around Bangalore to auto-fill latitude and longitude.
              </p>
              <div ref={mapRef} className="vp-pin-map" data-lenis-prevent />
              <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: 'var(--vp-ink)' }}>
                Pinned: {formData.lat}° N, {formData.lng}° E
              </div>
            </div>

            <div className="vp-panel">
              <span className="vp-eyebrow vp-eyebrow--light">
                <PlusCircle size={13} aria-hidden="true" /> Live Card Preview
              </span>
              <div className="vp-preview-card" style={{ marginTop: 12 }}>
                <img src={formData.imageUrl.trim() || DEFAULT_IMG} alt="Preview" />
                <div className="vp-preview-body">
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span className="vp-badge vp-badge--category">
                      {formData.categoryId.replace('cat_', '')}
                    </span>
                    <span className="vp-badge vp-badge--verified">{formData.difficulty}</span>
                  </div>
                  <h3>{formData.name.trim() || 'Untitled Trail Spot'}</h3>
                  <p>{formData.description.trim() || 'Your route description will appear here as you type.'}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
