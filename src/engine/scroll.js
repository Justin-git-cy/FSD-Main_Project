import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './env';

gsap.registerPlugin(ScrollTrigger);

let lenis = null;
let initialized = false;
const listeners = new Set();
const state = { y: 0, velocity: 0, progress: 0 };

function emit() {
  listeners.forEach((fn) => fn(state));
}

function nativeTick() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const y = window.scrollY || 0;
  state.velocity = y - state.y;
  state.y = y;
  state.progress = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
  emit();
}

export function initScroll() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  if (prefersReducedMotion()) {
    window.addEventListener('scroll', nativeTick, { passive: true });
    nativeTick();
    return;
  }

  lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 1,
    touchMultiplier: 1.2,
    anchors: true,
  });

  lenis.on('scroll', (l) => {
    state.y = l.scroll;
    state.velocity = l.velocity;
    state.progress = l.limit > 0 ? Math.min(1, Math.max(0, l.scroll / l.limit)) : 0;
    ScrollTrigger.update();
    emit();
  });

  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

export const onScroll = (fn) => {
  listeners.add(fn);
  fn(state);
  return () => listeners.delete(fn);
};

export const scrollState = () => state;
export const stopScroll = () => lenis?.stop();
export const startScroll = () => lenis?.start();

export function resetScroll() {
  if (lenis) {
    lenis.scrollTo(0, { immediate: true, force: true });
  } else if (typeof window !== 'undefined') {
    window.scrollTo(0, 0);
  }
  state.y = 0;
  state.velocity = 0;
  state.progress = 0;
  emit();
}

export function scrollToTarget(target) {
  if (lenis) {
    lenis.scrollTo(target, {
      duration: 1.2,
      easing: (t) => 1 - Math.pow(1 - t, 4),
    });
  } else if (typeof target === 'number') {
    window.scrollTo({ top: target });
  } else if (typeof target === 'string') {
    document.querySelector(target)?.scrollIntoView();
  } else if (target && typeof target.scrollIntoView === 'function') {
    target.scrollIntoView();
  }
}
