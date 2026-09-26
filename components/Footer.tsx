"use client";
import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-zinc-900/80 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-zinc-600 z-10 relative">
      <div>© {new Date().getFullYear()} ALAKA EDITS. ALL RIGHTS RESERVED.</div>
      <div className="flex gap-6">
        <a
          href="https://www.instagram.com/dash_alaka_?stkn=NTFqaDZjMDU5ZmN6"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-zinc-400 transition"
        >
          INSTAGRAM
        </a>
        <a href="#" className="hover:text-zinc-400 transition">TWITTER / X</a>
        <a href="#" className="hover:text-zinc-400 transition">YOUTUBE</a>
      </div>
    </footer>
  );
}
