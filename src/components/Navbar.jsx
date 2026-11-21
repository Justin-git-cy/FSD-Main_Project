import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, TrendingUp, PlusCircle, Settings, LogOut, LogIn, Sparkles, Award, Sun, Moon } from 'lucide-react';
import { onScroll, startScroll, stopScroll } from '../engine';
import WeatherSimulator from './WeatherSimulator';
import './Navbar.css';

const navItems = [
  { name: 'Explore', path: '/explore', icon: Compass },
  { name: 'Trending', path: '/trending', icon: TrendingUp },
  { name: 'For you', path: '/recommendations', icon: Sparkles },
  { name: 'Share a spot', path: '/add-location', icon: PlusCircle },
];

export default function Navbar() {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleBtnRef = useRef(null);
  const firstMobileLinkRef = useRef(null);
  const threadRef = useRef(null);

  useEffect(() => {
    return onScroll(({ progress }) => {
      if (threadRef.current) {
        threadRef.current.style.transform = `scaleX(${progress})`;
      }
    });
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      startScroll();
      return undefined;
    }

    stopScroll();
    const timer = requestAnimationFrame(() => {
      firstMobileLinkRef.current?.focus();
    });

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        toggleBtnRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      cancelAnimationFrame(timer);
      window.removeEventListener('keydown', onKeyDown);
      startScroll();
    };
  }, [mobileMenuOpen]);

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
            <button
              type="button"
              className="vp-theme-toggle"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light display mode' : 'Switch to dark display mode'}
              aria-pressed={theme === 'dark'}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? <Sun size={15} aria-hidden="true" /> : <Moon size={15} aria-hidden="true" />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            {user ? (
              <>
                <Link to="/profile" className="vp-account" onClick={closeMenu}>
                  <img src={user.avatar} alt="" width="34" height="34" />
                  <span className="vp-account-copy">
                    <strong>{user.username}</strong>
                    <small><Award size={10} aria-hidden="true" /> {user.role}</small>
                  </span>
                </Link>
                <Link to="/settings" className="vp-icon-action" aria-label="Settings" onClick={closeMenu}>
                  <Settings size={17} aria-hidden="true" />
                </Link>
                <button type="button" className="vp-icon-action" onClick={handleLogout} aria-label="Sign out">
                  <LogOut size={17} aria-hidden="true" />
                </button>
              </>
            ) : (
              <Link to="/login" className="vp-sign-in" onClick={closeMenu}>
                <LogIn size={15} aria-hidden="true" />
                <span>Sign in</span>
              </Link>
            )}
            <button
              ref={toggleBtnRef}
              type="button"
              className="vp-menu-toggle"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileMenuOpen}
              aria-controls="vp-mobile-menu"
            >
              <span className={`vp-menu-glyph${mobileMenuOpen ? ' is-open' : ''}`} aria-hidden="true">
                <i />
                <i />
              </span>
            </button>
          </div>
        </div>
      </div>

      <WeatherSimulator />

      <div className="vp-scroll-thread" ref={threadRef} aria-hidden="true" />

      <nav
        id="vp-mobile-menu"
        className={`vp-mobile-menu${mobileMenuOpen ? ' is-open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!mobileMenuOpen}
      >
        <div className="vp-mobile-menu-inner">
          <span className="vp-mobile-kicker">Choose a direction</span>
          {navItems.map(({ name, path, icon: Icon }, index) => (
            <NavLink
              key={path}
              to={path}
              ref={index === 0 ? firstMobileLinkRef : undefined}
              onClick={closeMenu}
              className={({ isActive }) => `vp-mobile-link${isActive ? ' is-active' : ''}`}
              tabIndex={mobileMenuOpen ? 0 : -1}
            >
              <span className="vp-mobile-index">0{index + 1}</span>
              <Icon size={20} aria-hidden="true" />
              <span>{name}</span>
              <span className="vp-mobile-arrow" aria-hidden="true">↗</span>
            </NavLink>
          ))}
          {user ? (
            <div className="vp-mobile-extras">
              <button type="button" onClick={toggleTheme} tabIndex={mobileMenuOpen ? 0 : -1}>
                {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
              <Link to="/profile" onClick={closeMenu} tabIndex={mobileMenuOpen ? 0 : -1}>
                Profile
              </Link>
              <Link to="/settings" onClick={closeMenu} tabIndex={mobileMenuOpen ? 0 : -1}>
                <Settings size={18} aria-hidden="true" /> Settings
              </Link>
              <button type="button" onClick={handleLogout} tabIndex={mobileMenuOpen ? 0 : -1}>
                <LogOut size={18} aria-hidden="true" /> Sign out
              </button>
            </div>
          ) : (
            <div className="vp-mobile-extras">
              <button type="button" onClick={toggleTheme} tabIndex={mobileMenuOpen ? 0 : -1}>
                {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
              <Link to="/login" className="vp-mobile-sign-in" onClick={closeMenu} tabIndex={mobileMenuOpen ? 0 : -1}>
                <LogIn size={17} aria-hidden="true" /> Sign in to ViewPoint
              </Link>
            </div>
          )}
          <div className="vp-mobile-foot">
            BENGALURU OUTSKIRTS <span>12°58′ N / 77°35′ E</span>
          </div>
        </div>
      </nav>
    </header>
  );
}
