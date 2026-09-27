"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { gsap } from 'gsap';
import styles from './SphereGallery.module.css';

export type SphereItem = {
  id: string;
  title: string;
  type: 'image' | 'video';
  thumbnail: string;
  src: string;
};

// 4 Provided User Assets + Additional Generated Portfolio Assets
const sphereItems: SphereItem[] = [
  {
    id: '1',
    title: 'Visual Edit 05',
    type: 'video',
    thumbnail: '/thumbnails/edit5.jpg',
    src: '/videos/edit5.mp4',
  },
  {
    id: '2',
    title: 'Visual Edit 06',
    type: 'video',
    thumbnail: '/thumbnails/edit6.jpg',
    src: '/videos/edit6.mp4',
  },
  {
    id: '3',
    title: 'Visual Edit 07',
    type: 'video',
    thumbnail: '/thumbnails/edit7.jpg',
    src: '/videos/edit7.mp4',
  },
  {
    id: '4',
    title: 'Visual Edit 08',
    type: 'video',
    thumbnail: '/thumbnails/edit8.jpg',
    src: '/videos/edit8.mp4',
  },
  {
    id: '5',
    title: 'Artwork Frame 05',
    type: 'image',
    thumbnail: '/thumbnails/edit1.jpg',
    src: '/thumbnails/edit1.jpg',
  },
  {
    id: '6',
    title: 'Artwork Frame 06',
    type: 'image',
    thumbnail: '/thumbnails/edit2.jpg',
    src: '/thumbnails/edit2.jpg',
  },
  {
    id: '7',
    title: 'Artwork Frame 07',
    type: 'image',
    thumbnail: '/thumbnails/edit3.jpg',
    src: '/thumbnails/edit3.jpg',
  },
  {
    id: '8',
    title: 'Artwork Frame 08',
    type: 'image',
    thumbnail: '/thumbnails/edit4.jpg',
    src: '/thumbnails/edit4.jpg',
  },
  {
    id: '9',
    title: 'Visual Edit 10',
    type: 'video',
    thumbnail: '/thumbnails/edit10.jpg',
    src: '/videos/edit10.mp4',
  },
  {
    id: '10',
    title: 'Visual Edit 11',
    type: 'video',
    thumbnail: '/thumbnails/edit11.jpeg',
    src: '/videos/edit11.mp4',
  },
  {
    id: '11',
    title: 'Artwork Frame 11',
    type: 'image',
    thumbnail: '/thumbnails/edit3.jpg',
    src: '/thumbnails/edit3.jpg',
  },
  {
    id: '12',
    title: 'Artwork Frame 12',
    type: 'image',
    thumbnail: '/thumbnails/edit4.jpg',
    src: '/thumbnails/edit4.jpg',
  },
  {
    id: '13',
    title: 'Visual Edit 12',
    type: 'video',
    thumbnail: '/thumbnails/edit12.jpeg',
    src: '/videos/edit12.mp4',
  },
  {
    id: '14',
    title: 'Visual Edit 05',
    type: 'video',
    thumbnail: '/thumbnails/edit5.jpg',
    src: '/videos/edit5.mp4',
  },
  {
    id: '15',
    title: 'Artwork Frame 15',
    type: 'image',
    thumbnail: '/thumbnails/edit3.jpg',
    src: '/thumbnails/edit3.jpg',
  },
  {
    id: '16',
    title: 'Artwork Frame 16',
    type: 'image',
    thumbnail: '/thumbnails/edit4.jpg',
    src: '/thumbnails/edit4.jpg',
  },
  {
    id: '17',
    title: 'Visual Edit 05',
    type: 'video',
    thumbnail: '/thumbnails/edit5.jpg',
    src: '/videos/edit5.mp4',
  },
  {
    id: '18',
    title: 'Visual Edit 06',
    type: 'video',
    thumbnail: '/thumbnails/edit6.jpg',
    src: '/videos/edit6.mp4',
  },
  {
    id: '19',
    title: 'Visual Edit 07',
    type: 'video',
    thumbnail: '/thumbnails/edit7.jpg',
    src: '/videos/edit7.mp4',
  },
  {
    id: '20',
    title: 'Visual Edit 08',
    type: 'video',
    thumbnail: '/thumbnails/edit8.jpg',
    src: '/videos/edit8.mp4',
  },
  {
    id: '21',
    title: 'Visual Edit 10',
    type: 'video',
    thumbnail: '/thumbnails/edit10.jpg',
    src: '/videos/edit10.mp4',
  },
  {
    id: '22',
    title: 'Visual Edit 11',
    type: 'video',
    thumbnail: '/videos/edit11.mp4',
    src: '/videos/edit11.mp4',
  },
  {
    id: '23',
    title: 'Visual Edit 12',
    type: 'video',
    thumbnail: '/videos/edit12.mp4',
    src: '/videos/edit12.mp4',
  },
];

// Helper to extract first frame from video as a Three.js Texture
function loadVideoFrameTexture(videoUrl: string): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 440;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  if (typeof window !== 'undefined') {
    const video = document.createElement('video');
    video.src = `${videoUrl}#t=0.001`;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    video.preload = 'auto';

    const renderFrame = () => {
      if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        texture.needsUpdate = true;
      }
    };

    video.addEventListener('seeked', renderFrame);
    video.addEventListener('loadeddata', () => {
      video.currentTime = 0.1;
      renderFrame();
    });
  }

  return texture;
}

// Fibonacci Sphere Distribution Helper Function
function fibonacciSphere(count: number, radius: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = phi * i;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    points.push(new THREE.Vector3(x, y, z).multiplyScalar(radius));
  }
  return points;
}

export default function SphereGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeItem, setActiveItem] = useState<SphereItem | null>(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const lightboxVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setClearColor(0x000000, 1);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.5;
    controls.autoRotate = false;

    // 3. Sphere Group & Fibonacci Distribution
    const sphereGroup = new THREE.Group();
    scene.add(sphereGroup);

    const radius = 7.5;
    const points = fibonacciSphere(sphereItems.length, radius);
    const textureLoader = new THREE.TextureLoader();
    const meshes: THREE.Mesh[] = [];

    const planeGeo = new THREE.PlaneGeometry(2.2, 3.0);

    sphereItems.forEach((item, index) => {
      let texture: THREE.Texture;
      if (item.thumbnail.endsWith('.mp4')) {
        texture = loadVideoFrameTexture(item.thumbnail);
      } else {
        texture = textureLoader.load(item.thumbnail);
        texture.colorSpace = THREE.SRGBColorSpace;
      }
      const textureMat = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1,
      });

      const mesh = new THREE.Mesh(planeGeo, textureMat);
      mesh.position.copy(points[index]);
      mesh.scale.set(1, 1, 1);
      mesh.userData = {
        item,
        originalScale: new THREE.Vector3(1, 1, 1),
        targetScale: new THREE.Vector3(1, 1, 1),
      };

      // Solid white overlay material for individual thumbnail white-flash reveal
      const whiteMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1,
      });

      const whiteMesh = new THREE.Mesh(planeGeo, whiteMat);
      whiteMesh.position.set(0, 0, 0.005);
      mesh.add(whiteMesh);

      sphereGroup.add(mesh);
      meshes.push(mesh);

      // Staggered per-item white-flash reveal animation on initial load
      const tl = gsap.timeline({ delay: index * 0.07 });

      // Quick scale-punch ("flash then settle")
      tl.to(mesh.userData.targetScale, {
        x: 1.08,
        y: 1.08,
        z: 1.08,
        duration: 0.15,
        ease: 'power2.out',
      });

      // Fade white overlay out to reveal photo/video thumbnail texture underneath
      tl.to(
        whiteMat,
        {
          opacity: 0,
          duration: 0.25,
          ease: 'power2.inOut',
          onComplete: () => {
            mesh.remove(whiteMesh);
            whiteMat.dispose();
          },
        },
        0
      );

      // Settle scale back to normal
      tl.to(mesh.userData.targetScale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.2,
        ease: 'back.out(1.7)',
      });
    });

    // 4. Auto-Drift & Auto-Rotate Variables
    let isDragging = false;
    let driftFactor = 1.0;
    let autoRotateFactor = 1.0;
    const clock = new THREE.Clock();

    // Mouse tracking for subtle parallax cursor-follow tilt
    let mouseX = 0;
    let mouseY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;

    const onWindowMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', onWindowMouseMove);

    controls.addEventListener('start', () => {
      isDragging = true;
      driftFactor = 0;
      autoRotateFactor = 0;
    });

    controls.addEventListener('end', () => {
      isDragging = false;
      // Smoothly ramp auto-drift & auto-rotate back in over ~0.8s
      const startTime = performance.now();
      const ramp = () => {
        const elapsed = (performance.now() - startTime) / 800;
        if (elapsed < 1 && !isDragging) {
          driftFactor = Math.min(1.0, elapsed);
          autoRotateFactor = Math.min(1.0, elapsed);
          requestAnimationFrame(ramp);
        } else if (!isDragging) {
          driftFactor = 1.0;
          autoRotateFactor = 1.0;
        }
      };
      ramp();
    });

    // 5. Raycasting for Hover & Click (Pointer Events for Touch & Mouse)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredMesh: THREE.Mesh | null = null;

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return; // Skip hover scale on touch devices
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        if (hoveredMesh !== hit) {
          if (hoveredMesh) {
            hoveredMesh.userData.targetScale.set(1, 1, 1);
          }
          hoveredMesh = hit;
          hoveredMesh.userData.targetScale.set(1.08, 1.08, 1.08);
          container.style.cursor = 'pointer';
        }
      } else {
        if (hoveredMesh) {
          hoveredMesh.userData.targetScale.set(1, 1, 1);
          hoveredMesh = null;
        }
        container.style.cursor = 'default';
      }
    };

    let clickStartX = 0;
    let clickStartY = 0;

    const onPointerDown = (e: PointerEvent) => {
      clickStartX = e.clientX;
      clickStartY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      const diffX = Math.abs(e.clientX - clickStartX);
      const diffY = Math.abs(e.clientY - clickStartY);
      if (diffX > 6 || diffY > 6) return; // Ignore drag movements

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const item = hit.userData.item as SphereItem;
        setActiveItem(item);
        setIsPlayingVideo(false);
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointermove', onPointerMove);
    domEl.addEventListener('pointerdown', onPointerDown);
    domEl.addEventListener('pointerup', onPointerUp);

    // 6. Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      controls.update();

      // Billboarding: Plane meshes always look at the camera
      meshes.forEach((mesh) => {
        mesh.lookAt(camera.position);

        // Smooth scale interpolation for hover & reveal
        mesh.scale.lerp(mesh.userData.targetScale, 0.1);
      });

      // Subtle Cursor-Follow Tilt (Parallax response layered on top of existing motion)
      const maxTiltAmount = 0.15;
      const activeTiltFactor = isDragging ? 0 : autoRotateFactor;
      const targetTiltX = mouseY * maxTiltAmount * activeTiltFactor;
      const targetTiltY = mouseX * maxTiltAmount * activeTiltFactor;

      currentTiltX += (targetTiltX - currentTiltX) * 0.05;
      const deltaTiltY = (targetTiltY - currentTiltY) * 0.05;
      currentTiltY += deltaTiltY;

      // Apply tilt to rotation.x
      sphereGroup.rotation.x = currentTiltX;

      // Idle Auto-Rotate & Auto-Drift (UNTOUCHED LOGIC)
      if (!isDragging) {
        sphereGroup.rotation.y += 0.0006 * autoRotateFactor;
        sphereGroup.rotation.y += deltaTiltY; // Add Y cursor tilt offset

        // Idle Auto-Drift (Lissajous Path) - UNTOUCHED
        const t = clock.getElapsedTime();
        const driftRangeX = 1.2;
        const driftRangeY = 0.8;
        sphereGroup.position.x = Math.sin(t * 0.15) * driftRangeX * driftFactor;
        sphereGroup.position.y = Math.cos(t * 0.1) * driftRangeY * driftFactor;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onWindowMouseMove);
      domEl.removeEventListener('pointermove', onPointerMove);
      domEl.removeEventListener('pointerdown', onPointerDown);
      domEl.removeEventListener('pointerup', onPointerUp);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const closeLightbox = () => {
    if (lightboxVideoRef.current) {
      lightboxVideoRef.current.pause();
      lightboxVideoRef.current.currentTime = 0;
    }
    setActiveItem(null);
    setIsPlayingVideo(false);
  };

  const handlePlayVideo = () => {
    if (lightboxVideoRef.current) {
      lightboxVideoRef.current.play().then(() => {
        setIsPlayingVideo(true);
      }).catch(() => {});
    }
  };

  return (
    <>
      {/* 3D Sphere Canvas Container */}
      <div className={styles.sphereContainer} ref={containerRef} />

      {/* Fullscreen Lightbox Modal */}
      {activeItem && (
        <div className={styles.lightboxOverlay} onClick={closeLightbox}>
          <button className={styles.closeButton} onClick={closeLightbox} aria-label="Close">
            ✕
          </button>

          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            {activeItem.type === 'image' ? (
              /* Fullscreen Image Lightbox (No Play Button) */
              <img
                src={activeItem.src}
                alt={activeItem.title}
                className={styles.lightboxImage}
              />
            ) : (
              /* Fullscreen Video Lightbox (Centered Play Button) */
              <div className={styles.lightboxVideoContainer}>
                <video
                  ref={lightboxVideoRef}
                  src={activeItem.src}
                  poster={activeItem.thumbnail}
                  controls={isPlayingVideo}
                  playsInline
                  className={styles.lightboxVideo}
                />

                {!isPlayingVideo && (
                  <div className={styles.playButtonOverlay} onClick={handlePlayVideo}>
                    <div className={styles.playButtonIcon}>
                      <svg className="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
