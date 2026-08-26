'use client';

import Link from 'next/link';
import { useState } from 'react';

const navLinks = [
  // GTA 6 staat vooraan: het is onze belangrijkste themapagina en interne
  // links vanaf elke pagina helpen hem in de zoekresultaten.
  { href: '/gta-6',               label: 'GTA 6' },
  { href: '/categorie/nieuws',    label: 'Nieuws' },
  { href: '/categorie/reviews',   label: 'Reviews' },
  { href: '/categorie/games',     label: 'Games' },
  { href: '/categorie/tech',      label: 'Tech' },
  { href: '/categorie/hardware',  label: 'Hardware' },
  { href: '/categorie/video',     label: 'Video' },
];

export default function Navbar() {
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#0d1117] to-[#1a1f2e] border-b border-[#30363d]/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-0.5 flex-shrink-0 group">
            <span className="text-[#00aaff] font-black text-2xl tracking-tight group-hover:text-[#33bbff] transition-colors">
              GAME
            </span>
            <span className="text-white font-black text-2xl tracking-tight">INSIDE</span>
            <span className="ml-1 w-1.5 h-1.5 rounded-full bg-[#7c3aed] group-hover:bg-[#9d5cf0] transition-colors" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-sm font-semibold text-[#8b949e] hover:text-white
                           hover:bg-[#1c2333] rounded-lg transition-all uppercase tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-[#8b949e] hover:text-white hover:bg-[#1c2333] rounded-lg transition-all"
              aria-label="Zoeken"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-[#8b949e] hover:text-white hover:bg-[#1c2333] rounded-lg transition-all"
              aria-label="Menu"
            >
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="py-3 border-t border-[#30363d]/60">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b949e]"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Zoek naar nieuws, games, reviews…"
                className="w-full bg-[#1c2333] border border-[#30363d] rounded-lg pl-10 pr-4 py-2.5
                           text-sm text-white placeholder-[#555e6b]
                           focus:outline-none focus:border-[#00aaff] focus:shadow-[0_0_0_3px_rgba(0,170,255,0.1)]
                           transition-all"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0d1117] border-t border-[#30363d]/60">
          <nav className="flex flex-col px-4 py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="py-3 text-sm font-semibold text-[#8b949e] hover:text-[#00aaff]
                           border-b border-[#1c2333] uppercase tracking-wide transition-colors last:border-0"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
