import React from 'react';
import { Star } from 'lucide-react';
import './StarRating.css';

export default function StarRating({
  rating = 4.0,
  px = 14,
  dark = false,
  interactive = false,
  onChange,
  showValue = true,
}) {
  const roundedRating = Math.round(Number(rating || 0) * 10) / 10;
  const activeCount = interactive ? Math.round(Number(rating || 0)) : Math.round(Number(rating || 0));

  return (
    <div className={`vp-stars${dark ? ' vp-stars--dark' : ''}`} aria-label={interactive ? undefined : `Rated ${roundedRating.toFixed(1)} out of 5`}>
      <div className="vp-stars-row">
        {[1, 2, 3, 4, 5].map((value) => {
          const filled = value <= activeCount;
          if (interactive && typeof onChange === 'function') {
            return (
              <button
                key={value}
                type="button"
                className="vp-star-btn"
                onClick={() => onChange(value)}
                aria-label={`Rate ${value} out of 5 stars`}
                aria-pressed={activeCount === value}
              >
                <Star
                  size={px}
                  className={`vp-star-icon${filled ? ' is-filled' : ''}`}
                  aria-hidden="true"
                />
              </button>
            );
          }
          return (
            <Star
              key={value}
              size={px}
              className={`vp-star-icon${filled ? ' is-filled' : ''}`}
              aria-hidden="true"
            />
          );
        })}
      </div>
      {showValue && (
        <span className="vp-stars-value">{roundedRating.toFixed(1)}</span>
      )}
    </div>
  );
}
