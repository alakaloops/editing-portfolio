"use client";
import React from 'react';
import { LinkedInIcon } from './SocialIcons';

export default function Footer() {
  return (
    <footer id="contact" className="w-full max-w-7xl mx-auto px-6 py-8 border-t border-zinc-900/80 flex flex-col sm:flex-row justify-between items-center gap-6 text-xs font-mono text-zinc-500 z-10 relative">
      <div className="flex items-center gap-3">
        <span>© {new Date().getFullYear()} ALAKA EDITS. ALL RIGHTS RESERVED.</span>
        <a
          href="/admin"
          className="text-zinc-600 hover:text-red-500 transition text-[11px] font-mono tracking-wider"
          title="Open Admin Panel"
        >
          [ADMIN]
        </a>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-6">
        <a
          href="https://www.instagram.com/dash_alaka_?stkn=NTFqaDZjMDU5ZmN6"
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[44px] min-w-[44px] inline-flex items-center px-3 py-2 hover:text-zinc-300 transition text-zinc-400"
          aria-label="Instagram profile"
        >
          INSTAGRAM
        </a>
        <a
          href="https://x.com/AlakaDass"
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[44px] min-w-[44px] inline-flex items-center px-3 py-2 hover:text-zinc-300 transition text-zinc-400"
          aria-label="Twitter/X profile"
        >
          TWITTER / X
        </a>
        <a
          href="https://www.linkedin.com/in/alaka-dash?utm_source=share_via&utm_content=profile&utm_medium=member_android"
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[44px] min-w-[44px] inline-flex items-center gap-1.5 px-3 py-2 hover:text-zinc-300 transition text-zinc-400"
          aria-label="LinkedIn profile"
        >
          <LinkedInIcon className="w-3.5 h-3.5 text-zinc-400" />
          <span>LINKEDIN</span>
        </a>
      </div>
    </footer>
  );
}
