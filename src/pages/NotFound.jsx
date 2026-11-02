import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, MapPin } from 'lucide-react';
import './NotFound.css';

export default function NotFound() {
  return (
    <section className="not-found-page">
      <div className="not-found-coordinate"><MapPin size={14} /> UNKNOWN TRAIL / 404</div>
      <div className="not-found-mark"><Compass size={30} /></div>
      <p className="not-found-code">This path isn’t on our map.</p>
      <h1>Looks like<br />you took a turn.</h1>
      <p className="not-found-copy">The page may have moved, or the trail may not exist yet. Head back to the field guide and find another way through.</p>
      <Link to="/" className="not-found-link"><ArrowLeft size={16} /> Return to ViewPoint</Link>
      <div className="not-found-grid" aria-hidden="true" />
    </section>
  );
}
