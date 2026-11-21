import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Award,
  Calendar,
  CheckCircle,
  Edit3,
  Mail,
  MapPin,
  ShieldAlert,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  fetchLocations,
  fetchReviewsByUser,
  verifyLocation,
} from '../utils/storage';
import { useReveal } from '../engine';
import StarRating from '../components/StarRating';
import './Profile.css';

export default function Profile() {
  const { user, updateUserProfile } = useAuth();
  const pageRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [allLocations, setAllLocations] = useState([]);
  const [userReviews, setUserReviews] = useState([]);

  // Edit fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bioText, setBioText] = useState('');
  const [validationError, setValidationError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadLedger = useCallback(async () => {
    if (!user) return;
    const [locs, revs] = await Promise.all([
      fetchLocations(),
      fetchReviewsByUser(user._id || user.id || user.username),
    ]);
    setAllLocations(locs);
    setUserReviews(revs);
  }, [user]);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || user.username);
      setEmail(user.email || '');
      setAvatar(user.avatar || '');
      setBioText(user.bio || '');
      loadLedger();
    }
  }, [user, loadLedger]);

  useReveal(pageRef, [allLocations.length, userReviews.length]);

  const userCreatedLocs = useMemo(() => {
    if (!user) return [];
    return allLocations.filter(
      (loc) =>
        loc.createdBy === user.id ||
        loc.createdBy === user._id ||
        loc.createdById === user.id ||
        loc.createdById === user._id ||
        loc.createdByUsername === user.username
    );
  }, [allLocations, user]);

  const pendingSpots = useMemo(
    () => allLocations.filter((loc) => loc.verificationStatus === 'pending'),
    [allLocations]
  );

  const totalUpvotesReceived = useMemo(
    () => userCreatedLocs.reduce((sum, loc) => sum + (loc.upvotes || 0), 0),
    [userCreatedLocs]
  );

  const handleSave = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setValidationError('Full name cannot be empty.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    setValidationError('');
    setSaving(true);
    await updateUserProfile({
      fullName: fullName.trim(),
      email: email.trim(),
      avatar: avatar.trim(),
      bio: bioText.trim(),
    });
    setSaving(false);
    setIsEditing(false);
  };

  const handleCycleAvatarSeed = () => {
    const randomSeed = Math.random().toString(36).substring(2, 9);
    setAvatar(`https://api.dicebear.com/7.x/adventurer/svg?seed=${randomSeed}`);
  };

  const handleVerifyPending = async (locId) => {
    await verifyLocation(locId);
    loadLedger();
  };

  if (!user) {
    return (
      <div className="vp-page">
        <section className="vp-page-hero">
          <div className="vp-container">
            <span className="vp-eyebrow"><span className="vp-eyebrow-dot" /> Explorer Ledger</span>
            <h1>Sign in Required</h1>
            <p className="vp-page-hero-lead">Connect an explorer account to view your mapped trails, reviews, and credentials.</p>
          </div>
        </section>
        <section className="vp-section">
          <div className="vp-container">
            <div className="vp-empty-state">
              <ShieldAlert size={34} />
              <h2>No Active Session</h2>
              <p>Sign in with your username or choose a demo explorer profile to continue.</p>
              <Link to="/login" className="vp-btn-dark">Sign in to ViewPoint</Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="vp-page" ref={pageRef}>
      <section className="vp-page-hero">
        <svg className="vp-page-hero-contours" viewBox="0 0 600 400" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((ring) => (
            <ellipse
              key={ring}
              cx="420"
              cy="190"
              rx={80 + ring * 50}
              ry={52 + ring * 30}
              transform="rotate(-24 420 190)"
              fill="none"
              stroke="rgba(194, 214, 123, 0.24)"
              strokeWidth="1"
            />
          ))}
        </svg>

        <div className="vp-container">
          <div className="vp-profile-hero-grid">
            <div className="vp-profile-avatar-col">
              <img
                src={avatar || user.avatar}
                alt={user.username}
                className="vp-profile-avatar"
              />
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCycleAvatarSeed}
                  className="vp-btn-outline-light"
                  style={{ minHeight: 34, padding: '4px 10px', fontSize: 11 }}
                >
                  Cycle Avatar
                </button>
              )}
            </div>

            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                <span className="vp-eyebrow"><span className="vp-eyebrow-dot" /> {user.role} Node</span>
              </div>
              <h1 style={{ marginTop: 10 }}>{fullName || user.username}</h1>

              <div className="vp-profile-meta-row">
                <span><User size={14} aria-hidden="true" /> @{user.username}</span>
                <span><Mail size={14} aria-hidden="true" /> {email}</span>
                <span><Calendar size={14} aria-hidden="true" /> Joined {user.joinedDate || '2026'}</span>
              </div>

              <p className="vp-profile-bio">"{bioText || 'No field biography written yet.'}"</p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <button
                  type="button"
                  className="vp-btn-primary"
                  onClick={() => setIsEditing((prev) => !prev)}
                >
                  <Edit3 size={15} aria-hidden="true" />
                  <span>{isEditing ? 'Close Editor' : 'Edit Profile'}</span>
                </button>
                <Link to="/add-location" className="vp-btn-outline-light">
                  Share a Spot
                </Link>
              </div>
            </div>
          </div>

          {isEditing && (
            <form className="vp-profile-edit-panel" onSubmit={handleSave}>
              <span className="vp-eyebrow vp-eyebrow--light">Update MongoDB Profile</span>
              {validationError && (
                <div className="vp-alert vp-alert--danger">{validationError}</div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div className="vp-field">
                  <label htmlFor="prof-name" className="vp-label">Full Name</label>
                  <input
                    id="prof-name"
                    type="text"
                    className="vp-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="vp-field">
                  <label htmlFor="prof-email" className="vp-label">Email Address</label>
                  <input
                    id="prof-email"
                    type="email"
                    className="vp-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="vp-field">
                <label htmlFor="prof-avatar" className="vp-label">Avatar URL</label>
                <input
                  id="prof-avatar"
                  type="text"
                  className="vp-input"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                />
              </div>
              <div className="vp-field">
                <label htmlFor="prof-bio" className="vp-label">Explorer Bio</label>
                <textarea
                  id="prof-bio"
                  className="vp-textarea"
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="vp-btn-secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setValidationError('');
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="vp-btn-dark" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          <div className="vp-telemetry-strip">
            <div className="vp-telemetry-item">
              <span>Mapped Spots</span>
              <strong>{userCreatedLocs.length}</strong>
            </div>
            <div className="vp-telemetry-item">
              <span>Upvotes Received</span>
              <strong>{totalUpvotesReceived}</strong>
            </div>
            <div className="vp-telemetry-item">
              <span>Field Reviews</span>
              <strong>{userReviews.length}</strong>
            </div>
            <div className="vp-telemetry-item">
              <span>Node Role</span>
              <strong>{user.role}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="vp-section">
        <div className="vp-container" style={{ display: 'grid', gap: 44 }}>
          <div>
            <div className="vp-section-head">
              <div>
                <span className="vp-eyebrow vp-eyebrow--light">01 / Contributions</span>
                <h2 className="vp-section-title">My Shared Discoveries</h2>
              </div>
              <Link to="/add-location" className="vp-btn-dark">Pin a New Spot</Link>
            </div>

            {userCreatedLocs.length === 0 ? (
              <div className="vp-empty-state">
                <MapPin size={28} />
                <p>No spots mapped under your account yet. Pin a Bangalore ridge or heritage site.</p>
                <Link to="/add-location" className="vp-inline-link">Pin Your First Discovery</Link>
              </div>
            ) : (
              <div className="vp-profile-grid-2">
                {userCreatedLocs.map((loc) => (
                  <Link key={loc.id} to={`/location/${loc.id}`} className="vp-discovery-row-card">
                    <img src={loc.images[0]} alt={loc.name} loading="lazy" />
                    <div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                        <span
                          className={`vp-badge ${
                            loc.verificationStatus === 'verified' ? 'vp-badge--verified' : 'vp-badge--pending'
                          }`}
                        >
                          {loc.verificationStatus}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--vp-muted)' }}>
                          {loc.upvotes} upvotes
                        </span>
                      </div>
                      <h3>{loc.name}</h3>
                      <span style={{ fontSize: 12, color: 'var(--vp-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={12} aria-hidden="true" /> {loc.lat.toFixed(3)}, {loc.lng.toFixed(3)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="vp-section-head">
              <div>
                <span className="vp-eyebrow vp-eyebrow--light">02 / Trail Logs</span>
                <h2 className="vp-section-title">Written Field Notes ({userReviews.length})</h2>
              </div>
            </div>

            {userReviews.length === 0 ? (
              <div className="vp-empty-state">
                <p>You have not written any trail reviews yet. Open any location dossier to record your observations.</p>
                <Link to="/explore" className="vp-inline-link">Browse Field Atlas</Link>
              </div>
            ) : (
              <div className="vp-profile-grid-2">
                {userReviews.map((rev) => {
                  const targetId = rev.location?._id || rev.locationId || rev.location;
                  const targetName = rev.location?.name || 'Location Dossier';
                  return (
                    <article key={rev._id || rev.id} className="vp-panel" style={{ display: 'grid', gap: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                        <Link to={`/location/${targetId}`} className="vp-inline-link" style={{ fontSize: 15 }}>
                          {targetName} <ArrowUpRight size={14} aria-hidden="true" />
                        </Link>
                        <StarRating rating={rev.rating} px={13} />
                      </div>
                      <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'var(--vp-ink)' }}>
                        {rev.comment}
                      </p>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {user.role === 'Pathfinder' && (
            <div>
              <div className="vp-section-head">
                <div>
                  <span className="vp-eyebrow vp-eyebrow--light">03 / Pathfinder Authority</span>
                  <h2 className="vp-section-title">Verification Queue ({pendingSpots.length})</h2>
                </div>
              </div>

              {pendingSpots.length === 0 ? (
                <div className="vp-alert vp-alert--ok">
                  <CheckCircle size={17} aria-hidden="true" />
                  <span>All submitted community spots are currently verified.</span>
                </div>
              ) : (
                <div className="vp-verify-desk">
                  {pendingSpots.map((spot) => (
                    <div className="vp-verify-row" key={spot.id}>
                      <div>
                        <strong style={{ fontSize: 15, display: 'block' }}>{spot.name}</strong>
                        <span style={{ fontSize: 12, color: 'var(--vp-muted)' }}>
                          {spot.categoryName} · {spot.lat.toFixed(4)}° N, {spot.lng.toFixed(4)}° E
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/location/${spot.id}`} className="vp-btn-secondary" style={{ minHeight: 38, padding: '6px 12px', fontSize: 12 }}>
                          Inspect Dossier
                        </Link>
                        <button
                          type="button"
                          className="vp-btn-dark"
                          style={{ minHeight: 38, padding: '6px 12px', fontSize: 12 }}
                          onClick={() => handleVerifyPending(spot.id)}
                        >
                          <Award size={14} aria-hidden="true" />
                          <span>Verify Spot</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
