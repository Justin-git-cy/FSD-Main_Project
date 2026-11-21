import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Compass, LogIn, MapPin, ShieldAlert, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (nameToLogin) => {
    const finalName = (nameToLogin || username).trim();
    if (!finalName) {
      setErrorMsg('Please enter an explorer username.');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);
    await login(finalName);
    setSubmitting(false);
    navigate('/profile');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <section className="vp-login-page">
      <svg className="vp-login-contours" viewBox="0 0 800 600" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5, 6].map((ring) => (
          <ellipse
            key={ring}
            cx="280"
            cy="300"
            rx={110 + ring * 64}
            ry={68 + ring * 40}
            transform="rotate(-24 280 300)"
            fill="none"
            stroke="rgba(194, 214, 123, 0.25)"
            strokeWidth="1"
          />
        ))}
      </svg>

      <div className="vp-login-shell">
        <div className="vp-login-aside">
          <div>
            <span className="vp-eyebrow">
              <span className="vp-eyebrow-dot" /> Explorer Node
            </span>
            <h1>Sign in to ViewPoint</h1>
            <p>
              Connect your account to save trail discoveries directly to MongoDB Atlas, write field reviews, and manage your terrain preferences.
            </p>
          </div>

          <ul className="vp-login-points">
            <li><MapPin size={16} aria-hidden="true" /> Pin unmapped Bangalore hills and ruins</li>
            <li><Compass size={16} aria-hidden="true" /> Log real-time trail conditions &amp; ratings</li>
            <li><Award size={16} aria-hidden="true" /> Pathfinders can verify pending discoveries</li>
          </ul>
        </div>

        <div className="vp-login-form-pane">
          {user && (
            <div className="vp-alert vp-alert--ok">
              <UserCheck size={17} aria-hidden="true" />
              <span>
                Active session: <strong>@{user.username}</strong> ({user.role})
              </span>
            </div>
          )}

          <form className="vp-login-form" onSubmit={handleFormSubmit}>
            <div className="vp-field">
              <label htmlFor="login-username" className="vp-label">
                Explorer Username or Email Prefix
              </label>
              <input
                id="login-username"
                type="text"
                className="vp-input"
                placeholder="e.g. rohan_trekker or your_name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={submitting}
              />
              {errorMsg && <span className="vp-error-text">{errorMsg}</span>}
            </div>

            <button
              type="submit"
              className="vp-btn-dark"
              disabled={submitting || !username.trim()}
            >
              <LogIn size={16} aria-hidden="true" />
              <span>{submitting ? 'Connecting to MongoDB...' : 'Connect Explorer Node'}</span>
            </button>
          </form>

          <div className="vp-login-divider">Or Demo Profiles</div>

          <div className="vp-demo-grid">
            <button
              type="button"
              className="vp-demo-btn"
              disabled={submitting}
              onClick={() => handleLogin('rohan_trekker')}
            >
              <img
                src="https://api.dicebear.com/7.x/adventurer/svg?seed=rohan"
                alt=""
                width="36"
                height="36"
              />
              <div>
                <strong>Rohan Sharma</strong>
                <span>Pathfinder · Can Verify</span>
              </div>
            </button>

            <button
              type="button"
              className="vp-demo-btn"
              disabled={submitting}
              onClick={() => handleLogin('neha_explores')}
            >
              <img
                src="https://api.dicebear.com/7.x/adventurer/svg?seed=neha"
                alt=""
                width="36"
                height="36"
              />
              <div>
                <strong>Neha Reddy</strong>
                <span>Explorer · Reviewer</span>
              </div>
            </button>
          </div>

          <div className="vp-alert vp-alert--warn" style={{ fontSize: 12 }}>
            <ShieldAlert size={16} aria-hidden="true" />
            <span>Entering a new username automatically creates a MongoDB explorer profile.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
