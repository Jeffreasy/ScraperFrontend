'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Newspaper, BarChart3, Info, Sparkles, Activity, Shield, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OfflineIndicatorCompact } from '@/components/offline-indicator';
import { useHealthStatus } from '@/lib/hooks/use-health';
import { useEffect, useState } from 'react';

const navItems = [
  {
    name: 'Artikelen',
    href: '/',
    icon: Newspaper,
  },
  {
    name: 'Stocks',
    href: '/stocks',
    icon: TrendingUp,
  },
  {
    name: 'AI Insights',
    href: '/ai',
    icon: Sparkles,
  },
  {
    name: 'Statistieken',
    href: '/stats',
    icon: BarChart3,
  },
  {
    name: 'Admin',
    href: '/admin',
    icon: Shield,
  },
  {
    name: 'Health',
    href: '/health',
    icon: Activity,
  },
  {
    name: 'Over',
    href: '/about',
    icon: Info,
  },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Newspaper className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Nieuws Scraper</span>
            <HealthIndicator />
          </Link>

          <div className="flex items-center space-x-2">
            <OfflineIndicatorCompact />

            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href ||
                  (item.href === '/stocks' && pathname.startsWith('/stocks'));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Client-only health indicator to avoid hydration issues
function HealthIndicator() {
  const [isMounted, setIsMounted] = useState(false);
  const { isHealthy, isDegraded, isLoading } = useHealthStatus();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || isLoading) return null;

  if (isHealthy) {
    return (
      <span
        className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse"
        title="System healthy"
      />
    );
  }

  if (isDegraded) {
    return (
      <span
        className="inline-flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse"
        title="System degraded"
      />
    );
  }

  return null;
}