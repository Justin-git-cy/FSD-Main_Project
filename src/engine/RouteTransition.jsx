import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ease, prefersReducedMotion } from './env';
import { initScroll, resetScroll } from './scroll';
import { startIdle } from './idle';

gsap.registerPlugin(ScrollTrigger);

const ROUTE_META = [
  {
    match: (p) => p === '/',
    label: 'Field Guide',
    title: 'ViewPoint Bangalore | Find trails and hidden places',
    description:
      'Explore community mapped trails, historic forts, and lesser known places around Bangalore with seasonal conditions and safety notes.',
  },
  {
    match: (p) => p.startsWith('/explore'),
    label: 'Field Atlas',
    title: 'Explore Map | ViewPoint Bangalore',
    description:
      'Interactive contour map of verified trails, historic ruins, and granite hills around Bangalore with community upvotes and filters.',
  },
  {
    match: (p) => p.startsWith('/trending'),
    label: 'Community Favorites',
    title: 'Trending Discoveries | ViewPoint Bangalore',
    description:
      'Highest rated and most upvoted outdoor trails, ruins, and heritage sights shared by Bangalore explorers.',
  },
  {
    match: (p) => p.startsWith('/recommendations'),
    label: 'Season Match',
    title: 'Weather Matched Routes | ViewPoint Bangalore',
    description:
      'Real-time season and weather weighted trail recommendations tailored to your difficulty level, categories, and radius.',
  },
  {
    match: (p) => p.startsWith('/add-location'),
    label: 'Share Discovery',
    title: 'Share a Spot | ViewPoint Bangalore',
    description:
      'Pin a new trail, ruin, or historic landmark around Bangalore with seasonal suitability notes and weather advisories.',
  },
  {
    match: (p) => p.startsWith('/location/'),
    label: 'Field Dossier',
    title: 'Location Field Dossier | ViewPoint Bangalore',
    description:
      'Detailed route notes, seasonal safety ratings, GPS coordinates, and community reviews for this Bangalore discovery.',
  },
  {
    match: (p) => p.startsWith('/profile'),
    label: 'Explorer Ledger',
    title: 'Explorer Profile | ViewPoint Bangalore',
    description:
      'Manage your ViewPoint explorer profile, view shared discoveries, inspect written field notes, and verify trails.',
  },
  {
    match: (p) => p.startsWith('/settings'),
    label: 'GPS Calibration',
    title: 'GPS & Radius Settings | ViewPoint Bangalore',
    description:
      'Calibrate your starting coordinates and search radius around Bangalore for accurate distance scoring.',
  },
  {
    match: (p) => p.startsWith('/preferences'),
    label: 'Trail Interests',
    title: 'Trail Preferences | ViewPoint Bangalore',
    description:
      'Choose your preferred trail categories and adventure difficulty to personalize ViewPoint recommendations.',
  },
  {
    match: (p) => p.startsWith('/login'),
    label: 'Explorer Node',
    title: 'Sign In | ViewPoint Bangalore',
    description:
      'Connect your ViewPoint explorer account to submit locations, upvote routes, and write community field notes.',
  },
];

function getRouteMeta(pathname) {
  return (
    ROUTE_META.find((r) => r.match(pathname)) || {
      label: 'Off Trail',
      title: 'Trail Not Found | ViewPoint Bangalore',
      description:
        'This path is not mapped on ViewPoint Bangalore. Return to the field guide or open the interactive map.',
    }
  );
}

export default function RouteTransition() {
  const { pathname } = useLocation();
  const curtainRef = useRef(null);
  const panelRef = useRef(null);
  const labelRef = useRef(null);
  const isFirstRender = useRef(true);

  // Boot single-clock scroll and idle driver once
  useEffect(() => {
    initScroll();
    startIdle();
  }, []);

  useEffect(() => {
    const meta = getRouteMeta(pathname);
    document.title = meta.title;
    const descTag = document.querySelector('meta[name="description"]');
    if (descTag) descTag.setAttribute('content', meta.description);

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    resetScroll();

    const mainEl = document.getElementById('main-content');
    if (mainEl) {
      mainEl.focus({ preventScroll: true });
    }

    const curtain = curtainRef.current;
    const panel = panelRef.current;
    const label = labelRef.current;
    if (!curtain || !panel) return;

    if (label) label.textContent = meta.label;

    if (prefersReducedMotion()) {
      const tl = gsap.timeline();
      tl.set(curtain, { autoAlpha: 1 })
        .set(panel, { yPercent: 0, opacity: 0.45 })
        .to(panel, { opacity: 0, duration: 0.16, ease: 'none' })
        .set(curtain, { autoAlpha: 0, clearProps: 'opacity' })
        .add(() => ScrollTrigger.refresh());
      return () => tl.kill();
    }

    const tl = gsap.timeline();
    tl.set(curtain, { autoAlpha: 1 })
      .set(panel, { yPercent: 0 })
      .to(panel, {
        yPercent: -102,
        duration: 0.62,
        delay: 0.08,
        ease: ease.inOut,
      })
      .set(curtain, { autoAlpha: 0 })
      .add(() => ScrollTrigger.refresh());

    return () => tl.kill();
  }, [pathname]);

  return (
    <div id="vp-curtain" ref={curtainRef} aria-hidden="true">
      <div className="vp-curtain-panel" ref={panelRef}>
        <svg className="vp-curtain-contours" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
          {[0, 1, 2, 3, 4, 5].map((ring) => (
            <ellipse
              key={ring}
              cx="400"
              cy="250"
              rx={110 + ring * 65}
              ry={70 + ring * 44}
              transform="rotate(-22 400 250)"
              fill="none"
              stroke="rgba(194, 214, 123, 0.32)"
              strokeWidth="1"
            />
          ))}
        </svg>
        <div className="vp-curtain-label">
          <span className="vp-curtain-dot" />
          <span ref={labelRef}>Field Guide</span>
        </div>
      </div>
    </div>
  );
}
