"use client";
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SphereGallery from '@/components/SphereGallery';
import Carousel from '@/components/Carousel';
import SpaceBackground from '@/components/SpaceBackground';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import type { MediaItem } from '@/components/Carousel';

export default function Home() {
  const [selected, setSelected] = useState<MediaItem | null>(null);

  // Initialize Kage-inspired masked scroll reveal animations
  useScrollReveal();

  const handleSelect = (item: MediaItem) => {
    setSelected(item);
  };

  const closePanel = () => setSelected(null);

  return (
    <>
      {/* 1. Fixed WebGL Canvas Behind Page (Three.js Starfield / Camera Path) */}
      <SpaceBackground />

      {/* 2. Page Content Scrolling Smoothly on Top */}
      <main className="relative z-10 min-h-[100svh] bg-transparent text-white flex flex-col justify-between overflow-x-clip selection:bg-red-500 selection:text-white font-sans">
        {/* Subtle top atmospheric radial highlight */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[420px] bg-red-600/5 blur-[120px] pointer-events-none rounded-full"
          aria-hidden="true"
        />

        {/* Shared Navbar */}
        <Navbar />

        {/* Section 0: Hero 3D Sphere Section */}
        <section
          id="hero"
          data-cam="0"
          className="w-full min-h-[70svh] sm:h-[100svh] relative bg-transparent overflow-hidden flex items-center justify-center"
        >
          <SphereGallery />
        </section>

        {/* Section 1: Main Showcase Section (Work) */}
        <section
          id="work"
          data-cam="1"
          className="my-auto py-12 z-10 w-full"
        >
          <div className="max-w-7xl mx-auto px-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div data-rv="up">
              <span className="inline-block px-3 py-1 bg-red-950/60 border border-red-800/40 text-red-400 text-[10px] uppercase font-mono tracking-widest rounded-full mb-3">
                Featured Works
              </span>
              <h2
                data-reveal-words
                className="text-3xl md:text-5xl font-extrabold tracking-tight text-white uppercase"
              >
                FEATURED WORKS
              </h2>
            </div>
            <p
              data-rv="fade"
              className="text-xs text-zinc-500 font-mono tracking-wider uppercase"
            >
              ← Drag or scroll to explore • Click to play video →
            </p>
          </div>

          {/* Endless Horizontal Carousel */}
          <div data-rv="up">
            <Carousel onSelect={handleSelect} />
          </div>
        </section>

        {/* Section 2: About Me Section */}
        <section
          id="about"
          data-cam="2"
          className="max-w-7xl mx-auto px-6 py-16 z-10 w-full"
        >
          <div
            data-rv="up"
            className="bg-zinc-950/75 border border-zinc-900/90 rounded-2xl p-8 md:p-12 shadow-2xl backdrop-blur-md relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-red-600 via-red-500 to-transparent" />
            <div className="max-w-3xl">
              <span className="inline-block px-3.5 py-1 bg-red-950/60 border border-red-800/40 text-red-400 text-[11px] uppercase font-mono tracking-widest rounded-full mb-4 font-semibold">
                About Me
              </span>
              <h2
                data-reveal-words
                className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase mb-6 leading-tight"
              >
                IIT Madras Student &amp; Visual Editor
              </h2>
              <p
                data-rv="up"
                className="text-zinc-300 text-base md:text-lg font-light leading-relaxed mb-8"
              >
                Hey, I’m an IIT Madras student who got way too interested in editing and decided to make something out of it. With 1.5+ years of experience, I’ve been playing around with cuts, transitions, effects, and visuals to turn raw footage into something people actually want to watch. I work with CapCut and After Effects, and I’m always experimenting with new styles and ways to make my edits better.
              </p>
              <div
                data-rv="up"
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-zinc-900 font-mono text-xs"
              >
                <div className="bg-black/60 border border-zinc-800/80 p-4 rounded-xl">
                  <span className="text-zinc-500 text-[10px] block uppercase tracking-wider mb-1">Education</span>
                  <span className="text-white font-bold text-sm">IIT Madras</span>
                </div>
                <div className="bg-black/60 border border-zinc-800/80 p-4 rounded-xl">
                  <span className="text-zinc-500 text-[10px] block uppercase tracking-wider mb-1">Experience</span>
                  <span className="text-white font-bold text-sm">1.5+ Years</span>
                </div>
                <div className="bg-black/60 border border-zinc-800/80 p-4 rounded-xl">
                  <span className="text-zinc-500 text-[10px] block uppercase tracking-wider mb-1">Primary Tools</span>
                  <span className="text-white font-bold text-sm">After Effects</span>
                </div>
                <div className="bg-black/60 border border-zinc-800/80 p-4 rounded-xl">
                  <span className="text-zinc-500 text-[10px] block uppercase tracking-wider mb-1">Mobile &amp; Fast</span>
                  <span className="text-white font-bold text-sm">CapCut</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sleek Side Drawer Video Player Overlay */}
        {selected && (
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-lg flex justify-end z-50 transition-opacity duration-300"
            onClick={closePanel}
          >
            <div
              className="w-full max-w-3xl bg-[#0e0e0e] border-l border-zinc-800/80 h-full p-6 md:p-10 flex flex-col justify-between overflow-y-auto relative shadow-2xl animate-in slide-in-from-right duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-mono uppercase tracking-widest text-red-500 bg-red-950/40 border border-red-900/30 px-3 py-1 rounded-full">
                    {selected.category}
                  </span>
                  <button
                    className="min-h-[44px] min-w-[44px] rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white flex items-center justify-center text-lg transition font-mono"
                    onClick={closePanel}
                    aria-label="Close player"
                  >
                    ✕
                  </button>
                </div>

                <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
                  {selected.title}
                </h2>
                <p className="text-xs font-mono text-zinc-500 mb-6">
                  Duration: {selected.duration || '0:45'} • Original Edit by Alaka
                </p>

                {/* Video Player Box */}
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-zinc-800/80 shadow-2xl mb-8 group">
                  <video
                    src={selected.src}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Edit Details */}
                <div className="space-y-4 border-t border-zinc-900 pt-6">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-400">About this edit</h4>
                  <p className="text-sm text-zinc-300 leading-relaxed font-light">
                    High-energy visual composition featuring custom color grading, rhythm sync, and motion graphics curated specifically for {selected.title}.
                  </p>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="pt-8 border-t border-zinc-900 flex justify-between items-center">
                <span className="text-xs font-mono text-zinc-600">ALAKA EDITS PORTFOLIO</span>
                <button
                  className="min-h-[44px] px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-medium text-xs tracking-wider uppercase rounded-full transition shadow-lg shadow-red-600/20"
                  onClick={closePanel}
                >
                  Close Player
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Shared Footer (Section 3 waypoint target) */}
        <Footer />
      </main>
    </>
  );
}
