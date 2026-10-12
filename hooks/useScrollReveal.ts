"use client";

import { useEffect } from 'react';

export function useScrollReveal() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Split words in display headings if tagged with data-reveal-words
    const wordRevealTargets = document.querySelectorAll<HTMLElement>('[data-reveal-words]:not([data-word-ready="true"])');
    wordRevealTargets.forEach((target) => {
      const phrase = (target.textContent || '').replace(/\s+/g, ' ').trim();
      if (!phrase) return;
      target.dataset.wordReady = 'true';
      target.classList.add('word-reveal');
      target.setAttribute('aria-label', phrase);
      target.textContent = '';

      phrase.split(' ').forEach((word, i) => {
        if (i > 0) target.appendChild(document.createTextNode(' '));
        const mask = document.createElement('span');
        mask.className = 'word-mask';
        mask.setAttribute('aria-hidden', 'true');
        const inner = document.createElement('span');
        inner.className = 'word';
        inner.textContent = word;
        inner.style.setProperty('--word-delay', `${i * 65}ms`);
        mask.appendChild(inner);
        target.appendChild(mask);
      });
    });

    // Group items for staggered arrival
    const groups = new Map<HTMLElement, HTMLElement[]>();
    const items = Array.from(document.querySelectorAll<HTMLElement>('[data-rv], .mask-line, .word-reveal'));

    items.forEach((el) => {
      const parent = el.parentElement;
      if (!parent) return;
      const list = groups.get(parent) || [];
      list.push(el);
      groups.set(parent, list);
    });

    groups.forEach((list) => {
      list.forEach((el, index) => {
        el.dataset.rvd = String(index * 75);
      });
    });

    if (reduceMotion) {
      items.forEach((el) => el.classList.add('rv-in'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target as HTMLElement;
          observer.unobserve(target);
          const delay = parseFloat(target.dataset.rvd || '0');
          setTimeout(() => {
            target.classList.add('rv-in');
          }, delay);
        });
      },
      {
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.05,
      }
    );

    items.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);
}
