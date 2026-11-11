import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, Compass, Footprints,
  MapPin, ShieldCheck, Sparkles, Star, Sun, CloudRain, CloudFog, Cloud,
  Trees, Wind
} from 'lucide-react';
import { fetchLocations, getWeather, setWeather, upvoteLocation } from '../utils/storage';
import { INITIAL_LOCATIONS } from '../utils/db';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Home.css';

gsap.registerPlugin(ScrollTrigger);

const categoryLabels = [
  { id: 'all', label: 'All places' },
  { id: 'cat_trekking', label: 'Trails' },
  { id: 'cat_historic', label: 'History' },
  { id: 'cat_abandoned', label: 'Ruins' }
];

const questions = [
  ['What kind of places are on ViewPoint?', 'Community mapped trails, forts, historic sites, and other outdoor places around Bangalore. Each listing includes practical details such as difficulty, community rating, and seasonal notes.'],
  ['How are discoveries verified?', 'New submissions are reviewed by the community. A place marked verified has passed that review, but conditions and access can still change. Check local guidance before you go.'],
  ['Does verified mean a place is safe to enter?', 'No. Verification confirms a community review, not permission or a guarantee of safety. Respect closures, private property, protected sites, and on site instructions.'],
  ['How does weather affect recommendations?', 'Season and weather settings update the suitability notes and safety warnings shown in the app. The simulator is a planning aid, not a live forecast.'],
  ['Can I add a location?', 'Yes. Use Share a spot to submit its details for community review. Avoid sharing sensitive locations where public traffic could damage a habitat or site.'],
  ['Do I need an account to explore?', 'No. You can browse the map and recommendations without signing in. An account is useful when you want to share or review a discovery.']
];

const weatherOptions = [
  { value: 'sunny', label: 'Clear', icon: Sun },
  { value: 'rainy', label: 'Rain', icon: CloudRain },
  { value: 'overcast', label: 'Cloud', icon: Cloud },
  { value: 'misty', label: 'Mist', icon: CloudFog }
];

function useReveal(deps = []) {
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal-on-scroll, .word-reveal');
    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px 50px 0px' });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

function Topography() {
  return (
    <svg className="topography" viewBox="0 0 700 700" aria-hidden="true" focusable="false">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((ring) => (
        <ellipse
          key={ring}
          cx="375"
          cy="347"
          rx={92 + ring * 29}
          ry={65 + ring * 25}
          transform={`rotate(-31 375 347)`}
          className={`topography-line topo-${ring}`}
        />
      ))}
      <path className="route-trace" d="M72 568 C166 501 159 438 254 432 S335 355 390 366 S466 295 450 230 S521 176 607 95" />
      <circle cx="72" cy="568" r="6" className="route-point route-start" />
      <circle cx="607" cy="95" r="8" className="route-point route-end" />
      <circle cx="390" cy="366" r="4" className="route-point route-stop" />
    </svg>
  );
}

function SpotCard({ location, onUpvote }) {
  const catSlug = location.category?.slug || '';
  const category = (location.categoryId === 'cat_trekking' || catSlug === 'trekking')
    ? 'Trail'
    : (location.categoryId === 'cat_abandoned' || catSlug === 'abandoned') ? 'Ruins' : 'Historic';
  return (
    <article className="spot-card is-visible">
      <Link className="spot-image-link" to={`/explore?focus=${location.id}`} aria-label={`Explore ${location.name}`}>
        <img src={location.images?.[0]} alt={`Landscape near ${location.name}`} loading="lazy" />
        <span className="spot-index">{category}</span>
        <span className="spot-open"><ArrowUpRight size={17} aria-hidden="true" /></span>
      </Link>
      <div className="spot-copy">
        <div className="spot-meta">
          <span><MapPin size={13} aria-hidden="true" /> {location.area || 'Bangalore outskirts'}</span>
          <span className="difficulty"><span className={`difficulty-dot ${location.difficulty}`} />{location.difficulty}</span>
        </div>
        <h3><Link to={`/explore?focus=${location.id}`}>{location.name}</Link></h3>
        <p>{location.description}</p>
        <div className="spot-footer">
          <span className="rating"><Star size={14} fill="currentColor" aria-hidden="true" /> {Number(location.rating || 0).toFixed(1)} <small>community rating</small></span>
          <button className="upvote-button" type="button" onClick={() => onUpvote(location.id)} aria-label={`Upvote ${location.name}`}>
            <Sparkles size={14} aria-hidden="true" /> {location.upvotes || 0}
          </button>
        </div>
      </div>
    </article>
  );
}

const STORY_PLACES = [
    {
      id: 'loc_savandurga',
      title: 'The granite opens up.',
      place: 'Savandurga Monolith Trek',
      note: 'A broad rock face, an exposed climb, and a long view over the Arkavathi basin. Go when the stone is dry, and give the heat a wide berth.',
      marker: '01 / OPEN COUNTRY',
      image: INITIAL_LOCATIONS.find((place) => place.id === 'loc_savandurga')?.images[0]
    },
    {
      id: 'loc_turahalli',
      title: 'The canopy closes in.',
      place: 'Turahalli Forest',
      note: 'A pocket of trees and granite at the city’s edge. Stay on established paths and leave room for the forest to stay quiet.',
      marker: '02 / UNDER THE CANOPY',
      image: INITIAL_LOCATIONS.find((place) => place.id === 'loc_turahalli')?.images[0]
    },
    {
      id: 'loc_skandagiri',
      title: 'Old walls meet first light.',
      place: 'Skandagiri Night Trek',
      note: 'Stone gateways and fort remains above the plains. Low cloud can erase familiar landmarks, so keep to the known route.',
      marker: '03 / FORT ABOVE THE CLOUDS',
      image: INITIAL_LOCATIONS.find((place) => place.id === 'loc_skandagiri')?.images[0]
    }
];

function TrailStory() {
  const storyRef = useRef(null);

  useLayoutEffect(() => {
    const root = storyRef.current;
    const stage = root?.querySelector('.story-stage');
    const deck = root?.querySelector('.story-deck');
    const route = root?.querySelector('.story-route-line');
    const currentNumber = root?.querySelector('.story-current-number');
    const chapters = gsap.utils.toArray(root?.querySelectorAll('.story-chapter') || []);
    if (!root || !stage || !deck || !chapters.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const context = gsap.context(() => {
      const driver = { value: 0 };
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.85,
          invalidateOnRefresh: true
        }
      });
      timeline.fromTo(deck,
        { rotateX: 9, rotateY: -16, yPercent: 5, scale: 0.88 },
        { rotateX: -5, rotateY: 16, yPercent: -5, scale: 1, ease: 'none' },
        0
      );
      if (route) timeline.to(route, { strokeDashoffset: -250, ease: 'none' }, 0);
      timeline.to(driver, {
        value: STORY_PLACES.length,
        ease: 'none',
        onUpdate: () => {
          const activeIndex = Math.min(STORY_PLACES.length - 1, Math.floor(driver.value));
          stage.dataset.scene = String(activeIndex);
          if (currentNumber) currentNumber.textContent = `0${activeIndex + 1}`;
          chapters.forEach((chapter, index) => {
            chapter.classList.toggle('is-active', index === activeIndex);
            if (index === activeIndex) chapter.setAttribute('aria-current', 'step');
            else chapter.removeAttribute('aria-current');
          });
        }
      }, 0);
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
          {STORY_PLACES.map((place, index) => (
            <article className={`story-chapter${index === 0 ? ' is-active' : ''}`} id={`trail-chapter-${index + 1}`} aria-current={index === 0 ? 'step' : undefined} key={place.id}>
              <div className="story-chapter-meta"><span>{place.marker}</span><span>0{index + 1} / 03</span></div>
              <h3>{place.title}</h3>
              <p className="story-place-name"><MapPin size={14} aria-hidden="true" /> {place.place}</p>
              <p className="story-chapter-note">{place.note}</p>
              <Link className="story-chapter-link" to={`/explore?focus=${place.id}`}>Read the field notes <ArrowRight size={15} /></Link>
              <a className="story-next" href={`#trail-chapter-${index === STORY_PLACES.length - 1 ? 1 : index + 2}`} aria-label={index === STORY_PLACES.length - 1 ? 'Return to the first story' : 'Continue to the next landscape'}><span>{index === STORY_PLACES.length - 1 ? 'START AGAIN' : 'NEXT LANDSCAPE'}</span><ArrowDown size={15} /></a>
            </article>
          ))}
        </div>
        <div className="story-stage" data-scene="0" aria-hidden="true">
        <div className="story-stage-header"><span><span className="story-stage-dot" /> FIELD STUDY / 03</span><span>SCROLL TO TRACE</span></div>
        <div className="story-stage-surface">
          <div className="story-contours"><Topography /></div>
          <div className="story-deck">
            {STORY_PLACES.map((place, index) => (
              <div className={`story-photo story-photo-${index}`} key={place.id}>
                <img src={place.image} alt="" loading={index === 0 ? 'eager' : 'lazy'} decoding="async" />
                <span className="story-photo-index">0{index + 1}</span>
              </div>
            ))}
            <div className="story-route-pin story-route-pin-start"><MapPin size={17} /></div>
            <div className="story-route-pin story-route-pin-end"><MapPin size={17} /></div>
          </div>
          <svg className="story-route-overlay" viewBox="0 0 700 620" aria-hidden="true">
            <path className="story-route-line" d="M90 505 C140 415 250 465 300 365 S420 315 440 242 S510 138 618 91" />
          </svg>
          <div className="story-coordinate story-coordinate-top">12° 58′ N<br />77° 35′ E</div>
          <div className="story-coordinate story-coordinate-bottom">FIELD NOTES<br /><b>BENGALURU EDGE</b></div>
        </div>
        <div className="story-stage-footer"><span>CONTOUR / <b><span className="story-current-number">01</span> — 03</b></span><span className="story-footer-bars"><i /><i /><i /></span></div>
      </div>
      </section>
    </>
  );
}

export default function Home() {
  const heroRef = useRef(null);
  const [locations, setLocations] = useState([]);
  const [category, setCategory] = useState('all');
  const [climate, setClimate] = useState({ season: 'winter', weather: 'sunny', temperature: '24°C' });
  const [season, setSeason] = useState('winter');
  useReveal([locations, category]);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.matchMedia('(max-width: 767px)').matches) return undefined;
    const map = hero.querySelector('.hero-map');
    const mapArt = hero.querySelector('.map-art');
    const mapImage = hero.querySelector('.map-landscape');
    const contours = hero.querySelector('.map-art .topography');
    const labels = hero.querySelectorAll('.map-label');
    const copy = hero.querySelector('.hero-copy');
    const sideNote = hero.querySelector('.hero-side-note');
    const bottomline = hero.querySelector('.hero-bottomline');
    const wash = hero.querySelector('.hero-transition-wash');
    const context = gsap.context(() => {
      gsap.set(map, { rotateY: -4, rotateX: 1, transformPerspective: 1500, transformStyle: 'preserve-3d' });
      gsap.set(mapArt, { transformPerspective: 1000, transformStyle: 'preserve-3d' });
      gsap.set(mapImage, { z: 0, scale: 1.025 });
      gsap.set(contours, { z: 22 });
      gsap.set(labels, { z: 42 });
      const transition = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '+=70%',
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true
        }
      });
      transition.to(map, { rotateX: 18, rotateY: -18, rotateZ: 3, z: -190, scale: .72, yPercent: -8, opacity: .28, ease: 'none' }, 0);
      transition.to(mapArt, { rotateX: -8, rotateY: 4, z: 55, scale: 1.04, ease: 'none' }, 0);
      transition.to(mapImage, { z: 24, scale: 1.13, ease: 'none' }, 0);
      transition.to(contours, { z: -36, scale: 1.16, opacity: .5, ease: 'none' }, 0);
      transition.to(labels, { z: 86, y: -5, ease: 'none' }, 0);
      transition.to(copy, { y: -72, z: -80, opacity: .12, ease: 'none' }, 0);
      transition.to([sideNote, bottomline], { opacity: .12, ease: 'none' }, 0);
      transition.to(wash, { opacity: .94, ease: 'none' }, 0);
    }, hero);
    return () => context.revert();
  }, []);

  const syncLocations = useCallback(() => {
    fetchLocations().then((locs) => {
      setLocations(locs.filter((location) => location.verificationStatus === 'verified'));
    });
  }, []);
  useEffect(() => {
    syncLocations();
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

  const featured = useMemo(() => {
    const filtered = locations.filter((location) => {
      if (category === 'all') return true;
      const slug = location.category?.slug || '';
      return location.categoryId === category || (slug && category.endsWith(slug));
    });
    return [...filtered].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)).slice(0, 3);
  }, [locations, category]);

  const updateClimate = (updates) => {
    const nextSeason = updates.season || season;
    const nextWeather = updates.weather || climate.weather;
    const temps = {
      summer: { sunny: '34°C', rainy: '27°C', overcast: '29°C', misty: '26°C' },
      monsoon: { sunny: '28°C', rainy: '22°C', overcast: '24°C', misty: '23°C' },
      winter: { sunny: '25°C', rainy: '21°C', overcast: '22°C', misty: '16°C' }
    };
    const next = { season: nextSeason, weather: nextWeather, temperature: temps[nextSeason][nextWeather] };
    setSeason(nextSeason);
    setClimate(next);
    setWeather(next);
  };

  const handleUpvote = (id) => {
    upvoteLocation(id);
    syncLocations();
  };

  const weatherWarning = climate.weather === 'rainy'
    ? 'Rain can turn exposed granite slick. Check each trail note before setting out.'
    : climate.weather === 'misty'
      ? 'Low visibility can hide trail markers. Keep to known paths and carry a light.'
      : climate.season === 'summer'
        ? 'Open rock heats quickly. Start early and carry enough water for the full route.'
        : 'Conditions are set for a clear day. Review access notes before you leave.';

  const wordStatement = 'A quieter way to get out there.';
  return (
    <div className="viewpoint-home">
        <section className="field-hero" ref={heroRef} aria-labelledby="hero-title">
          <div className="hero-inner">
            <div className="hero-copy">
              <div className="hero-kicker"><span className="live-mark" /> A field guide to Bangalore’s edges</div>
              <h1 id="hero-title"><span className="hero-title-line">Find the paths</span><span className="hero-title-line hero-title-accent">Bangalore forgot.</span></h1>
              <p className="hero-description">Community mapped trails, old forts, and quiet corners, with the conditions and local notes to help you go thoughtfully.</p>
              <div className="hero-actions">
                <Link to="/explore" className="button-primary"><Compass size={18} aria-hidden="true" /> Explore the map <ArrowRight size={16} aria-hidden="true" /></Link>
                <Link to="/add-location" className="text-link">Share a discovery <ArrowUpRight size={15} aria-hidden="true" /></Link>
              </div>
              <div className="hero-proof"><ShieldCheck size={15} aria-hidden="true" /><span>Community reviewed</span><i /> <span>Season aware</span><i /> <span>Built for the outdoors</span></div>
            </div>

            <div className="hero-map" role="group" aria-label="Layered field map with a landscape photograph and route sketch">
              <div className="map-header"><span><span className="map-live-dot" /> Field notes / 01</span><span>12°58′ N&nbsp;&nbsp; 77°35′ E</span></div>
              <div className="map-art">
                <img className="map-landscape" src={INITIAL_LOCATIONS.find((place) => place.id === 'loc_savandurga')?.images[0]} alt="" fetchPriority="high" />
                <Topography />
                <div className="map-label label-one"><span className="map-pin"><MapPin size={13} /></span><b>Turahalli</b><small>forest reserve</small></div>
                <div className="map-label label-two"><span className="map-pin"><MapPin size={13} /></span><b>Uttari Betta</b><small>fort trail</small></div>
                <div className="map-scale"><span>0</span><span className="scale-line" /><span>8 km</span></div>
                <div className="map-compass"><span>N</span><Compass size={20} /></div>
              </div>
              <div className="map-bottom"><div><small>FIELD CONDITION</small><strong>{climate.weather === 'sunny' ? 'Clear skies' : climate.weather === 'rainy' ? 'Rain advisory' : climate.weather === 'misty' ? 'Low visibility' : 'Overcast'}</strong></div><span className="map-bottom-icon"><Wind size={18} aria-hidden="true" /> {climate.temperature}</span></div>
              <Link to="/explore" className="map-expand" aria-label="Open the interactive map"><ArrowUpRight size={18} /></Link>
            </div>
            <div className="hero-side-note"><span>FIG. 01</span><span>Leave a place<br />as you found it.</span></div>
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
          <div className="statement-marker"><span>01</span><span>THE IDEA</span><span className="statement-rule" /></div>
          <p className="word-reveal">
            {wordStatement.split(' ').map((word, index) => <span key={`${word}-${index}`} style={{ '--word-index': index }}>{word}{index < wordStatement.split(' ').length - 1 ? ' ' : ''}</span>)}
          </p>
          <div className="statement-caption"><Trees size={17} aria-hidden="true" /><span>Good places are better when we take care of them.</span></div>
        </section>

        <TrailStory />

        <section className="discover-section" id="discover" aria-labelledby="discover-title">
          <div className="section-head reveal-on-scroll">
            <div><span className="section-index">03 / THE FIELD NOTES</span><h2 id="discover-title">Worth taking<br />the long way for.</h2></div>
            <p>Places shared by people who know the trails. Start with a favorite, then follow the map somewhere new.</p>
          </div>
          <div className="discovery-tools reveal-on-scroll">
            <div className="filter-list" role="group" aria-label="Filter discoveries by type">
              {categoryLabels.map((item) => <button key={item.id} type="button" className={category === item.id ? 'filter-chip active' : 'filter-chip'} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.label}</button>)}
            </div>
            <Link to="/trending" className="all-spots-link">See all discoveries <ArrowRight size={15} /></Link>
          </div>
          {featured.length > 0 ? <div className="spot-grid">{featured.map((location) => <SpotCard key={location.id} location={location} onUpvote={handleUpvote} />)}</div> : <div className="empty-spots"><Footprints size={28} /><p>No reviewed places in this category yet.</p><Link to="/add-location">Share the first discovery <ArrowRight size={15} /></Link></div>}
          <div className="section-footnote"><span>New here?</span><span>Every place starts with a note from someone who went.</span><Link to="/explore">Browse the full map <ArrowRight size={14} /></Link></div>
        </section>

        <section className="conditions-section" aria-labelledby="conditions-title">
          <div className="conditions-art" aria-hidden="true"><Topography /><div className="sun-disc" /><div className="ridge ridge-back" /><div className="ridge ridge-front" /><div className="ridge-route" /><span className="art-coordinate">12° 58′ 24″ N<br />77° 35′ 11″ E</span></div>
          <div className="conditions-content reveal-on-scroll">
            <span className="section-index">04 / BEFORE YOU GO</span>
            <h2 id="conditions-title">The same trail<br />can tell a new story.</h2>
            <p className="conditions-intro">Season and weather change the ground beneath your feet. Check the local notes before planning your route.</p>
            <div className="climate-panel">
              <div className="climate-top"><span>Plan for conditions</span><span className="climate-status"><span /> SIMULATOR</span></div>
              <div className="season-select">
                {['winter', 'summer', 'monsoon'].map((item) => <button type="button" key={item} onClick={() => updateClimate({ season: item })} aria-pressed={season === item} className={season === item ? 'season-option active' : 'season-option'}>{item}<span>{item === 'winter' ? 'NOV — FEB' : item === 'summer' ? 'MAR — MAY' : 'JUN — OCT'}</span></button>)}
              </div>
              <div className="weather-select" role="group" aria-label="Choose weather condition">
                {weatherOptions.map(({ value, label, icon: Icon }) => <button key={value} type="button" aria-label={`Set weather to ${label.toLowerCase()}`} aria-pressed={climate.weather === value} className={climate.weather === value ? 'weather-option active' : 'weather-option'} onClick={() => updateClimate({ weather: value })}><Icon size={17} aria-hidden="true" /><span>{label}</span></button>)}
              </div>
              <div className="condition-advisory"><ShieldCheck size={17} aria-hidden="true" /><p>{weatherWarning}</p></div>
              <div className="climate-source"><span>Updates the shared weather simulator</span><Check size={14} aria-hidden="true" /></div>
            </div>
            <Link to="/recommendations" className="conditions-link">See season matched spots <ArrowRight size={15} /></Link>
          </div>
        </section>

        <section className="process-section" aria-labelledby="process-title">
          <div className="process-heading reveal-on-scroll"><span className="section-index">05 / HOW IT WORKS</span><h2 id="process-title">A little local knowledge<br />goes a long way.</h2></div>
          <div className="process-steps">
            <article className="process-step reveal-on-scroll"><span className="step-number">01</span><Compass size={23} aria-hidden="true" /><h3>Find your way out</h3><p>Browse community notes on trails, forts, and places just beyond the usual route.</p></article>
            <article className="process-step reveal-on-scroll"><span className="step-number">02</span><ShieldCheck size={23} aria-hidden="true" /><h3>Read the ground</h3><p>Check difficulty, seasonal fit, and safety notes before choosing your day.</p></article>
            <article className="process-step reveal-on-scroll"><span className="step-number">03</span><MapPin size={23} aria-hidden="true" /><h3>Leave a better map</h3><p>Share what you found so the next person can explore with more care.</p></article>
          </div>
        </section>

        <section className="ethic-section">
          <div className="ethic-stamp"><ShieldCheck size={19} /><span>THE VIEWPOINT<br />FIELD CODE</span></div>
          <div className="ethic-copy"><span className="section-index">A NOTE FROM THE TRAIL</span><h2>Curiosity is a privilege.<br /><span>Care is part of the route.</span></h2><p>Stay on marked paths. Respect closures and private land. Carry out what you carry in. If a place feels fragile, let it rest.</p></div>
          <Link className="ethic-link" to="/explore">Explore with care <ArrowUpRight size={17} /></Link>
        </section>

        <section className="faq-section" aria-labelledby="faq-title">
          <div className="faq-heading reveal-on-scroll"><span className="section-index">06 / GOOD TO KNOW</span><h2 id="faq-title">A few things<br />before you go.</h2><p>Still curious? <Link to="/explore">Start with the map <ArrowUpRight size={13} /></Link></p></div>
          <div className="faq-list reveal-on-scroll">{questions.map(([question, answer], index) => <details className="faq-item" key={question}><summary><span className="faq-number">0{index + 1}</span><span>{question}</span><ChevronDown size={17} aria-hidden="true" /></summary><p>{answer}</p></details>)}</div>
        </section>

        <section className="closing-section">
          <div className="closing-contours" aria-hidden="true"><Topography /></div>
          <span className="section-index">WHEN YOU’RE READY</span>
          <h2>There’s more out there<br />than the usual route.</h2>
          <p>Pick a direction. We’ll help you find a thoughtful place to start.</p>
          <Link to="/explore" className="button-primary"><Compass size={18} aria-hidden="true" /> Open the field map <ArrowRight size={16} aria-hidden="true" /></Link>
        </section>
    </div>
  );
}
