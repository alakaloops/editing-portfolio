"use client";
import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import styles from './Carousel.module.css';

export type MediaItem = {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  src: string;
  duration?: string;
  isPlaceholder?: boolean;
};

/* =========================================================================
   ASSETS ARRAY: 4 Provided User Assets + 4 White Placeholder Slots
   ========================================================================= */
export const mediaItems: MediaItem[] = [
  {
    id: '5',
    title: 'Visual Edit 05',
    category: 'After Effects / VFX',
    thumbnail: '',
    src: '/videos/edit5.mp4',
    duration: '0:30',
  },
  {
    id: '6',
    title: 'Visual Edit 06',
    category: 'Cinematic Motion',
    thumbnail: '',
    src: '/videos/edit6.mp4',
    duration: '0:45',
  },
  {
    id: '7',
    title: 'Visual Edit 07',
    category: 'Rhythm & Color',
    thumbnail: '',
    src: '/videos/edit7.mp4',
    duration: '0:40',
  },
  {
    id: '8',
    title: 'Visual Edit 08',
    category: 'CapCut / Dynamics',
    thumbnail: '',
    src: '/videos/edit8.mp4',
    duration: '0:35',
  },
  {
    id: '10',
    title: 'Visual Edit 10',
    category: 'Visual Composition',
    thumbnail: '',
    src: '/videos/edit10.mp4',
    duration: '0:50',
  },
  {
    id: '11',
    title: 'Visual Edit 11',
    category: 'VFX Showcase',
    thumbnail: '',
    src: '/videos/edit11.mp4',
    duration: '1:05',
  },
  {
    id: '12',
    title: 'Visual Edit 12',
    category: 'High-Energy Edit',
    thumbnail: '',
    src: '/videos/edit12.mp4',
    duration: '0:25',
  },
  {
    id: '1',
    title: 'Shadow Edit 01',
    category: 'Creative Cut',
    thumbnail: '',
    src: '/videos/edit1.mp4',
    duration: '0:45',
  },
];

interface LoopConfig {
  repeat?: number;
  paused?: boolean;
  speed?: number;
  snap?: number | false | ((value: number) => number);
  paddingRight?: number;
  reversed?: boolean;
  onChange?: (item: HTMLElement, index: number) => void;
}

export type LoopTimeline = gsap.core.Timeline & {
  toIndex?: (index: number, vars?: gsap.TweenVars) => gsap.core.Tween;
  times?: number[];
  closestIndex?: () => number;
};

/* =========================================================================
   OFFICIAL GSAP horizontalLoop HELPER PATTERN
   ========================================================================= */
function horizontalLoop(items: HTMLElement[], config: LoopConfig = {}) {
  const elements = gsap.utils.toArray(items) as HTMLElement[];
  if (!elements.length) return null;

  const onChange = config.onChange;
  let lastIndex = 0;
  const tl = gsap.timeline({
    repeat: config.repeat ?? -1,
    paused: config.paused,
    defaults: { ease: 'none' },
    onUpdate:
      onChange &&
      function () {
        const i = (tl as LoopTimeline).closestIndex?.() ?? 0;
        if (lastIndex !== i) {
          lastIndex = i;
          onChange(elements[i], i);
        }
      },
  }) as LoopTimeline;

  const length = elements.length;
  const startX = elements[0].offsetLeft;
  const times: number[] = [];
  const widths: number[] = [];
  const spaceBefore: number[] = [];
  const xPercents: number[] = [];
  let curIndex = 0;
  const pixelsPerSecond = (config.speed || 1) * 35; // ~35px/sec slow drift
  const snap = config.snap === false ? (v: number) => v : gsap.utils.snap((config.snap as number) || 1);

  const populateWidths = () => {
    const b1 = elements[0].getBoundingClientRect();
    elements.forEach((el, i) => {
      widths[i] = parseFloat(gsap.getProperty(el, 'width', 'px') as string);
      xPercents[i] = snap(
        (parseFloat(gsap.getProperty(el, 'x', 'px') as string) / widths[i]) * 100 +
          (parseFloat(gsap.getProperty(el, 'xPercent') as string) || 0)
      );
      const b2 = el.getBoundingClientRect();
      spaceBefore[i] = b2.left - (i ? b2.left : b1.left);
    });
    gsap.set(elements, {
      xPercent: (i: number) => xPercents[i],
    });
  };

  populateWidths();
  gsap.set(elements, { x: 0 });

  const totalWidth =
    elements[length - 1].offsetLeft +
    (xPercents[length - 1] / 100) * widths[length - 1] -
    startX +
    spaceBefore[length - 1] +
    parseFloat(gsap.getProperty(elements[length - 1], 'width', 'px') as string) *
      (parseFloat(gsap.getProperty(elements[length - 1], 'scaleX') as string) || 1);

  for (let i = 0; i < length; i++) {
    const item = elements[i];
    const curX = (xPercents[i] / 100) * widths[i];
    const distanceToStart = item.offsetLeft + curX - startX;
    const distanceToLoop = distanceToStart + widths[i] * (parseFloat(gsap.getProperty(item, 'scaleX') as string) || 1);

    tl.to(
      item,
      {
        xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
        duration: distanceToLoop / pixelsPerSecond,
      },
      0
    )
      .fromTo(
        item,
        {
          xPercent: snap(((curX - distanceToLoop + totalWidth) / widths[i]) * 100),
        },
        {
          xPercent: xPercents[i],
          duration: (totalWidth - distanceToLoop) / pixelsPerSecond,
          immediateRender: false,
        },
        distanceToLoop / pixelsPerSecond
      )
      .add('label' + i, distanceToStart / pixelsPerSecond);
    times[i] = distanceToStart / pixelsPerSecond;
  }

  tl.toIndex = (index: number, vars: gsap.TweenVars = {}) => toIndex(index, vars);
  tl.times = times;
  tl.progress(1, true).progress(0, true);

  function toIndex(index: number, vars: gsap.TweenVars = {}) {
    if (Math.abs(index - curIndex) > length / 2) {
      index += index > curIndex ? -length : length;
    }
    const newIndex = gsap.utils.wrap(0, length, index);
    let time = times[newIndex];
    if (time > tl.time() !== index > curIndex && index !== curIndex) {
      time += tl.duration() * (index > curIndex ? 1 : -1);
    }
    if (time < 0 || time > tl.duration()) {
      vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
    }
    curIndex = newIndex;
    vars.overwrite = true;
    return tl.tweenTo(time, vars);
  }

  return tl;
}

export default function Carousel({ onSelect }: { onSelect: (item: MediaItem) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const autoDriftTlRef = useRef<LoopTimeline | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [items, setItems] = useState<MediaItem[]>(mediaItems);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  // 1. Fetch Dynamic Edits from API (with fallback to default mediaItems)
  useEffect(() => {
    let isMounted = true;
    const fetchLatestEdits = async () => {
      try {
        const res = await fetch('/api/edits');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0 && isMounted) {
            setItems(data);
          }
        }
      } catch {
        // Fallback to static mediaItems
      }
    };

    fetchLatestEdits();

    const handleEditsUpdated = () => {
      fetchLatestEdits();
    };

    window.addEventListener('edits-updated', handleEditsUpdated);
    window.addEventListener('storage', handleEditsUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener('edits-updated', handleEditsUpdated);
      window.removeEventListener('storage', handleEditsUpdated);
    };
  }, []);

  // 2. White Flash Intro on Page Load (Once)
  useEffect(() => {
    if (flashRef.current) {
      gsap.timeline()
        .to(flashRef.current, {
          duration: 0.1,
          opacity: 1,
        })
        .to(flashRef.current, {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          onComplete: () => {
            if (flashRef.current) {
              flashRef.current.style.display = 'none';
            }
          },
        });

      if (containerRef.current) {
        gsap.fromTo(
          containerRef.current,
          { scale: 0.97, opacity: 0.8 },
          { scale: 1, opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.1 }
        );
      }
    }
  }, []);

  // 3. Continuous Horizontal Auto-Drift & Drag for Items
  useEffect(() => {
    gsap.registerPlugin(Draggable);

    if (!trackRef.current) return;
    const cards = Array.from(trackRef.current.children) as HTMLElement[];
    if (cards.length === 0) return;

    // Clean up previous timeline and draggable instances
    const triggerEl = containerRef.current;
    if (autoDriftTlRef.current) {
      autoDriftTlRef.current.kill();
      autoDriftTlRef.current = null;
    }
    if (triggerEl) {
      Draggable.get(triggerEl)?.kill();
    }

    const autoDriftTl = horizontalLoop(cards, {
      speed: 1.0, // ~35px/sec constant drift speed
      repeat: -1,
      paused: false,
    });

    autoDriftTlRef.current = autoDriftTl;

    // Manual Drag with Velocity-Based Momentum
    if (triggerEl && autoDriftTl) {
      let startX = 0;
      let lastDragX = 0;
      let lastTime = 0;
      let dragVelocity = 0;

      Draggable.create(triggerEl, {
        type: 'x',
        onDragStart() {
          autoDriftTl.pause();
          startX = this.x;
          lastDragX = this.x;
          lastTime = performance.now();
          dragVelocity = 0;
          setIsDragging(false);
        },
        onDrag() {
          const now = performance.now();
          const dt = now - lastTime || 16;
          const dx = this.x - lastDragX;
          dragVelocity = dx / dt; // px/ms
          lastDragX = this.x;
          lastTime = now;

          if (Math.abs(this.x - startX) > 5) {
            setIsDragging(true);
          }
        },
        onDragEnd() {
          // Velocity-based release momentum simulation
          const momentumX = dragVelocity * 300;
          gsap.to(trackRef.current, {
            x: `+=${momentumX}`,
            duration: 0.8,
            ease: 'power2.out',
            onComplete: () => {
              if (autoDriftTlRef.current) {
                autoDriftTlRef.current.play();
                gsap.to(autoDriftTlRef.current, { timeScale: 1, duration: 0.5, ease: 'power2.out' });
              }
            },
          });
          setTimeout(() => setIsDragging(false), 50);
        },
      });
    }

    return () => {
      if (autoDriftTlRef.current) {
        autoDriftTlRef.current.kill();
      }
      if (triggerEl) {
        Draggable.get(triggerEl)?.kill();
      }
    };
  }, [items]);

  // 5. Hover Pause on Auto-Drift (Ramp timeScale to ~0.15 on hover, back to 1 on leave)
  const handleCarouselMouseEnter = () => {
    if (autoDriftTlRef.current) {
      gsap.to(autoDriftTlRef.current, {
        timeScale: 0.15,
        duration: 0.5,
        ease: 'power2.out',
      });
    }
  };

  const handleCarouselMouseLeave = () => {
    if (autoDriftTlRef.current) {
      gsap.to(autoDriftTlRef.current, {
        timeScale: 1,
        duration: 0.5,
        ease: 'power2.out',
      });
    }
  };

  // 6. Card Hover Treatment via GSAP Only (Scale to 1.04, Grayscale 1 -> 0, Video Play/Pause)
  const handleCardMouseEnter = (e: React.MouseEvent<HTMLDivElement>, item: MediaItem) => {
    const cardEl = e.currentTarget;
    const playOverlay = cardEl.querySelector(`.${styles.playOverlay}`);

    gsap.to(cardEl, {
      scale: 1.04,
      filter: 'grayscale(0)',
      duration: 0.5,
      ease: 'power2.out',
      transformOrigin: 'center center',
    });

    if (playOverlay) {
      gsap.to(playOverlay, { opacity: 1, duration: 0.3, ease: 'power2.out' });
    }

    // Play video on hover if video element exists
    const videoEl = videoRefs.current[item.id];
    if (videoEl) {
      videoEl.play().catch(() => {});
    }
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>, item: MediaItem) => {
    const cardEl = e.currentTarget;
    const playOverlay = cardEl.querySelector(`.${styles.playOverlay}`);

    gsap.to(cardEl, {
      scale: 1.0,
      filter: 'grayscale(0.8)',
      duration: 0.5,
      ease: 'power2.out',
      transformOrigin: 'center center',
    });

    if (playOverlay) {
      gsap.to(playOverlay, { opacity: 0, duration: 0.3, ease: 'power2.out' });
    }

    // Pause video on mouse leave
    const videoEl = videoRefs.current[item.id];
    if (videoEl) {
      videoEl.pause();
      videoEl.currentTime = 0;
    }
  };

  return (
    <>
      {/* 1. White Flash Intro Overlay */}
      <div className={styles.flashOverlay} ref={flashRef} />

      {/* 2. Hero Carousel Container */}
      <div
        className={styles.carouselWrapper}
        ref={containerRef}
        onMouseEnter={handleCarouselMouseEnter}
        onMouseLeave={handleCarouselMouseLeave}
      >
        <div className={styles.track} ref={trackRef}>
          {items.map((item) => (
            <div
              key={item.id}
              className={`${styles.card} ${item.isPlaceholder ? styles.cardPlaceholder : ''}`}
              onMouseEnter={(e) => handleCardMouseEnter(e, item)}
              onMouseLeave={(e) => handleCardMouseLeave(e, item)}
              onClick={() => {
                if (!isDragging && !item.isPlaceholder) {
                  onSelect(item);
                }
              }}
            >
              {item.isPlaceholder ? (
                /* White Placeholder Card for Future Assets */
                <>
                  <div className={styles.placeholderMedia}>
                    <span className={styles.placeholderPlus}>+</span>
                    <span className={styles.placeholderLabel}>Add Asset</span>
                  </div>
                  <div className={styles.cardContent}>
                    <p className={styles.category}>{item.category}</p>
                    <h3 className={styles.title}>{item.title}</h3>
                  </div>
                </>
              ) : (
                /* Uploaded Video Asset Card */
                <>
                  <div className={styles.imageContainer}>
                    {item.src ? (
                      <video
                        ref={(el) => { videoRefs.current[item.id] = el; }}
                        src={`${item.src}#t=0.001`}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className={styles.cardVideo}
                      />
                    ) : (
                      <img src={item.thumbnail} alt={item.title} className={styles.thumbnail} />
                    )}
                    <div className={styles.playOverlay}>
                      <div className={styles.playIcon}>PLAY</div>
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <p className={styles.category}>{item.category}</p>
                    <h3 className={styles.title}>{item.title}</h3>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
