import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, MapPin } from 'lucide-react';
import './NotFound.css';

export default function NotFound() {
  return (
    <section className="not-found-page">
      <svg className="not-found-contours" viewBox="0 0 800 500" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((ring) => (
          <ellipse
            key={ring}
            cx="400"
            cy="250"
            rx={110 + ring * 65}
            ry={68 + ring * 40}
            transform="rotate(-24 400 250)"
            fill="none"
            stroke="rgba(194, 214, 123, 0.3)"
            strokeWidth="1"
          />
        ))}
      </svg>
      <div className="not-found-coordinate"><MapPin size={14} aria-hidden="true" /> UNKNOWN TRAIL / 404</div>
      <div className="not-found-mark"><Compass size={30} aria-hidden="true" /></div>
      <p className="not-found-code">This path isn’t on our map.</p>
      <h1>Looks like<br />you took a turn.</h1>
      <p className="not-found-copy">
        The page may have moved, or the trail may not exist yet. Head back to the field guide or open the interactive atlas.
      </p>
      <div className="not-found-actions">
        <Link to="/" className="vp-btn-primary">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Return to ViewPoint</span>
        </Link>
        <Link to="/explore" className="vp-btn-outline-light">
          <Compass size={16} aria-hidden="true" />
          <span>Open Atlas Map</span>
        </Link>
      </div>
    </section>
  );
}
