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

/* =========================================================================
   OFFICIAL GSAP horizontalLoop HELPER PATTERN
   ========================================================================= */
function horizontalLoop(items: HTMLElement[], config: any = {}) {
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
        const i = (tl as any).closestIndex();
        if (lastIndex !== i) {
          lastIndex = i;
          onChange(elements[i], i);
        }
      },
  });

  const length = elements.length;
  const startX = elements[0].offsetLeft;
  const times: number[] = [];
  const widths: number[] = [];
  const spaceBefore: number[] = [];
  const xPercents: number[] = [];
  let curIndex = 0;
  const pixelsPerSecond = (config.speed || 1) * 35; // ~35px/sec slow drift
  const snap = config.snap === false ? (v: number) => v : gsap.utils.snap(config.snap || 1);

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

  (tl as any).toIndex = (index: number, vars: any) => toIndex(index, vars);
  (tl as any).times = times;
  tl.progress(1, true).progress(0, true);

  function toIndex(index: number, vars: any = {}) {
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
  const autoDriftTlRef = useRef<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  useEffect(() => {
    // 1. Register GSAP Plugins
    gsap.registerPlugin(Draggable);

    // 2. White Flash Intro on Page Load
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

    // 3. Continuous Horizontal Auto-Drift using GSAP horizontalLoop Helper
    if (trackRef.current) {
      const cards = Array.from(trackRef.current.children) as HTMLElement[];
      const autoDriftTl = horizontalLoop(cards, {
        speed: 1.0, // ~35px/sec constant drift speed
        repeat: -1,
        paused: false,
      });

      autoDriftTlRef.current = autoDriftTl;

      // 4. Manual Drag with Velocity-Based Momentum
      const triggerEl = containerRef.current;
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
    }

    return () => {
      if (autoDriftTlRef.current) {
        autoDriftTlRef.current.kill();
      }
    };
  }, []);

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
          {mediaItems.map((item) => (
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
