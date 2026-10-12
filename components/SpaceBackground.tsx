"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * BACKGROUND_MODE Configuration:
 * - "space": Minimal space theme with sparse, evenly distributed star layers, slow drift, and depth parallax.
 * - "black": Pure pitch black (#000000) background with only scroll-driven camera & reveals.
 * Switch this constant to "black" to immediately turn off stars and render pure black.
 */
export const BACKGROUND_MODE: 'space' | 'black' = 'space';

interface Waypoint {
  p: [number, number, number];
  t: [number, number, number];
  fov: number;
}

// Portfolio camera waypoints for sections: Hero (0), Work (1), About (2), Contact/Footer (3)
const WAYPOINTS: Waypoint[] = [
  { p: [0, 0, 16], t: [0, 0, 0], fov: 50 },         // Section 0: Hero
  { p: [1.6, -2.2, 13.5], t: [-0.4, -1.0, 0], fov: 48 }, // Section 1: Work / Featured
  { p: [-1.8, -4.5, 11.2], t: [0.5, -2.4, 0], fov: 46 }, // Section 2: About
  { p: [0, -6.8, 9.5], t: [0, -3.8, 0], fov: 45 },    // Section 3: Contact & Footer
];

// Frame-rate-independent damping (from Kage reference)
function damp(current: number, target: number, lambda: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export default function SpaceBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Check prefers-reduced-motion
    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduceMotion = reduceMotionQuery.matches;
    const onMotionChange = (e: MediaQueryListEvent) => {
      reduceMotion = e.matches;
    };
    reduceMotionQuery.addEventListener('change', onMotionChange);

    // Touch detection
    const isTouch =
      'ontouchstart' in window ||
      (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);

    // Viewport dimensions using document.documentElement.clientWidth to prevent overflow
    const getViewportWidth = () => document.documentElement.clientWidth || window.innerWidth;
    const getViewportHeight = () => window.innerHeight;

    let width = getViewportWidth();
    let height = getViewportHeight();

    // 1. Scene, Camera, Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      // WebGL unavailable fallback
      container.style.backgroundColor = '#05070a';
      return;
    }

    const dprCap = isTouch ? 1.25 : 1.5;
    let perfScale = 1.0;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap) * perfScale);
    renderer.setSize(width, height, false);
    renderer.setClearColor(BACKGROUND_MODE === 'black' ? 0x000000 : 0x030508, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(WAYPOINTS[0].fov, width / height, 0.1, 100);

    // 2. Camera Waypoint Splines (CatmullRom curves)
    const curveP = new THREE.CatmullRomCurve3(
      WAYPOINTS.map((w) => new THREE.Vector3(...w.p)),
      false,
      'catmullrom',
      0.4
    );
    const curveT = new THREE.CatmullRomCurve3(
      WAYPOINTS.map((w) => new THREE.Vector3(...w.t)),
      false,
      'catmullrom',
      0.4
    );

    // 3. Starfield Generation (Sparse, evenly distributed, 2-3 depth layers)
    let starMesh: THREE.Points | null = null;
    let starGeometry: THREE.BufferGeometry | null = null;
    let starMaterial: THREE.ShaderMaterial | null = null;

    if (BACKGROUND_MODE === 'space') {
      const starCount = isTouch ? 240 : 420;
      const positions = new Float32Array(starCount * 3);
      const phases = new Float32Array(starCount);
      const sizes = new Float32Array(starCount);

      // Distribute stars in 3 depth slabs [foreground: z -5 to 5, mid: z -15 to -5, deep: z -30 to -15]
      for (let i = 0; i < starCount; i++) {
        const layer = i % 3;
        let zMin = -10, zMax = 8;
        if (layer === 0) { zMin = -2; zMax = 8; }
        else if (layer === 1) { zMin = -18; zMax = -2; }
        else { zMin = -36; zMax = -18; }

        const spreadX = 28 + Math.abs(zMin) * 0.9;
        const spreadY = 24 + Math.abs(zMin) * 0.7;

        positions[i * 3 + 0] = (Math.random() - 0.5) * spreadX;
        positions[i * 3 + 1] = (Math.random() - 0.5) * spreadY - 2;
        positions[i * 3 + 2] = zMin + Math.random() * (zMax - zMin);

        phases[i] = Math.random() * Math.PI * 2;
        sizes[i] = layer === 0 ? 1.8 + Math.random() * 0.8 : (layer === 1 ? 1.3 + Math.random() * 0.6 : 0.9 + Math.random() * 0.5);
      }

      starGeometry = new THREE.BufferGeometry();
      starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      starGeometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
      starGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

      // Custom lightweight shader for subtle twinkle without heavy textures or per-frame cpu allocations
      starMaterial = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: renderer.getPixelRatio() },
        },
        vertexShader: `
          uniform float uTime;
          uniform float uPixelRatio;
          attribute float aPhase;
          attribute float aSize;
          varying float vAlpha;

          void main() {
            vec3 pos = position;
            // Very slow ambient drift
            pos.y += sin(uTime * 0.12 + aPhase) * 0.10;
            pos.x += cos(uTime * 0.08 + aPhase * 0.7) * 0.06;

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvPosition;

            // Twinkle: calm, gentle oscillation between 0.45 and 0.85 (not flashy)
            vAlpha = 0.48 + 0.35 * sin(uTime * 0.7 + aPhase);

            // Size attenuated by distance
            gl_PointSize = aSize * uPixelRatio * (25.0 / -mvPosition.z);
            gl_PointSize = clamp(gl_PointSize, 1.0, 5.5);
          }
        `,
        fragmentShader: `
          varying float vAlpha;

          void main() {
            // Soft circular falloff
            vec2 coord = gl_PointCoord - vec2(0.5);
            float dist = length(coord);
            if (dist > 0.5) discard;

            float intensity = smoothstep(0.5, 0.0, dist);
            // Crisp near-white core with subtle cyan/silver tint
            vec3 color = mix(vec3(0.85, 0.92, 1.0), vec3(1.0), intensity * 0.8);
            gl_FragColor = vec4(color, vAlpha * intensity);
          }
        `,
      });

      starMesh = new THREE.Points(starGeometry, starMaterial);
      scene.add(starMesh);
    }

    // 4. Section Anchors & Scroll Progress
    const getSections = () => {
      const ids = ['hero', 'work', 'about'];
      return ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    };

    let anchors: number[] = [0, 800, 1600, 2400];
    const measure = () => {
      const vh = window.innerHeight;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
      const sections = getSections();

      if (sections.length >= 3) {
        anchors = [
          0,
          clamp(sections[1].offsetTop - vh * 0.25, 0, maxScroll),
          clamp(sections[2].offsetTop - vh * 0.25, 0, maxScroll),
          maxScroll,
        ];
      } else {
        anchors = [0, maxScroll * 0.33, maxScroll * 0.66, maxScroll];
      }

      for (let i = 1; i < anchors.length; i++) {
        anchors[i] = Math.max(anchors[i], anchors[i - 1] + 1);
      }
    };
    measure();

    const progressFor = (y: number): number => {
      if (y <= anchors[0]) return 0;
      for (let i = 0; i < anchors.length - 1; i++) {
        if (y <= anchors[i + 1]) {
          return i + (y - anchors[i]) / (anchors[i + 1] - anchors[i]);
        }
      }
      return anchors.length - 1;
    };

    // 5. Rig State (Parallax, Progress, Damping)
    const rig = {
      prog: 0,
      smooth: 0,
      mx: 0,
      my: 0,
      tmx: 0,
      tmy: 0,
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isTouch || reduceMotion) return;
      const w = getViewportWidth();
      const h = getViewportHeight();
      rig.tmx = (e.clientX / w) * 2 - 1;
      rig.tmy = -((e.clientY / h) * 2 - 1);
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // 6. Camera Position Scratch Objects (No per-frame garbage)
    const tmpPos = new THREE.Vector3();
    const tmpTarget = new THREE.Vector3();

    const applyCamera = () => {
      const maxIdx = WAYPOINTS.length - 1;
      const u = clamp(rig.smooth / maxIdx, 0, 1);

      curveP.getPoint(u, tmpPos);
      curveT.getPoint(u, tmpTarget);

      const i = clamp(Math.floor(rig.smooth), 0, maxIdx - 1);
      const frac = clamp(rig.smooth - i, 0, 1);
      const fov = lerp(WAYPOINTS[i].fov, WAYPOINTS[i + 1].fov, frac);

      // Add subtle pointer parallax (scaled down so it never breaks framing)
      if (!isTouch && !reduceMotion) {
        const parWeight = 1.0 - clamp(rig.smooth / 3.0, 0, 0.4);
        tmpPos.x += rig.mx * 0.5 * parWeight;
        tmpPos.y += rig.my * 0.3 * parWeight;
        tmpTarget.x -= rig.mx * 0.15 * parWeight;
        tmpTarget.y -= rig.my * 0.10 * parWeight;
      }

      camera.position.copy(tmpPos);
      camera.lookAt(tmpTarget);

      if (Math.abs(camera.fov - fov) > 0.01) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }
    };

    // 7. Adaptive Quality Governor & Render Loop
    let isRunning = true;
    let lastTime = performance.now();
    let clock = 0;
    let perfAcc = 0;
    let perfFrames = 0;
    let rafId: number;

    const handleResize = () => {
      width = getViewportWidth();
      height = getViewportHeight();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap) * perfScale);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      if (starMaterial) {
        starMaterial.uniforms.uPixelRatio.value = renderer.getPixelRatio();
      }
      measure();
    };
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', () => setTimeout(handleResize, 200));

    // Handle Tab Visibility (Pause rendering when hidden)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isRunning = false;
      } else {
        if (!isRunning) {
          isRunning = true;
          lastTime = performance.now();
          rafId = requestAnimationFrame(loop);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // WebGL Context Lost recovery
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      isRunning = false;
      container.style.backgroundColor = '#030508';
    };
    const handleContextRestored = () => {
      isRunning = true;
      lastTime = performance.now();
      rafId = requestAnimationFrame(loop);
    };
    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

    // Main animation loop
    const loop = (now: number) => {
      if (!isRunning) return;

      const rawDt = (now - lastTime) / 1000 || 0;
      const dt = Math.min(rawDt, 0.05); // Never jump animation
      lastTime = now;
      clock += dt;

      // Quality governor: monitor average frame time
      if (clock > 2.0) {
        perfAcc += rawDt;
        perfFrames++;
        if (perfFrames >= 40) {
          const avgFrameTime = perfAcc / perfFrames;
          perfAcc = 0;
          perfFrames = 0;
          // If frame time > ~24ms (dropping below ~42fps), adaptively lower scale
          if (avgFrameTime > 0.024 && perfScale > 0.65) {
            perfScale = Math.max(0.65, perfScale * 0.85);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap) * perfScale);
            if (starMaterial) starMaterial.uniforms.uPixelRatio.value = renderer.getPixelRatio();
          }
        }
      }

      // Read scroll progress once per frame (passive, no layout thrashing)
      const scrollY = window.scrollY || window.pageYOffset || 0;
      rig.prog = progressFor(scrollY);
      rig.smooth = reduceMotion ? rig.prog : damp(rig.smooth, rig.prog, 4.2, dt);
      rig.mx = reduceMotion ? 0 : damp(rig.mx, rig.tmx, 2.5, dt);
      rig.my = reduceMotion ? 0 : damp(rig.my, rig.tmy, 2.5, dt);

      applyCamera();

      if (starMaterial) {
        starMaterial.uniforms.uTime.value = reduceMotion ? 0 : clock;
      }

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    // 8. Cleanup
    return () => {
      isRunning = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      reduceMotionQuery.removeEventListener('change', onMotionChange);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);

      if (starGeometry) starGeometry.dispose();
      if (starMaterial) starMaterial.dispose();
      if (starMesh) scene.remove(starMesh);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none select-none z-0"
      style={{
        backgroundColor: BACKGROUND_MODE === 'black' ? '#000000' : '#030508',
        width: '100vw',
        height: '100dvh',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
}
