import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, TrendingUp, PlusCircle, Settings, LogOut, LogIn, Sparkles, Award } from 'lucide-react';
import WeatherSimulator from './WeatherSimulator';
import './Navbar.css';

const navItems = [
  { name: 'Explore', path: '/explore', icon: Compass },
  { name: 'Trending', path: '/trending', icon: TrendingUp },
  { name: 'For you', path: '/recommendations', icon: Sparkles },
  { name: 'Share a spot', path: '/add-location', icon: PlusCircle }
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="vp-header">
      <div className="vp-nav-row">
        <div className="vp-nav-inner">
          <Link to="/" className="vp-brand" onClick={closeMenu} aria-label="ViewPoint home">
            <span className="vp-brand-mark">VP</span>
            <span className="vp-brand-copy">
              <strong>ViewPoint</strong>
              <small>Bangalore field guide</small>
            </span>
          </Link>

          <nav className="vp-desktop-nav" aria-label="Main navigation">
            {navItems.map(({ name, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => `vp-nav-link${isActive ? ' is-active' : ''}`}
              >
                <Icon size={15} aria-hidden="true" />
                <span>{name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="vp-account-area">
            {user ? (
              <>
                <Link to="/profile" className="vp-account" onClick={closeMenu}>
                  <img src={user.avatar} alt="" />
                  <span className="vp-account-copy">
                    <strong>{user.username}</strong>
                    <small><Award size={10} aria-hidden="true" /> {user.role}</small>
                  </span>
                </Link>
                <Link to="/settings" className="vp-icon-action" aria-label="Settings"><Settings size={17} /></Link>
                <button type="button" className="vp-icon-action" onClick={handleLogout} aria-label="Sign out"><LogOut size={17} /></button>
              </>
            ) : (
              <Link to="/login" className="vp-sign-in"><LogIn size={15} aria-hidden="true" /><span>Sign in</span></Link>
            )}
            <button
              type="button"
              className="vp-menu-toggle"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileMenuOpen}
              aria-controls="vp-mobile-menu"
            >
              <span className={`vp-menu-glyph${mobileMenuOpen ? ' is-open' : ''}`} aria-hidden="true"><i /><i /></span>
            </button>
          </div>
        </div>
      </div>

      <WeatherSimulator />

      <nav id="vp-mobile-menu" className={`vp-mobile-menu${mobileMenuOpen ? ' is-open' : ''}`} aria-label="Mobile navigation" aria-hidden={!mobileMenuOpen}>
        <div className="vp-mobile-menu-inner">
          <span className="vp-mobile-kicker">Choose a direction</span>
          {navItems.map(({ name, path, icon: Icon }, index) => (
            <NavLink key={path} to={path} onClick={closeMenu} className={({ isActive }) => `vp-mobile-link${isActive ? ' is-active' : ''}`} tabIndex={mobileMenuOpen ? 0 : -1}>
              <span className="vp-mobile-index">0{index + 1}</span>
              <Icon size={20} aria-hidden="true" />
              <span>{name}</span>
              <span className="vp-mobile-arrow" aria-hidden="true">↗</span>
            </NavLink>
          ))}
          {user ? (
            <div className="vp-mobile-extras">
              <Link to="/settings" onClick={closeMenu}><Settings size={18} /> Settings</Link>
              <button type="button" onClick={handleLogout}><LogOut size={18} /> Sign out</button>
            </div>
          ) : (
            <Link to="/login" className="vp-mobile-sign-in" onClick={closeMenu}><LogIn size={17} /> Sign in to ViewPoint</Link>
          )}
          <div className="vp-mobile-foot">BENGALURU OUTSKIRTS <span>12°58′ N / 77°35′ E</span></div>
        </div>
      </nav>
    </header>
  );
}
