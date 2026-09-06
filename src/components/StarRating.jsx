import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 4.0, size = 4 }) {
  const stars = [];
  const roundedRating = Math.round(rating * 10) / 10;
  
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.round(rating)) {
      stars.push(
        <Star
          key={i}
          className={`h-${size} w-${size} fill-amber-400 text-amber-400`}
        />
      );
    } else {
      stars.push(
        <Star
          key={i}
          className={`h-${size} w-${size} text-slate-300 dark:text-slate-700`}
        />
      );
    }
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex">{stars}</div>
      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 ml-1">
        {roundedRating.toFixed(1)}
      </span>
    </div>
  );
}
