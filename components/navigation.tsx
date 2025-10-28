'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Newspaper, BarChart3, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    name: 'Artikelen',
    href: '/',
    icon: Newspaper,
  },
  {
    name: 'Statistieken',
    href: '/stats',
    icon: BarChart3,
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
          </Link>

          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

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
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}