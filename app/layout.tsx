import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Navigation } from '@/components/navigation';
import { ErrorBoundary } from '@/components/error-boundary';
import { OfflineIndicator } from '@/components/offline-indicator';
import { cn, containers, spacing } from '@/lib/styles/theme';

// ============================================================================
// FONT CONFIGURATION
// ============================================================================

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: 'Nieuws Scraper - Het laatste nieuws uit Nederland',
  description: 'Blijf op de hoogte van het laatste nieuws uit Nederland met onze nieuws aggregator.',
  keywords: ['nieuws', 'nederland', 'breaking news', 'actueel', 'nieuwsaggregator'],
  authors: [{ name: 'Nieuws Scraper Team' }],
  openGraph: {
    title: 'Nieuws Scraper',
    description: 'Het laatste nieuws uit Nederland',
    type: 'website',
    locale: 'nl_NL',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

// ============================================================================
// ROOT LAYOUT
// ============================================================================

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" suppressHydrationWarning className={inter.variable}>
      <body className={cn(inter.className, 'antialiased')}>
        <Providers>
          <ErrorBoundary>
            <OfflineIndicator />

            {/* Main App Container */}
            <div className="relative flex min-h-screen flex-col bg-background">
              {/* Navigation */}
              <Navigation />

              {/* Main Content */}
              <main className={cn(containers.page, 'flex-1')}>
                {children}
              </main>

              {/* Footer */}
              <Footer />
            </div>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}

// ============================================================================
// FOOTER COMPONENT
// ============================================================================

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card">
      <div className={cn(containers.section, 'py-6')}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {currentYear} Nieuws Scraper. Alle rechten voorbehouden.
          </p>

          {/* Links */}
          <nav className="flex items-center justify-center gap-4 text-sm">
            <a
              href="/about"
              className={cn(
                'text-muted-foreground hover:text-foreground',
                'transition-colors underline-offset-4 hover:underline'
              )}
            >
              Over
            </a>
            <a
              href="/health"
              className={cn(
                'text-muted-foreground hover:text-foreground',
                'transition-colors underline-offset-4 hover:underline'
              )}
            >
              Status
            </a>
            <a
              href="/stats"
              className={cn(
                'text-muted-foreground hover:text-foreground',
                'transition-colors underline-offset-4 hover:underline'
              )}
            >
              Statistieken
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export { Footer };