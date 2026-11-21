import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  Sliders,
} from 'lucide-react';
import {
  fetchLocations,
  getActiveUser,
  getPreferences,
  savePreferences,
} from '../utils/storage';
import { calculateDistance } from '../utils/scoring';
import './Calibration.css';

const MOCK_COORDS = [
  { name: 'Bangalore Center (MG Road)', lat: 12.974, lng: 77.601 },
  { name: 'Whitefield (East Bangalore)', lat: 12.9698, lng: 77.7499 },
  { name: 'Yelahanka (North Bangalore)', lat: 13.1007, lng: 77.5963 },
  { name: 'Kengeri (Southwest Bangalore)', lat: 12.9004, lng: 77.4828 },
  { name: 'Nelamangala (Northwest Bangalore)', lat: 13.0964, lng: 77.3912 },
];

export default function Settings() {
  const [preferences, setPrefs] = useState(getPreferences());
  const [locations, setLocations] = useState([]);
  const [latInput, setLatInput] = useState(String(getPreferences().currentLocation.lat));
  const [lngInput, setLngInput] = useState(String(getPreferences().currentLocation.lng));
  const [successMsg, setSuccessMsg] = useState('');

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  useEffect(() => {
    const activePrefs = getPreferences();
    setPrefs(activePrefs);
    setLatInput(String(activePrefs.currentLocation.lat));
    setLngInput(String(activePrefs.currentLocation.lng));
    fetchLocations().then((locs) => setLocations(locs));
  }, []);

  // Initialize Radius Visualization Map
  useEffect(() => {
    if (!mapRef.current || !window.L) return undefined;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const { lat, lng } = preferences.currentLocation;
    const map = window.L.map(mapRef.current, { scrollWheelZoom: false }).setView([lat, lng], 9);
    mapInstanceRef.current = map;

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const pin = window.L.divIcon({
      html: `<div style="width:18px;height:18px;border-radius:50%;background:#c2d67b;border:3px solid #131a16;"></div>`,
      className: 'vp-gps-pin',
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
    markerRef.current = window.L.marker([lat, lng], { icon: pin }).addTo(map);
    circleRef.current = window.L.circle([lat, lng], {
      radius: (preferences.searchRadius || 60) * 1000,
      color: '#29372c',
      fillColor: '#c2d67b',
      fillOpacity: 0.22,
      weight: 2,
    }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update circle and marker dynamically
  useEffect(() => {
    const { lat, lng } = preferences.currentLocation;
    if (markerRef.current && circleRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      circleRef.current.setLatLng([lat, lng]);
      circleRef.current.setRadius((preferences.searchRadius || 60) * 1000);
      mapInstanceRef.current.panTo([lat, lng]);
    }
  }, [preferences.currentLocation, preferences.searchRadius]);

  const spotsWithinRadius = useMemo(() => {
    return locations.filter(
      (loc) =>
        calculateDistance(
          preferences.currentLocation.lat,
          preferences.currentLocation.lng,
          loc.lat,
          loc.lng
        ) <= preferences.searchRadius
    ).length;
  }, [locations, preferences]);

  const triggerNotice = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3200);
  };

  const handleSelectPredefined = (item) => {
    setLatInput(String(item.lat));
    setLngInput(String(item.lng));
    const updated = savePreferences({
      ...preferences,
      currentLocation: { lat: item.lat, lng: item.lng },
    });
    setPrefs(updated);
    triggerNotice(`GPS anchor updated to ${item.name}.`);
  };

  const handleSaveCustom = (e) => {
    e.preventDefault();
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (isNaN(lat) || isNaN(lng)) {
      triggerNotice('Please enter valid numeric latitude and longitude.');
      return;
    }
    const updated = savePreferences({
      ...preferences,
      currentLocation: { lat, lng },
    });
    setPrefs(updated);
    triggerNotice('Custom coordinates saved to explorer settings.');
  };

  const handleRadiusChange = (e) => {
    const radius = parseInt(e.target.value, 10);
    const updated = savePreferences({ ...preferences, searchRadius: radius });
    setPrefs(updated);
    triggerNotice(`Search boundary set to ${radius} km.`);
  };

  const activeUser = getActiveUser();

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
          <h1>GPS &amp; Search Radius</h1>
          <p className="vp-page-hero-lead">
            Simulate starting coordinates across Bangalore and set your travel radius for recommendation distance scoring.
          </p>

          <nav className="vp-cal-tabs" aria-label="Calibration sections">
            <Link to="/settings" className="vp-cal-tab is-active" aria-current="page">
              <SettingsIcon size={15} aria-hidden="true" /> GPS &amp; Radius
            </Link>
            <Link to="/preferences" className="vp-cal-tab">
              <Sliders size={15} aria-hidden="true" /> Trail Interests
            </Link>
          </nav>
        </div>
      </section>

      <section className="vp-section">
        <div className="vp-container">
          {successMsg && (
            <div className="vp-alert vp-alert--ok" style={{ marginBottom: 22 }} role="status">
              <ShieldCheck size={17} aria-hidden="true" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="vp-cal-grid">
            <div className="vp-panel" style={{ display: 'grid', gap: 22 }}>
              <div>
                <span className="vp-eyebrow vp-eyebrow--light">
                  <Navigation size={13} aria-hidden="true" /> Preset Starting Anchors
                </span>
                <div className="vp-preset-list">
                  {MOCK_COORDS.map((item) => {
                    const isSelected =
                      Math.abs(preferences.currentLocation.lat - item.lat) < 0.001 &&
                      Math.abs(preferences.currentLocation.lng - item.lng) < 0.001;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => handleSelectPredefined(item)}
                        className={`vp-preset-btn${isSelected ? ' is-active' : ''}`}
                        aria-pressed={isSelected}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <MapPin size={15} aria-hidden="true" /> {item.name}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--vp-muted)' }}>
                          {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleSaveCustom} style={{ display: 'grid', gap: 14, paddingTop: 18, borderTop: '1px solid var(--vp-line)' }}>
                <span className="vp-eyebrow vp-eyebrow--light">Custom Coordinates</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="vp-field">
                    <label htmlFor="gps-lat" className="vp-label">Latitude</label>
                    <input
                      id="gps-lat"
                      type="text"
                      className="vp-input"
                      value={latInput}
                      onChange={(e) => setLatInput(e.target.value)}
                    />
                  </div>
                  <div className="vp-field">
                    <label htmlFor="gps-lng" className="vp-label">Longitude</label>
                    <input
                      id="gps-lng"
                      type="text"
                      className="vp-input"
                      value={lngInput}
                      onChange={(e) => setLngInput(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="vp-btn-dark">
                  <Save size={15} aria-hidden="true" /> Save Custom GPS Anchor
                </button>
              </form>
            </div>

            <div style={{ display: 'grid', gap: 20 }}>
              <div className="vp-panel" style={{ display: 'grid', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="vp-eyebrow vp-eyebrow--light">Radius Boundary</span>
                  <strong style={{ fontSize: 14 }}>{preferences.searchRadius} km</strong>
                </div>
                <label htmlFor="radius-range" className="sr-only">Search radius in kilometers</label>
                <input
                  id="radius-range"
                  type="range"
                  min="20"
                  max="120"
                  step="10"
                  value={preferences.searchRadius}
                  onChange={handleRadiusChange}
                  className="vp-range"
                />
                <div ref={mapRef} className="vp-radius-map" data-lenis-prevent />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--vp-muted)', fontWeight: 600 }}>
                  <span>{spotsWithinRadius} mapped spots within {preferences.searchRadius} km</span>
                  <Link to="/recommendations" className="vp-inline-link">See matches</Link>
                </div>
              </div>

              <div className="vp-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div>
                  <span className="vp-eyebrow vp-eyebrow--light">Active Account</span>
                  <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 700 }}>
                    {activeUser ? `@${activeUser.username} (${activeUser.role})` : 'Guest Explorer'}
                  </p>
                </div>
                <Link to={activeUser ? '/profile' : '/login'} className="vp-btn-secondary">
                  {activeUser ? 'Open Profile' : 'Sign In'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
