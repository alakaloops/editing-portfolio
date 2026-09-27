"use client";
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Carousel from '@/components/Carousel';
import SphereGallery from '@/components/SphereGallery';
import type { MediaItem } from '@/components/Carousel';

export default function GalleryPage() {
  const [selected, setSelected] = useState<MediaItem | null>(null);

  const handleSelect = (item: MediaItem) => {
    setSelected(item);
  };

  const closePanel = () => setSelected(null);

  return (
    <main className="relative min-h-screen bg-black text-white flex flex-col justify-between overflow-x-hidden font-sans">
      {/* Background radial highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-red-600/5 blur-[120px] pointer-events-none rounded-full" />

      {/* Shared Navbar */}
      <Navbar />

      {/* Full-Bleed 3D Sphere Gallery Section */}
      <section className="w-full h-screen relative bg-black overflow-hidden">
        <SphereGallery />
      </section>

      {/* Main Content Container */}
      <div className="w-full max-w-7xl mx-auto px-6 py-16 z-10 flex-1">
        {/* Horizontal Carousel Section */}
        <section>
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-red-950/60 border border-red-800/40 text-red-400 text-[10px] uppercase font-mono tracking-widest rounded-full mb-2">
              Featured Works
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white uppercase">
              FEATURED WORKS
            </h2>
          </div>
          <Carousel onSelect={handleSelect} />
        </section>
      </div>

      {/* Side panel overlay */}
      {selected && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={closePanel}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-semibold mb-4 text-white">{selected.title}</h2>
            <video
              src={selected.src}
              controls
              autoPlay
              className="w-full h-auto rounded border border-zinc-800"
            />
            <button
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs uppercase font-mono tracking-wider rounded transition"
              onClick={closePanel}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Shared Footer */}
      <Footer />
    </main>
  );
}
