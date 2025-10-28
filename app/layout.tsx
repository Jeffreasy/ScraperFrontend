import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Navigation } from '@/components/navigation';
import { ErrorBoundary } from '@/components/error-boundary';
import { OfflineIndicator } from '@/components/offline-indicator';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nieuws Scraper - Het laatste nieuws uit Nederland',
  description: 'Blijf op de hoogte van het laatste nieuws uit Nederland met onze nieuws aggregator.',
  keywords: ['nieuws', 'nederland', 'breaking news', 'actueel'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ErrorBoundary>
            <OfflineIndicator />
            <div className="min-h-screen bg-background">
              <Navigation />
              <main className="container mx-auto px-4 py-8">
                {children}
              </main>
              <footer className="border-t py-6 mt-12">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                  © {new Date().getFullYear()} Nieuws Scraper. Alle rechten voorbehouden.
                </div>
              </footer>
            </div>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}