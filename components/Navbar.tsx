"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [showContactModal, setShowContactModal] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const phone = '+91 6372918882';
  const email = 'dashalaka59@gmail.com';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  return (
    <>
      <header className="w-full max-w-7xl mx-auto flex justify-between items-center px-6 py-8 z-20 relative">
        <Link href="/" className="group">
          <h1 className="text-2xl font-black tracking-tighter uppercase text-white group-hover:text-red-500 transition">
            ALAKA<span className="text-red-600">.</span>EDITS
          </h1>
          <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mt-0.5">
            Video Editor &amp; Visual Director
          </p>
        </Link>

        <nav className="flex items-center gap-6 text-xs uppercase tracking-widest text-zinc-400 font-mono">
          <a href="#about" className="hover:text-white transition">ABOUT ME</a>
          <Link href="/gallery" className="hover:text-white transition">WORK</Link>
          <button
            onClick={() => setShowContactModal(true)}
            className="px-4 py-2 border border-zinc-800 rounded-full hover:border-red-500 hover:text-white transition bg-zinc-900/50 text-xs font-mono tracking-widest uppercase cursor-pointer"
          >
            Contact
          </button>
        </nav>
      </header>

      {/* Contact Details Modal / Overlay */}
      {showContactModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setShowContactModal(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8 max-w-md w-full relative shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold uppercase tracking-wide text-white">Get in Touch</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-sm font-mono transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              {/* Phone Item */}
              <div className="bg-black/60 border border-zinc-800 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase text-zinc-500 block mb-1">Phone Number</span>
                  <span className="text-white text-sm font-semibold">{phone}</span>
                </div>
                <button
                  onClick={() => copyToClipboard('+916372918882', 'phone')}
                  className="px-3 py-1.5 bg-red-950/60 border border-red-800/40 text-red-400 hover:bg-red-600 hover:text-white transition rounded text-[11px] uppercase tracking-wider font-bold"
                >
                  {copiedField === 'phone' ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {/* Email Item */}
              <div className="bg-black/60 border border-zinc-800 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase text-zinc-500 block mb-1">Email Address</span>
                  <a href={`mailto:${email}`} className="text-white text-sm font-semibold hover:text-red-400 transition block">
                    {email}
                  </a>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(email, 'email')}
                    className="px-3 py-1.5 bg-red-950/60 border border-red-800/40 text-red-400 hover:bg-red-600 hover:text-white transition rounded text-[11px] uppercase tracking-wider font-bold"
                  >
                    {copiedField === 'email' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
