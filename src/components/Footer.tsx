import Link from 'next/link';

const footerLinks = {
  Categorieën: [
    { href: '/categorie/nieuws',   label: 'Nieuws' },
    { href: '/categorie/reviews',  label: 'Reviews' },
    { href: '/categorie/games',    label: 'Games' },
    { href: '/categorie/tech',     label: 'Tech' },
    { href: '/categorie/hardware', label: 'Hardware' },
    { href: '/categorie/video',    label: 'Video' },
  ],
  Platform: [
    { href: '/gta-6', label: 'GTA 6' },
    { href: '#', label: 'PlayStation' },
    { href: '#', label: 'Xbox' },
    { href: '#', label: 'Nintendo' },
    { href: '#', label: 'PC Gaming' },
    { href: '#', label: 'Mobile' },
  ],
  Redactie: [
    { href: '/redactie', label: 'Over Gameinside' },
    { href: '/redactie', label: 'Redactieteam' },
    { href: '/adverteren', label: 'Adverteren' },
    { href: '/contact', label: 'Contact' },
    { href: '#', label: 'Privacy' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#161b22] mt-16 relative">
      {/* Gradient top border */}
      <div className="h-px w-full bg-gradient-to-r from-[#7c3aed] via-[#00aaff] to-[#7c3aed]" />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-0.5 mb-3 group">
              <span className="text-[#00aaff] font-black text-xl tracking-tight group-hover:text-[#33bbff] transition-colors">GAME</span>
              <span className="text-white font-black text-xl tracking-tight">INSIDE</span>
              <span className="ml-1 w-1.5 h-1.5 rounded-full bg-[#7c3aed]" />
            </Link>
            <p className="text-sm text-[#8b949e] leading-relaxed">
              Jouw Nederlandse bron voor gaming nieuws, reviews en de beste tech. Dagelijks bijgewerkt door een team van gepassioneerde gamers.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://x.com/GameinsideNL"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Gameinside op X"
                className="w-9 h-9 rounded-lg bg-[#1c2333] border border-[#30363d] flex items-center justify-center
                           text-[#8b949e] hover:text-[#00aaff] hover:border-[#00aaff]/60 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-black text-[#e6edf3] uppercase tracking-widest mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}
                      className="text-sm text-[#8b949e] hover:text-[#00aaff] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#30363d]/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#555e6b]">© 2025 Gameinside. Alle rechten voorbehouden.</p>
          <div className="flex items-center gap-4">
            {['Privacy', 'Cookies', 'Disclaimer'].map((l) => (
              <Link key={l} href="#" className="text-xs text-[#555e6b] hover:text-[#00aaff] transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
