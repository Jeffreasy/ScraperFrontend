'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  Newspaper,
  BarChart3,
  Info,
  Sparkles,
  Activity,
  Shield,
  TrendingUp,
  Menu,
  X,
} from 'lucide-react';
import {
  cn,
  flexPatterns,
  transitions,
  focusEffects,
  statusColors,
  responsiveDisplay,
} from '@/lib/styles/theme';
import { OfflineIndicatorCompact } from '@/components/offline-indicator';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useHealthStatus } from '@/lib/hooks/use-health';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const navLinkVariants = cva(
  [
    'group relative flex items-center gap-2 rounded-md px-3 py-2',
    'text-sm font-medium transition-all duration-200',
    focusEffects.ring,
  ],
  {
    variants: {
      variant: {
        default: [
          'text-muted-foreground',
          'hover:bg-accent hover:text-accent-foreground',
          'hover:scale-105 active:scale-95',
        ],
        active: [
          'bg-primary text-primary-foreground',
          'shadow-sm hover:bg-primary/90',
        ],
      },
      size: {
        default: 'h-10',
        sm: 'h-9 px-2.5 text-xs',
        lg: 'h-11 px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const mobileMenuVariants = cva(
  [
    'fixed inset-x-0 top-16 z-50 border-b bg-background/95 backdrop-blur',
    'transform transition-all duration-300 ease-in-out',
  ],
  {
    variants: {
      open: {
        true: 'translate-y-0 opacity-100',
        false: '-translate-y-full opacity-0 pointer-events-none',
      },
    },
    defaultVariants: {
      open: false,
    },
  }
);

// ============================================================================
// NAVIGATION ITEMS
// ============================================================================

const navItems: NavItem[] = [
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className={cn(flexPatterns.between, 'h-16')}>
          {/* Logo & Brand */}
          <Link
            href="/"
            className={cn(
              flexPatterns.start,
              'gap-3 group',
              transitions.colors,
              focusEffects.ring,
              'rounded-md'
            )}
          >
            <div className="relative">
              <Newspaper className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
              <HealthIndicator />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Nieuws Scraper
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className={cn('hidden md:flex items-center gap-1')}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    navLinkVariants({
                      variant: isActive ? 'active' : 'default',
                    })
                  )}
                >
                  <Icon className={cn('h-4 w-4', transitions.transform)} />
                  <span className="hidden sm:inline">{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 h-0.5 w-3/4 -translate-x-1/2 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
            <div className="ml-2 flex items-center gap-2 pl-2 border-l">
              <OfflineIndicatorCompact />
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className={cn(flexPatterns.start, 'gap-2', responsiveDisplay.mobileOnly)}>
            <OfflineIndicatorCompact />
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                'inline-flex items-center justify-center rounded-md p-2',
                'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                transitions.colors,
                focusEffects.ring
              )}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={mobileMenuVariants({ open: isMobileMenuOpen })}>
        <div className="container mx-auto px-4 py-4">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    navLinkVariants({
                      variant: isActive ? 'active' : 'default',
                    }),
                    'w-full justify-start'
                  )}
                >
                  <Icon className={cn('h-4 w-4', transitions.transform)} />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </nav>
  );
}

// ============================================================================
// HEALTH INDICATOR
// ============================================================================

function HealthIndicator() {
  const [isMounted, setIsMounted] = useState(false);
  const { isHealthy, isDegraded, isLoading } = useHealthStatus();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || isLoading) {
    return null;
  }

  const status = isHealthy ? 'healthy' : isDegraded ? 'warning' : 'error';
  const statusColor = statusColors[status].dot;
  const statusLabel = isHealthy
    ? 'System gezond'
    : isDegraded
      ? 'Systeem gedegradeerd'
      : 'Systeem heeft problemen';

  return (
    <span
      className={cn(
        'absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full ring-2 ring-background',
        statusColor,
        'animate-pulse'
      )}
      title={statusLabel}
      aria-label={statusLabel}
    />
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { NavItem };
export { navLinkVariants, mobileMenuVariants };