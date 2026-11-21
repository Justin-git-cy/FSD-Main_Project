import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, Compass, Footprints,
  MapPin, ShieldCheck, Sparkles, Star, Sun, CloudRain, CloudFog, Cloud,
  Trees, Wind
} from 'lucide-react';
import { fetchLocations, getCategories, getPreferences, getWeather, setWeather, upvoteLocation } from '../utils/storage';
import { INITIAL_LOCATIONS } from '../utils/db';
import { rankLocations } from '../utils/scoring';
import { ease, idle, isTouch, onScroll, prefersReducedMotion } from '../engine';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Home.css';

gsap.registerPlugin(ScrollTrigger);

const categoryLabels = [
  { id: 'all', label: 'All places' },
  { id: 'cat_trekking', label: 'Trails' },
  { id: 'cat_historic', label: 'History' },
  { id: 'cat_abandoned', label: 'Ruins' },
];

const questions = [
  ['What kind of places are on ViewPoint?', 'Community mapped trails, forts, historic sites, and other outdoor places around Bangalore. Each listing includes practical details such as difficulty, community rating, and seasonal notes.'],
  ['How are discoveries verified?', 'New submissions are reviewed by Pathfinders and community explorers. A place marked verified has passed review, though conditions and access can change. Always check local guidance before you go.'],
  ['Does verified mean a place is safe to enter?', 'No. Verification confirms a community review, not permission or a guarantee of safety. Respect closures, private property, protected sites, and on-site instructions.'],
  ['How does weather affect recommendations?', 'Season and weather settings update the suitability scores and safety advisories across the site. The simulator is a planning aid, not a live forecast.'],
  ['Can I add a location?', 'Yes. Use Share a spot to submit coordinates and field notes for community review. Avoid sharing fragile sites where heavy foot traffic could cause harm.'],
  ['Do I need an account to explore?', 'No. You can browse the interactive map and recommendations without signing in. Sign in when you want to submit spots, write reviews, or save your explorer profile.'],
];

const weatherOptions = [
  { value: 'sunny', label: 'Clear', icon: Sun },
  { value: 'rainy', label: 'Rain', icon: CloudRain },
  { value: 'overcast', label: 'Cloud', icon: Cloud },
  { value: 'misty', label: 'Mist', icon: CloudFog },
];

const STORY_PLACES = [
  {
    matchName: 'Savandurga',
    fallbackId: 'loc_savandurga',
    title: 'The granite opens up.',
    place: 'Savandurga Monolith Trek',
    coords: '12° 54′ N / 77° 17′ E · 1226m',
    note: 'A broad rock face, an exposed climb, and a long view over the Arkavathi basin. Go when the stone is dry, and give the midday heat a wide berth.',
    marker: '01 / OPEN COUNTRY',
    image: INITIAL_LOCATIONS.find((place) => place.id === 'loc_savandurga')?.images[0],
  },
  {
    matchName: 'Turahalli',
    fallbackId: 'loc_turahalli',
    title: 'The canopy closes in.',
    place: 'Turahalli Forest',
    coords: '12° 53′ N / 77° 32′ E · 890m',
    note: 'A pocket of scrub forest and granite boulders at the city’s southern edge. Stay on established paths and leave room for the forest to stay quiet.',
    marker: '02 / UNDER THE CANOPY',
    image: INITIAL_LOCATIONS.find((place) => place.id === 'loc_turahalli')?.images[0],
  },
  {
    matchName: 'Skandagiri',
    fallbackId: 'loc_skandagiri',
    title: 'Old walls meet first light.',
    place: 'Skandagiri Night Trek',
    coords: '13° 25′ N / 77° 40′ E · 1450m',
    note: 'Stone gateways and Tipu-era fort remains above the Chikkaballapur plains. Low cloud can erase familiar landmarks, so keep to the known route.',
    marker: '03 / FORT ABOVE THE CLOUDS',
    image: INITIAL_LOCATIONS.find((place) => place.id === 'loc_skandagiri')?.images[0],
  },
];

function Topography({ routeRef }) {
  return (
    <svg className="topography" viewBox="0 0 700 700" aria-hidden="true" focusable="false">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((ring) => (
        <ellipse
          key={ring}
          cx="375"
          cy="347"
          rx={92 + ring * 29}
          ry={65 + ring * 25}
          transform="rotate(-31 375 347)"
          className={`topography-line topo-${ring}`}
        />
      ))}
      <path
        ref={routeRef}
        className="route-trace"
        d="M72 568 C166 501 159 438 254 432 S335 355 390 366 S466 295 450 230 S521 176 607 95"
      />
      <circle cx="72" cy="568" r="6" className="route-point route-start" />
      <circle cx="607" cy="95" r="8" className="route-point route-end" />
      <circle cx="254" cy="432" r="4" className="route-stop" />
      <circle cx="450" cy="230" r="4" className="route-stop" />
    </svg>
  );
}

function SpotCard({ location, onUpvote, featuredRank }) {
  const catSlug = location.category?.slug || '';
  const category =
    location.categoryId === 'cat_trekking' || catSlug === 'trekking'
      ? 'Trail'
      : location.categoryId === 'cat_abandoned' || catSlug === 'abandoned'
        ? 'Ruins'
        : 'Historic';

  return (
    <article className={`spot-card is-visible${featuredRank === 0 ? ' is-lead' : ''}`}>
      <Link
        className="spot-image-link"
        to={`/location/${location.id}`}
        aria-label={`Read dossier for ${location.name}`}
      >
        <img
          src={location.images?.[0]}
          alt={`${location.name} trail scenery`}
          loading="lazy"
          decoding="async"
          width="600"
          height="400"
        />
        <span className="spot-index">{category}</span>
        <span className="spot-open" aria-hidden="true"><ArrowUpRight size={17} /></span>
      </Link>
      <div className="spot-copy">
        <div className="spot-meta">
          <span><MapPin size={13} aria-hidden="true" /> {location.bestSeason || 'Winter'} season</span>
          <span className="difficulty"><span className={`difficulty-dot ${location.difficulty}`} />{location.difficulty}</span>
        </div>
        <h3><Link to={`/location/${location.id}`}>{location.name}</Link></h3>
        <p>{location.description}</p>
        <div className="spot-footer">
          <span className="rating">
            <Star size={14} fill="currentColor" aria-hidden="true" /> {Number(location.rating || 0).toFixed(1)}
            <small>community rating</small>
          </span>
          <button
            className="upvote-button"
            type="button"
            onClick={() => onUpvote(location.id)}
            aria-label={`Upvote ${location.name}`}
          >
            <Sparkles size={14} aria-hidden="true" /> {location.upvotes || 0}
          </button>
        </div>
      </div>
    </article>
  );
}

function TrailStory({ locations }) {
  const storyRef = useRef(null);
  const [activeScene, setActiveScene] = useState(0);

  const resolvedActs = useMemo(() => {
    return STORY_PLACES.map((act) => {
      const match = locations.find((l) =>
        l.name.toLowerCase().includes(act.matchName.toLowerCase())
      );
      return {
        ...act,
        targetUrl: match ? `/location/${match.id}` : `/explore?focus=${act.fallbackId}`,
        image: match?.images?.[0] || act.image,
        rating: match ? Number(match.rating).toFixed(1) : '4.8',
        bestSeason: match?.bestSeason || 'Winter',
      };
    });
  }, [locations]);

  useLayoutEffect(() => {
    const root = storyRef.current;
    const stage = root?.querySelector('.story-stage');
    const deck = root?.querySelector('.story-deck');
    const route = root?.querySelector('.story-route-line');
    const chapters = gsap.utils.toArray(root?.querySelectorAll('.story-chapter') || []);
    if (!root || !stage || !deck || !chapters.length || prefersReducedMotion()) return undefined;

    const context = gsap.context(() => {
      const driver = { value: 0 };
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.75,
          invalidateOnRefresh: true,
        },
      });
      timeline.fromTo(
        deck,
        { rotateX: 8, rotateY: -14, yPercent: 4, scale: 0.9 },
        { rotateX: -5, rotateY: 14, yPercent: -4, scale: 1, ease: 'none' },
        0
      );
      if (route) {
        timeline.fromTo(route, { strokeDashoffset: 320 }, { strokeDashoffset: -120, ease: 'none' }, 0);
      }
      timeline.to(
        driver,
        {
          value: STORY_PLACES.length - 0.01,
          ease: 'none',
          onUpdate: () => {
            const idx = Math.min(STORY_PLACES.length - 1, Math.floor(driver.value));
            setActiveScene((prev) => (prev !== idx ? idx : prev));
            stage.dataset.scene = String(idx);
            chapters.forEach((chapter, index) => {
              chapter.classList.toggle('is-active', index === idx);
              if (index === idx) chapter.setAttribute('aria-current', 'step');
              else chapter.removeAttribute('aria-current');
            });
          },
        },
        0
      );
    }, root);

    return () => context.revert();
  }, []);

  return (
    <>
      <header className="story-intro">
        <span className="section-index">02 / THE LAND IN THREE ACTS</span>
        <h2 id="story-title">Step beyond<br />the city line.</h2>
        <p>Scroll through three landscapes around Bangalore. Each one asks you to arrive a little differently.</p>
        <span className="story-scroll-cue"><span /> Keep moving to travel the map</span>
      </header>
      <section id="trail-story" className="trail-story" ref={storyRef} aria-labelledby="story-title">
        <div className="story-chapters">
          {resolvedActs.map((place, index) => (
            <article
              className={`story-chapter${index === 0 ? ' is-active' : ''}`}
              id={`trail-chapter-${index + 1}`}
              aria-current={index === 0 ? 'step' : undefined}
              key={place.fallbackId}
            >
              <div className="story-chapter-meta">
                <span>{place.marker}</span>
                <span>0{index + 1} / 03</span>
              </div>
              <h3>{place.title}</h3>
              <p className="story-place-name">
                <MapPin size={14} aria-hidden="true" /> {place.place} · ★ {place.rating} · {place.bestSeason}
              </p>
              <p className="story-chapter-note">{place.note}</p>
              <Link className="story-chapter-link" to={place.targetUrl}>
                Read the field dossier <ArrowRight size={15} aria-hidden="true" />
              </Link>
              <a
                className="story-next"
                href={`#trail-chapter-${index === resolvedActs.length - 1 ? 1 : index + 2}`}
                aria-label={index === resolvedActs.length - 1 ? 'Return to the first story' : 'Continue to the next landscape'}
              >
                <span>{index === resolvedActs.length - 1 ? 'START AGAIN' : 'NEXT LANDSCAPE'}</span>
                <ArrowDown size={15} aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
        <div className="story-stage" data-scene={activeScene} aria-hidden="true">
          <div className="story-stage-header">
            <span><span className="story-stage-dot" /> FIELD STUDY / 03</span>
            <span>SCROLL TO TRACE</span>
          </div>
          <div className="story-stage-surface">
            <div className="story-contours"><Topography /></div>
            <div className="story-deck">
              {resolvedActs.map((place, index) => (
                <div className={`story-photo story-photo-${index}`} key={place.fallbackId}>
                  <img
                    src={place.image}
                    alt=""
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    width="480"
                    height="380"
                  />
                  <span className="story-photo-index">0{index + 1}</span>
                </div>
              ))}
              <div className="story-route-pin story-route-pin-start"><MapPin size={17} /></div>
              <div className="story-route-pin story-route-pin-end"><MapPin size={17} /></div>
            </div>
            <svg className="story-route-overlay" viewBox="0 0 700 620" aria-hidden="true">
              <path className="story-route-line" d="M90 505 C140 415 250 465 300 365 S420 315 440 242 S510 138 618 91" />
            </svg>
            <div className="story-coordinate story-coordinate-top">{resolvedActs[activeScene]?.coords}</div>
            <div className="story-coordinate story-coordinate-bottom">FIELD NOTES<br /><b>BENGALURU EDGE</b></div>
          </div>
          <div className="story-stage-footer">
            <span>CONTOUR / <b><span className="story-current-number">0{activeScene + 1}</span> / 03</b></span>
            <span className="story-footer-bars"><i /><i /><i /></span>
          </div>
        </div>
      </section>
    </>
  );
}

export default function Home() {
  const pageRef = useRef(null);
  const heroRef = useRef(null);
  const heroMapTiltRef = useRef(null);
  const heroRouteRef = useRef(null);
  const heroCompassRef = useRef(null);
  const indexListRef = useRef(null);
  const previewBoxRef = useRef(null);
  const previewImgRef = useRef(null);

  const [locations, setLocations] = useState([]);
  const [categoryCount, setCategoryCount] = useState(3);
  const [category, setCategory] = useState('all');
  const [climate, setClimate] = useState({ season: 'winter', weather: 'sunny', temperature: '24°C' });
  const [season, setSeason] = useState('winter');

  const syncLocations = useCallback(() => {
    fetchLocations().then((locs) => {
      setLocations(locs.filter((location) => location.verificationStatus === 'verified'));
    });
  }, []);

  useEffect(() => {
    syncLocations();
    const cats = getCategories();
    if (cats.length > 0) setCategoryCount(cats.length);

    const syncClimate = () => {
      const current = getWeather();
      setClimate(current);
      setSeason(current.season || 'winter');
    };
    syncClimate();
    window.addEventListener('storage', syncLocations);
    window.addEventListener('locationsUpdated', syncLocations);
    window.addEventListener('weatherChanged', syncClimate);
    return () => {
      window.removeEventListener('storage', syncLocations);
      window.removeEventListener('locationsUpdated', syncLocations);
      window.removeEventListener('weatherChanged', syncClimate);
    };
  }, [syncLocations]);

  // Hero Entry + Idle Pointer/Tick Driver + Scroll Fold + Scroll-Driven Section Choreography
  useLayoutEffect(() => {
    const root = pageRef.current;
    const hero = heroRef.current;
    if (!root || !hero || prefersReducedMotion()) return undefined;

    const mobile = window.matchMedia('(max-width: 767px)').matches;
    const ctx = gsap.context(() => {
      // 1. Hero Entry Choreography (snappy < 0.9s settle)
      gsap.from('.hero-copy-reveal', {
        y: 26,
        autoAlpha: 0,
        duration: 0.72,
        stagger: 0.06,
        ease: ease.out,
        clearProps: 'transform,opacity,visibility',
      });
      gsap.from('.hero-map', {
        clipPath: 'inset(8% 0% 0% 0%)',
        autoAlpha: 0,
        duration: 0.82,
        delay: 0.08,
        ease: ease.out,
        clearProps: 'clipPath,opacity,visibility',
      });

      // 2. Single-clock Idle Driver (alive at rest, pauses off-screen)
      const mapEl = heroMapTiltRef.current;
      const routeEl = heroRouteRef.current;
      const compassEl = heroCompassRef.current;
      const tickIdle = () => {
        if (mapEl) {
          gsap.set(mapEl, {
            rotateY: idle.x * 5,
            rotateX: -idle.y * 4,
          });
        }
        if (compassEl) {
          gsap.set(compassEl, {
            rotation: Math.sin(idle.t * 0.65) * 6 + idle.x * 18,
          });
        }
        if (routeEl) {
          routeEl.style.strokeDashoffset = String(-(idle.t * 9) % 180);
        }
      };

      const idleTrigger = ScrollTrigger.create({
        trigger: hero,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          if (self.isActive) gsap.ticker.add(tickIdle);
          else gsap.ticker.remove(tickIdle);
        },
      });
      gsap.ticker.add(tickIdle);

      // 3. Pinned 3D Hero Fold (Desktop)
      if (!mobile) {
        const map = hero.querySelector('.hero-map');
        const mapArt = hero.querySelector('.map-art');
        const mapImage = hero.querySelector('.map-landscape');
        const contours = hero.querySelector('.map-art .topography');
        const labels = hero.querySelectorAll('.map-label');
        const copy = hero.querySelector('.hero-copy');
        const sideNote = hero.querySelector('.hero-side-note');
        const bottomline = hero.querySelector('.hero-bottomline');
        const wash = hero.querySelector('.hero-transition-wash');

        if (map && mapArt && mapImage && contours && copy && wash) {
          const transition = gsap.timeline({
            scrollTrigger: {
              trigger: hero,
              start: 'top top',
              end: '+=92%',
              pin: true,
              scrub: 0.7,
              invalidateOnRefresh: true,
              anticipatePin: 1,
            },
          });
          transition.to(map, { y: -20, rotateX: 9, rotateY: -9, scale: 0.94, ease: 'none' }, 0);
          transition.to(mapArt, { scale: 1.03, ease: 'none' }, 0);
          transition.to(mapImage, { scale: 1.12, yPercent: 5, ease: 'none' }, 0);
          transition.to(contours, { scale: 1.15, yPercent: -6, opacity: 0.95, ease: 'none' }, 0);
          transition.to(labels, { y: -22, x: 10, ease: 'none' }, 0);
          transition.to(copy, { y: -32, opacity: 0.25, ease: 'none' }, 0);
          transition.to([sideNote, bottomline], { opacity: 0.12, ease: 'none' }, 0);
          transition.to(wash, { opacity: 0.94, ease: 'none' }, 0);
        }
      }

      // 4. Section 01: Scrubbed Kinetic Word Illumination
      const words = gsap.utils.toArray(root.querySelectorAll('.word-reveal span'));
      const statementRule = root.querySelector('.statement-rule');
      if (words.length) {
        const wordTl = gsap.timeline({
          scrollTrigger: {
            trigger: '.field-statement',
            start: 'top 76%',
            end: 'center 42%',
            scrub: 0.55,
          },
        });
        wordTl.fromTo(
          words,
          { opacity: 0.2 },
          { opacity: 1, stagger: 0.12, ease: 'none' },
          0
        );
        if (statementRule) {
          wordTl.fromTo(statementRule, { scaleX: 0 }, { scaleX: 1, ease: 'none' }, 0);
        }
      }

      // 5. Section 04: Conditions Landscape Multi-Layer Parallax
      const condSection = root.querySelector('.conditions-section');
      if (condSection) {
        gsap.fromTo('.sun-disc', { yPercent: -12 }, { yPercent: 18, ease: 'none', scrollTrigger: { trigger: condSection, start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.fromTo('.ridge-back', { yPercent: 10 }, { yPercent: -8, ease: 'none', scrollTrigger: { trigger: condSection, start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.fromTo('.ridge-front', { yPercent: 16 }, { yPercent: -4, ease: 'none', scrollTrigger: { trigger: condSection, start: 'top bottom', end: 'bottom top', scrub: true } });
      }

      // 6. Section 05: Process Hairline Rule Draw & Live Counters
      const processLine = root.querySelector('.process-steps');
      if (processLine) {
        gsap.fromTo(
          processLine,
          { '--rule-scale': 0 },
          {
            '--rule-scale': 1,
            ease: 'none',
            scrollTrigger: { trigger: processLine, start: 'top 85%', end: 'top 45%', scrub: 0.5 },
          }
        );
      }

      // 7. Section 06: Scroll-Rotating Field Code Stamp
      const ethicStamp = root.querySelector('.ethic-stamp');
      if (ethicStamp) {
        gsap.fromTo(
          ethicStamp,
          { rotation: -18 },
          {
            rotation: 18,
            ease: 'none',
            scrollTrigger: { trigger: '.ethic-section', start: 'top bottom', end: 'bottom top', scrub: true },
          }
        );
      }

      return () => {
        gsap.ticker.remove(tickIdle);
        idleTrigger.kill();
      };
    }, root);

    return () => ctx.revert();
  }, []);

  // Cursor-Following Photo Preview for Field Archive Index
  useEffect(() => {
    const list = indexListRef.current;
    const box = previewBoxRef.current;
    const img = previewImgRef.current;
    if (!list || !box || !img || isTouch() || prefersReducedMotion()) return undefined;

    const xTo = gsap.quickTo(box, 'x', { duration: 0.55, ease: 'power3.out' });
    const yTo = gsap.quickTo(box, 'y', { duration: 0.55, ease: 'power3.out' });
    const rotTo = gsap.quickTo(box, 'rotate', { duration: 0.75, ease: 'power3.out' });
    let lastX = 0;
    let px = 0;
    let py = 0;

    const move = (e) => {
      px = e.clientX;
      py = e.clientY;
      xTo(px);
      yTo(py);
      rotTo(gsap.utils.clamp(-10, 10, (px - lastX) * 0.55));
      lastX = px;
    };

    const show = (e) => {
      const src = e.currentTarget.getAttribute('data-preview');
      if (!src) return;
      img.src = src;
      gsap.to(box, { autoAlpha: 1, scale: 1, duration: 0.4, ease: ease.out, overwrite: 'auto' });
    };

    const hide = () => {
      gsap.to(box, { autoAlpha: 0, scale: 0.88, duration: 0.35, ease: ease.out, overwrite: 'auto' });
    };

    const links = list.querySelectorAll('a[data-preview]');
    links.forEach((a) => {
      a.addEventListener('pointerenter', show);
      a.addEventListener('focus', show);
    });
    list.addEventListener('pointerleave', hide);
    window.addEventListener('pointermove', move, { passive: true });
    const offScroll = onScroll(() => {
      const hovered = document.elementFromPoint(px, py);
      if (!hovered || !list.contains(hovered)) hide();
    });

    return () => {
      links.forEach((a) => {
        a.removeEventListener('pointerenter', show);
        a.removeEventListener('focus', show);
      });
      list.removeEventListener('pointerleave', hide);
      window.removeEventListener('pointermove', move);
      offScroll();
    };
  }, [locations, category]);

  const sortedByCategory = useMemo(() => {
    const filtered = locations.filter((location) => {
      if (category === 'all') return true;
      const slug = location.category?.slug || '';
      return location.categoryId === category || (slug && category.endsWith(slug));
    });
    return [...filtered].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
  }, [locations, category]);

  const featured = useMemo(() => sortedByCategory.slice(0, 5), [sortedByCategory]);
  const archiveRows = useMemo(() => sortedByCategory.slice(5, 10), [sortedByCategory]);

  const liveTopMatches = useMemo(() => {
    if (!locations.length) return [];
    const prefs = getPreferences();
    return rankLocations(locations, prefs, climate).slice(0, 3);
  }, [locations, climate]);

  const totalUpvotes = useMemo(
    () => locations.reduce((acc, loc) => acc + (loc.upvotes || 0), 0),
    [locations]
  );

  const updateClimate = (updates) => {
    const nextSeason = updates.season || season;
    const nextWeather = updates.weather || climate.weather;
    const temps = {
      summer: { sunny: '34°C', rainy: '27°C', overcast: '29°C', misty: '26°C' },
      monsoon: { sunny: '28°C', rainy: '22°C', overcast: '24°C', misty: '23°C' },
      winter: { sunny: '25°C', rainy: '21°C', overcast: '22°C', misty: '16°C' },
    };
    const next = { season: nextSeason, weather: nextWeather, temperature: temps[nextSeason][nextWeather] };
    setSeason(nextSeason);
    setClimate(next);
    setWeather(next);
  };

  const handleUpvote = async (id) => {
    await upvoteLocation(id);
    syncLocations();
  };

  const weatherWarning =
    climate.weather === 'rainy'
      ? 'Rain can turn exposed granite slick. Check each trail note before setting out.'
      : climate.weather === 'misty'
        ? 'Low visibility can hide trail markers. Keep to known paths and carry a light.'
        : climate.season === 'summer'
          ? 'Open rock heats quickly. Start early and carry enough water for the full route.'
          : 'Conditions are set for a clear day. Review access notes before you leave.';

  const wordStatement = 'A quieter way to get out there.';
  const heroPhoto =
    locations.find((p) => p.name.toLowerCase().includes('savandurga'))?.images?.[0] ||
    INITIAL_LOCATIONS.find((place) => place.id === 'loc_savandurga')?.images[0];

  return (
    <div className="viewpoint-home" ref={pageRef}>
      <section className="field-hero" ref={heroRef} aria-labelledby="hero-title">
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="hero-kicker hero-copy-reveal">
              <span className="live-mark" /> A field guide to Bangalore’s edges
            </div>
            <h1 id="hero-title" className="hero-copy-reveal">
              <span className="hero-title-line">Find the paths</span>
              <span className="hero-title-line hero-title-accent">Bangalore forgot.</span>
            </h1>
            <p className="hero-description hero-copy-reveal">
              Community mapped trails, old forts, and quiet corners, with the conditions and local notes to help you go thoughtfully.
            </p>
            <div className="hero-actions hero-copy-reveal">
              <Link to="/explore" className="button-primary">
                <Compass size={18} aria-hidden="true" />
                <span>Explore the map</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link to="/add-location" className="text-link">
                <span>Share a discovery</span>
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </div>
            <div className="hero-proof hero-copy-reveal">
              <ShieldCheck size={15} aria-hidden="true" />
              <span>Community reviewed</span>
              <i />
              <span>Season aware</span>
              <i />
              <span>Built for the outdoors</span>
            </div>
          </div>

          <div className="hero-map-tilt" ref={heroMapTiltRef}>
            <div className="hero-map" role="group" aria-label="Layered field map with a landscape photograph and route sketch">
              <div className="map-header">
                <span><span className="map-live-dot" /> Field notes / 01</span>
                <span>12°58′ N &nbsp; 77°35′ E</span>
              </div>
              <div className="map-art">
                <img
                  className="map-landscape"
                  src={heroPhoto}
                  alt="Granite ridge trail near Savandurga"
                  fetchPriority="high"
                  width="640"
                  height="480"
                />
                <Topography routeRef={heroRouteRef} />
                <div className="map-label label-one">
                  <span className="map-pin"><MapPin size={13} /></span>
                  <b>Turahalli</b>
                  <small>forest reserve</small>
                </div>
                <div className="map-label label-two">
                  <span className="map-pin"><MapPin size={13} /></span>
                  <b>Uttari Betta</b>
                  <small>fort trail</small>
                </div>
                <div className="map-scale">
                  <span>0</span>
                  <span className="scale-line" />
                  <span>8 km</span>
                </div>
                <div className="map-compass">
                  <span>N</span>
                  <span className="map-compass-dial" ref={heroCompassRef} style={{ display: 'inline-grid', placeItems: 'center' }}>
                    <Compass size={20} aria-hidden="true" />
                  </span>
                </div>
              </div>
              <div className="map-bottom">
                <div>
                  <small>FIELD CONDITION</small>
                  <strong>
                    {climate.weather === 'sunny'
                      ? 'Clear skies'
                      : climate.weather === 'rainy'
                        ? 'Rain advisory'
                        : climate.weather === 'misty'
                          ? 'Low visibility'
                          : 'Overcast'}
                  </strong>
                </div>
                <span className="map-bottom-icon">
                  <Wind size={18} aria-hidden="true" /> {climate.temperature}
                </span>
              </div>
              <Link to="/explore" className="map-expand" aria-label="Open the interactive map">
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>

          <div className="hero-side-note">
            <span>FIG. 01</span>
            <span>Leave a place<br />as you found it.</span>
          </div>
        </div>
        <nav className="hero-bottomline" aria-label="Explore the home page">
          <span className="hero-edition">FIELD GUIDE <i /> 2026</span>
          <div className="hero-route-nav">
            <a href="#field-idea"><span>01</span> The idea <ArrowDown size={13} aria-hidden="true" /></a>
            <a href="#trail-story"><span>02</span> Field notes <ArrowDown size={13} aria-hidden="true" /></a>
            <a href="#discover"><span>03</span> Discoveries <ArrowDown size={13} aria-hidden="true" /></a>
          </div>
          <span className="hero-coordinates">12.9716° N / 77.5946° E</span>
        </nav>
        <div className="hero-transition-wash" aria-hidden="true" />
      </section>

      <section id="field-idea" className="field-statement" aria-label={wordStatement}>
        <div className="statement-marker">
          <span>01</span>
          <span>THE IDEA</span>
          <span className="statement-rule" />
        </div>
        <p className="word-reveal">
          {wordStatement.split(' ').map((word, index) => (
            <span key={`${word}-${index}`} style={{ '--word-index': index }}>
              {word}{index < wordStatement.split(' ').length - 1 ? ' ' : ''}
            </span>
          ))}
        </p>
        <div className="statement-caption">
          <Trees size={17} aria-hidden="true" />
          <span>Good places stay intact when local knowledge guides who visits and when.</span>
        </div>
      </section>

      <TrailStory locations={locations} />

      <section className="discover-section" id="discover" aria-labelledby="discover-title">
        <div className="section-head">
          <div>
            <span className="section-index">03 / THE FIELD NOTES</span>
            <h2 id="discover-title">Worth taking<br />the long way for.</h2>
          </div>
          <p>Places shared by people who know the trails. Open any dossier to read seasonal notes, or follow the map somewhere new.</p>
        </div>

        <div className="discovery-tools">
          <div className="filter-list" role="group" aria-label="Filter discoveries by type">
            {categoryLabels.map((item) => (
              <button
                key={item.id}
                type="button"
                className={category === item.id ? 'filter-chip active' : 'filter-chip'}
                aria-pressed={category === item.id}
                onClick={() => setCategory(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <Link to="/trending" className="all-spots-link">
            See all discoveries <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="spot-grid spot-grid--asymmetric">
            {featured.map((location, index) => (
              <SpotCard
                key={location.id}
                location={location}
                onUpvote={handleUpvote}
                featuredRank={index}
              />
            ))}
          </div>
        ) : (
          <div className="empty-spots">
            <Footprints size={28} />
            <p>No reviewed places in this category yet.</p>
            <Link to="/add-location">Share the first discovery <ArrowRight size={15} /></Link>
          </div>
        )}

        {archiveRows.length > 0 && (
          <div className="home-archive" aria-label="Additional verified places ledger">
            <div className="home-archive-head">
              <span>FIELD LEDGER / MORE VERIFIED ROUTES</span>
              <span>{sortedByCategory.length} TOTAL IN ATLAS</span>
            </div>
            <ul className="home-archive-list" ref={indexListRef}>
              {archiveRows.map((item, idx) => (
                <li key={item.id}>
                  <Link
                    to={`/location/${item.id}`}
                    data-preview={item.images?.[0]}
                    className="home-archive-row"
                  >
                    <span className="archive-num">0{idx + 6}</span>
                    <img
                      src={item.images?.[0]}
                      alt=""
                      className="archive-thumb-mobile"
                      loading="lazy"
                      width="48"
                      height="36"
                    />
                    <strong className="archive-name">{item.name}</strong>
                    <span className="archive-cat">{item.categoryName}</span>
                    <span className="archive-season">{item.bestSeason}</span>
                    <span className="archive-rating">★ {Number(item.rating || 4).toFixed(1)}</span>
                    <ArrowUpRight size={15} className="archive-arrow" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="home-index-preview" ref={previewBoxRef} aria-hidden="true">
              <img ref={previewImgRef} alt="" />
            </div>
          </div>
        )}

        <div className="section-footnote">
          <span>New here?</span>
          <span>Every place starts with a note from someone who went.</span>
          <Link to="/explore">Browse the full map <ArrowRight size={14} aria-hidden="true" /></Link>
        </div>
      </section>

      <section
        className="conditions-section"
        aria-labelledby="conditions-title"
        data-season={season}
        data-weather={climate.weather}
      >
        <div className="conditions-art" aria-hidden="true">
          <Topography />
          <div className="sun-disc" />
          <div className="weather-atmosphere-layer" />
          <div className="ridge ridge-back" />
          <div className="ridge ridge-front" />
          <div className="ridge-route" />
          <span className="art-coordinate">
            12° 58′ 24″ N<br />77° 35′ 11″ E · {climate.temperature}
          </span>
        </div>
        <div className="conditions-content">
          <span className="section-index">04 / BEFORE YOU GO</span>
          <h2 id="conditions-title">The same trail<br />can tell a new story.</h2>
          <p className="conditions-intro">
            Season and weather change the ground beneath your feet. Adjust conditions here to recalculate trail safety and suitability across ViewPoint.
          </p>
          <div className="climate-panel">
            <div className="climate-top">
              <span>Plan for conditions</span>
              <span className="climate-status"><span /> SIMULATOR</span>
            </div>
            <div className="season-select">
              {['winter', 'summer', 'monsoon'].map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => updateClimate({ season: item })}
                  aria-pressed={season === item}
                  className={season === item ? 'season-option active' : 'season-option'}
                >
                  {item}
                  <span>{item === 'winter' ? 'NOV to FEB' : item === 'summer' ? 'MAR to MAY' : 'JUN to OCT'}</span>
                </button>
              ))}
            </div>
            <div className="weather-select" role="group" aria-label="Choose weather condition">
              {weatherOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  aria-label={`Set weather to ${label.toLowerCase()}`}
                  aria-pressed={climate.weather === value}
                  className={climate.weather === value ? 'weather-option active' : 'weather-option'}
                  onClick={() => updateClimate({ weather: value })}
                >
                  <Icon size={17} aria-hidden="true" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <div className="condition-advisory">
              <ShieldCheck size={17} aria-hidden="true" />
              <p>{weatherWarning}</p>
            </div>

            {liveTopMatches.length > 0 && (
              <div className="climate-matches">
                <span className="climate-matches-title">Best matched for {season} · {climate.weather}</span>
                <ul>
                  {liveTopMatches.map((spot) => (
                    <li key={spot.id}>
                      <Link to={`/location/${spot.id}`}>
                        <span>{spot.name}</span>
                        <strong>{spot.score}% match</strong>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="climate-source">
              <span>Updates the shared weather simulator</span>
              <Check size={14} aria-hidden="true" />
            </div>
          </div>
          <Link to="/recommendations" className="conditions-link">
            See all season matched spots <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="process-section" aria-labelledby="process-title">
        <div className="process-heading">
          <span className="section-index">05 / HOW IT WORKS</span>
          <h2 id="process-title">A little local knowledge<br />goes a long way.</h2>
        </div>

        <div className="process-telemetry" aria-label="Community field statistics">
          <div className="process-stat">
            <strong>{locations.length || 20}</strong>
            <span>Verified spots mapped</span>
          </div>
          <div className="process-stat">
            <strong>{totalUpvotes || 1200}</strong>
            <span>Community upvotes</span>
          </div>
          <div className="process-stat">
            <strong>{categoryCount}</strong>
            <span>Outdoor terrain types</span>
          </div>
        </div>

        <div className="process-steps">
          <article className="process-step">
            <span className="step-number">01</span>
            <Compass size={23} aria-hidden="true" />
            <h3>Find your way out</h3>
            <p>Browse community notes on trails, forts, and places just beyond the usual route.</p>
          </article>
          <article className="process-step">
            <span className="step-number">02</span>
            <ShieldCheck size={23} aria-hidden="true" />
            <h3>Read the ground</h3>
            <p>Check difficulty, seasonal fit, and safety notes before choosing your day.</p>
          </article>
          <article className="process-step">
            <span className="step-number">03</span>
            <MapPin size={23} aria-hidden="true" />
            <h3>Leave a better map</h3>
            <p>Share what you found so the next person can explore with more care.</p>
          </article>
        </div>
      </section>

      <section className="ethic-section">
        <div className="ethic-stamp">
          <ShieldCheck size={19} aria-hidden="true" />
          <span>THE VIEWPOINT<br />FIELD CODE</span>
        </div>
        <div className="ethic-copy">
          <span className="section-index">A NOTE FROM THE TRAIL</span>
          <h2>Curiosity is a privilege.<br /><span>Care is part of the route.</span></h2>
          <p>Stay on marked paths. Respect closures and private land. Carry out what you carry in. If a place feels fragile, let it rest.</p>
        </div>
        <Link className="ethic-link" to="/explore">
          Explore with care <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
      </section>

      <section className="faq-section" aria-labelledby="faq-title">
        <div className="faq-heading">
          <span className="section-index">06 / GOOD TO KNOW</span>
          <h2 id="faq-title">A few things<br />before you go.</h2>
          <p>Still curious? <Link to="/explore">Start with the map <ArrowUpRight size={13} aria-hidden="true" /></Link></p>
        </div>
        <div className="faq-list">
          {questions.map(([question, answer], index) => (
            <details className="faq-item" key={question}>
              <summary>
                <span className="faq-number">0{index + 1}</span>
                <span>{question}</span>
                <ChevronDown size={17} aria-hidden="true" />
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="closing-section">
        <div className="closing-contours" aria-hidden="true"><Topography /></div>
        <span className="section-index">WHEN YOU’RE READY</span>
        <h2>There’s more out there<br />than the usual route.</h2>
        <p>Pick a direction. We’ll help you find a thoughtful place to start.</p>
        <Link to="/explore" className="button-primary">
          <Compass size={18} aria-hidden="true" />
          <span>Open the field map</span>
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
