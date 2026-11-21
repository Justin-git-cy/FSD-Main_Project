import { gsap } from 'gsap';
import { prefersReducedMotion, isTouch } from './env';
import { onScroll } from './scroll';

export const idle = { t: 0, x: 0, y: 0 };

let started = false;

export function startIdle() {
  if (started || typeof window === 'undefined' || prefersReducedMotion()) return;
  started = true;

  const touch = isTouch();
  const aim = { x: 0, y: 0 };

  if (touch) {
    onScroll(({ velocity }) => {
      aim.y = gsap.utils.clamp(-0.5, 0.5, velocity / 40);
    });
  } else {
    window.addEventListener(
      'pointermove',
      (e) => {
        aim.x = e.clientX / window.innerWidth - 0.5;
        aim.y = e.clientY / window.innerHeight - 0.5;
      },
      { passive: true }
    );
  }

  gsap.ticker.add((t) => {
    const r = gsap.ticker.deltaRatio();
    if (touch) aim.y *= Math.pow(0.9, r);
    const k = 1 - Math.pow(0.94, r);
    idle.t = t;
    idle.x += (aim.x - idle.x) * k;
    idle.y += (aim.y - idle.y) * k;
  });
}
