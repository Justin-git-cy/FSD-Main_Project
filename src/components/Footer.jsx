import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Compass, ShieldCheck, Trees } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="vp-footer">
      <svg className="vp-footer-contours" viewBox="0 0 520 360" aria-hidden="true" focusable="false">
        {[0, 1, 2, 3, 4, 5, 6].map((ring) => <ellipse key={ring} cx="340" cy="142" rx={74 + ring * 35} ry={38 + ring * 20} transform="rotate(-24 340 142)" />)}
      </svg>
      <div className="vp-footer-inner">
        <div className="vp-footer-intro">
          <div className="vp-footer-brand-block">
            <Link to="/" className="vp-footer-brand" aria-label="ViewPoint home">
              <span className="vp-footer-mark">VP</span>
              <span><strong>ViewPoint</strong><small>Bangalore field guide</small></span>
            </Link>
            <p>Community notes for trails, forts, and quiet outdoor places around Bangalore.</p>
            <span className="vp-footer-coordinates">12° 58′ N&nbsp; / &nbsp;77° 35′ E</span>
          </div>
          <div className="vp-footer-field-note">
            <span className="vp-footer-eyebrow"><i /> A note before you go</span>
            <p>Check access and conditions before setting out. Leave each place as you found it.</p>
            <Link to="/explore" className="vp-footer-map-link">Open the field map <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>

        <div className="vp-footer-links">
          <nav className="vp-footer-column" aria-label="Explore ViewPoint">
            <h2><Compass size={15} aria-hidden="true" /> Find a place</h2>
            <Link to="/explore">Explore the map</Link>
            <Link to="/trending">Community favorites</Link>
            <Link to="/recommendations">Recommendations</Link>
          </nav>
          <nav className="vp-footer-column" aria-label="Contribute to ViewPoint">
            <h2><Trees size={15} aria-hidden="true" /> Add to the map</h2>
            <Link to="/add-location">Share a spot</Link>
            <Link to="/profile">Your field notes</Link>
            <Link to="/settings">Preferences</Link>
          </nav>
          <div className="vp-footer-column vp-footer-care">
            <h2><ShieldCheck size={15} aria-hidden="true" /> Go with care</h2>
            <p>Respect closures and private land. Stay on established paths, and carry out what you bring in.</p>
          </div>
        </div>

        <div className="vp-footer-bottom">
          <span>© {new Date().getFullYear()} ViewPoint</span>
          <span>Made for the Bangalore outskirts</span>
          <span className="vp-footer-bottom-mark">FIELD GUIDE <i /> BENGALURU</span>
        </div>
      </div>
    </footer>
  );
}
