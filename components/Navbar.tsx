"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LinkedInIcon, TwitterIcon } from './SocialIcons';

interface NavbarProps {
  showSocials?: boolean;
}

export default function Navbar({ showSocials }: NavbarProps) {
  const [showContactModal, setShowContactModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const pathname = usePathname();
  // Hide Twitter & LinkedIn in the navbar on the first page (/) since they are already in the contact info section
  const isFirstPage = pathname === '/';
  const displaySocials = showSocials !== undefined ? showSocials : !isFirstPage;

  const email = 'dashalaka59@gmail.com';
  const twitterUrl = 'https://x.com/AlakaDass';
  const linkedInUrl = 'https://www.linkedin.com/in/alaka-dash?utm_source=share_via&utm_content=profile&utm_medium=member_android';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="w-full max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 py-6 sm:py-8 z-30 relative">
        <Link href="/" className="group flex flex-col justify-center min-h-[44px]">
          <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase text-white group-hover:text-red-500 transition leading-none">
            ALAKA<span className="text-red-600">.</span>EDITS
          </h1>
          <p className="text-[9px] sm:text-[10px] font-mono tracking-widest text-zinc-500 uppercase mt-1">
            Video Editor &amp; Visual Director
          </p>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-xs uppercase tracking-widest text-zinc-400 font-mono">
          <a href="#about" className="hover:text-white transition py-2 px-1">ABOUT ME</a>
          <Link href="/gallery" className="hover:text-white transition py-2 px-1">WORK</Link>
          {displaySocials && (
            <>
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition flex items-center gap-1.5 py-2 px-1"
                aria-label="Twitter/X profile"
              >
                <TwitterIcon className="w-3.5 h-3.5 text-zinc-400" />
                <span>TWITTER / X</span>
              </a>
              <a
                href={linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition flex items-center gap-1.5 py-2 px-1"
                aria-label="LinkedIn profile"
              >
                <LinkedInIcon className="w-3.5 h-3.5 text-zinc-400" />
                <span>LINKEDIN</span>
              </a>
            </>
          )}
          <button
            onClick={() => setShowContactModal(true)}
            className="min-h-[44px] px-5 py-2.5 border border-zinc-800 rounded-full hover:border-red-500 hover:text-white transition bg-zinc-900/60 text-xs font-mono tracking-widest uppercase cursor-pointer"
          >
            Contact
          </button>
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setShowContactModal(true)}
            className="min-h-[44px] px-3.5 py-2 text-[11px] border border-zinc-800 rounded-full hover:border-red-500 hover:text-white transition bg-zinc-900/70 text-zinc-300 font-mono tracking-wider uppercase cursor-pointer"
          >
            Contact
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="min-h-[44px] min-w-[44px] flex flex-col justify-center items-center gap-1.5 p-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/60 text-zinc-300 hover:text-white focus:outline-none"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            <span
              className={`block w-5 h-0.5 bg-current transition-transform duration-300 ${
                mobileMenuOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-current transition-opacity duration-300 ${
                mobileMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-current transition-transform duration-300 ${
                mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            />
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[88px] z-40 bg-zinc-950/95 border-b border-zinc-800/80 backdrop-blur-xl px-6 py-6 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-4 text-xs uppercase tracking-widest text-zinc-300 font-mono">
            <a
              href="#about"
              onClick={closeMobileMenu}
              className="min-h-[44px] flex items-center hover:text-white transition border-b border-zinc-900 pb-2"
            >
              ABOUT ME
            </a>
            <Link
              href="/gallery"
              onClick={closeMobileMenu}
              className="min-h-[44px] flex items-center hover:text-white transition border-b border-zinc-900 pb-2"
            >
              WORK
            </Link>
            {displaySocials && (
              <>
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMobileMenu}
                  className="min-h-[44px] flex items-center gap-2 hover:text-white transition border-b border-zinc-900 pb-2"
                >
                  <TwitterIcon className="w-4 h-4 text-zinc-400" />
                  <span>TWITTER / X</span>
                </a>
                <a
                  href={linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMobileMenu}
                  className="min-h-[44px] flex items-center gap-2 hover:text-white transition border-b border-zinc-900 pb-2"
                >
                  <LinkedInIcon className="w-4 h-4 text-zinc-400" />
                  <span>LINKEDIN</span>
                </a>
              </>
            )}
            <button
              onClick={() => {
                closeMobileMenu();
                setShowContactModal(true);
              }}
              className="min-h-[44px] w-full mt-2 py-3 bg-red-600/90 hover:bg-red-500 text-white font-mono text-xs uppercase tracking-widest rounded-xl transition font-bold"
            >
              Open Contact Details
            </button>
          </nav>
        </div>
      )}

      {/* Contact Details Modal / Overlay (Twitter & LinkedIn always kept here) */}
      {showContactModal && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setShowContactModal(false)}
        >
          <div
            className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-white">Get in Touch</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="min-h-[44px] min-w-[44px] rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-sm font-mono transition"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              {/* Email Item */}
              <div className="bg-black/70 border border-zinc-800 p-4 rounded-xl flex justify-between items-center gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase text-zinc-500 block mb-1">Email Address</span>
                  <a
                    href={`mailto:${email}`}
                    className="text-white text-sm font-semibold hover:text-red-400 transition truncate block"
                  >
                    {email}
                  </a>
                </div>
                <button
                  onClick={() => copyToClipboard(email, 'email')}
                  className="min-h-[44px] px-3.5 py-2 bg-red-950/70 border border-red-800/40 text-red-400 hover:bg-red-600 hover:text-white transition rounded-lg text-[11px] uppercase tracking-wider font-bold shrink-0"
                >
                  {copiedField === 'email' ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {/* Direct Links kept in Contact Info */}
              <div className="pt-2 grid grid-cols-2 gap-3">
                <a
                  href={linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] flex items-center justify-center gap-2 p-3 bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-300 hover:text-white transition text-[11px] font-bold"
                >
                  <LinkedInIcon className="w-4 h-4 text-zinc-400" />
                  <span>LinkedIn</span>
                </a>
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] flex items-center justify-center gap-2 p-3 bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-300 hover:text-white transition text-[11px] font-bold"
                >
                  <TwitterIcon className="w-4 h-4 text-zinc-400" />
                  <span>Twitter / X</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
