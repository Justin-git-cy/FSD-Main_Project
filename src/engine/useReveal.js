import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ease, prefersReducedMotion } from './env';

gsap.registerPlugin(ScrollTrigger);

export function useReveal(containerRef, deps = []) {
  useEffect(() => {
    const root = containerRef?.current || document;
    if (!root || prefersReducedMotion()) {
      root.querySelectorAll('[data-counter]').forEach((el) => {
        const target = el.getAttribute('data-counter');
        if (target !== null) el.textContent = target;
      });
      return undefined;
    }

    const ctx = gsap.context(() => {
      // Block reveals
      root.querySelectorAll('[data-reveal]').forEach((el) => {
        const kind = el.getAttribute('data-reveal') || 'up';
        const delay = parseFloat(el.getAttribute('data-delay') || '0');
        const rect = el.getBoundingClientRect();
        const inView = rect.top < window.innerHeight * 0.92;

        if (inView) {
          gsap.fromTo(
            el,
            kind === 'fade'
              ? { autoAlpha: 0 }
              : { autoAlpha: 0, y: 20 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.75,
              delay,
              ease: ease.out,
              clearProps: 'transform,opacity,visibility',
            }
          );
          return;
        }

        const fromVars =
          kind === 'fade'
            ? { autoAlpha: 0 }
            : kind === 'clip'
              ? { clipPath: 'inset(0% 0% 100% 0%)', autoAlpha: 1 }
              : { y: 32, autoAlpha: 0 };

        const toVars =
          kind === 'clip'
            ? { clipPath: 'inset(0% 0% 0% 0%)' }
            : { y: 0, autoAlpha: 1 };

        gsap.fromTo(el, fromVars, {
          ...toVars,
          duration: kind === 'fade' ? 0.75 : 0.95,
          delay,
          ease: ease.out,
          clearProps: 'transform,clipPath,opacity,visibility',
          scrollTrigger: {
            trigger: el,
            start: 'top 92%',
            once: true,
          },
        });
      });

      // Parallax drifts
      root.querySelectorAll('[data-parallax]').forEach((el) => {
        const amount = parseFloat(el.getAttribute('data-parallax') || '0.12');
        gsap.fromTo(
          el,
          { yPercent: -amount * 100 },
          {
            yPercent: amount * 100,
            ease: 'none',
            scrollTrigger: {
              trigger: el.parentElement || el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      });

      // Real numeric counters
      root.querySelectorAll('[data-counter]').forEach((el) => {
        const target = parseFloat(el.getAttribute('data-counter') || '0');
        const decimals = (el.getAttribute('data-counter') || '').includes('.') ? 1 : 0;
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.25,
          ease: ease.out,
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            once: true,
          },
          onUpdate: () => {
            el.textContent = decimals ? obj.v.toFixed(1) : String(Math.round(obj.v));
          },
        });
      });
    }, root);

    const refreshId = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(refreshId);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
