import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  // ── Base URL (resolves all relative paths in metadata) ───────────────────
  metadataBase: new URL('https://gameinside.nl'),

  // ── Titles ───────────────────────────────────────────────────────────────
  title: {
    default: 'Gameinside | Nederlands Gaming Nieuws, Reviews & Tech',
    // Kort gehouden: Google toont ongeveer 60 tekens, dus elk teken dat het
    // merk opeet gaat af van de kop zelf.
    template: '%s | Gameinside',
  },

  // ── Description ──────────────────────────────────────────────────────────
  description:
    'Gameinside is jouw Nederlandse bron voor het laatste gaming nieuws, eerlijke game reviews, tech updates en hardware nieuws. Dagelijks vers gaming content in het Nederlands.',

  // ── Keywords ─────────────────────────────────────────────────────────────
  keywords: [
    'gaming nieuws',
    'game reviews',
    'gaming Nederland',
    'PlayStation nieuws',
    'Xbox nieuws',
    'Nintendo nieuws',
    'PC gaming',
    'tech nieuws',
    'hardware reviews',
    'games kopen',
  ],

  // ── Crawling & indexing ──────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  // ── Open Graph defaults (per-page metadata merges on top) ────────────────
  openGraph: {
    siteName: 'Gameinside',
    locale: 'nl_NL',
    type: 'website',
  },

  // ── Twitter Card defaults ────────────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    site: '@gameinside_nl',
    creator: '@gameinside_nl',
  },

  // ── GSC verification (replace with real token after going live) ──────────
  verification: {
    google: 'PLACEHOLDER_REPLACE_AFTER_SITE_GOES_LIVE',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0RZ2C9ZD2M"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-0RZ2C9ZD2M');
          `}
        </Script>
      </head>
      <body className="bg-[#0f0f0f] text-[#e8e8e8] min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
