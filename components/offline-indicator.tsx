'use client';

import { useEffect, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '@/lib/hooks/use-online-status';
import {
    cn,
    flexPatterns,
    transitions,
    bodyText,
    gap,
} from '@/lib/styles/theme';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface OfflineIndicatorProps {
    position?: 'top' | 'bottom';
}

interface OfflineIndicatorCompactProps {
    className?: string;
}

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const indicatorBannerVariants = cva(
    [
        'fixed left-0 right-0 z-50 px-4 py-3 shadow-lg',
        transitions.base,
    ],
    {
        variants: {
            status: {
                offline: 'bg-destructive text-destructive-foreground',
                reconnected: 'bg-green-600 text-white',
            },
            position: {
                top: 'top-0 animate-in slide-in-from-top',
                bottom: 'bottom-0 animate-in slide-in-from-bottom',
            },
        },
        defaultVariants: {
            status: 'offline',
            position: 'top',
        },
    }
);

const compactIndicatorVariants = cva(
    [
        'inline-flex items-center rounded-full font-medium',
        transitions.colors,
    ],
    {
        variants: {
            size: {
                sm: cn('px-2 py-1', bodyText.xs, gap.xs),
                default: cn('px-3 py-1.5', bodyText.small, gap.sm),
                lg: cn('px-4 py-2', bodyText.base, gap.sm),
            },
            variant: {
                default: 'bg-destructive/10 text-destructive border border-destructive/20',
                solid: 'bg-destructive text-destructive-foreground',
                subtle: 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300',
            },
        },
        defaultVariants: {
            size: 'default',
            variant: 'subtle',
        },
    }
);

const statusMessageVariants = cva(
    ['font-medium', transitions.opacity],
    {
        variants: {
            emphasis: {
                normal: '',
                strong: 'font-semibold',
            },
        },
        defaultVariants: {
            emphasis: 'normal',
        },
    }
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function OfflineIndicator({ position = 'top' }: OfflineIndicatorProps = {}) {
    const isOnline = useOnlineStatus();
    const [showReconnected, setShowReconnected] = useState(false);
    const [wasOffline, setWasOffline] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        // Track when we go offline
        if (!isOnline) {
            setWasOffline(true);
            setShowReconnected(false);
        }

        // Show reconnected message when coming back online
        if (isOnline && wasOffline) {
            setShowReconnected(true);

            // Hide reconnected message after 3 seconds
            const timer = setTimeout(() => {
                setShowReconnected(false);
                setWasOffline(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isOnline, wasOffline]);

    // Don't render until mounted (SSR compatibility)
    if (!isMounted) return null;

    // Show nothing if online and wasn't recently offline
    if (isOnline && !showReconnected) {
        return null;
    }

    return (
        <div
            className={indicatorBannerVariants({
                status: !isOnline ? 'offline' : 'reconnected',
                position,
            })}
            role="alert"
            aria-live="polite"
        >
            <div className={cn('container mx-auto', flexPatterns.center, gap.sm)}>
                {!isOnline ? (
                    <>
                        <WifiOff className="h-5 w-5" aria-hidden="true" />
                        <span className={statusMessageVariants()}>
                            Je bent offline. Sommige functies zijn niet beschikbaar.
                        </span>
                    </>
                ) : showReconnected ? (
                    <>
                        <Wifi className="h-5 w-5 animate-pulse" aria-hidden="true" />
                        <span className={statusMessageVariants({ emphasis: 'strong' })}>
                            Verbinding hersteld! Bezig met synchroniseren...
                        </span>
                    </>
                ) : null}
            </div>
        </div>
    );
}

// ============================================================================
// COMPACT VARIANT
// ============================================================================

export function OfflineIndicatorCompact({
    className,
}: OfflineIndicatorCompactProps = {}) {
    const isOnline = useOnlineStatus();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Don't render until mounted (avoid hydration mismatch)
    if (!isMounted) return null;

    if (isOnline) return null;

    return (
        <div
            className={cn(compactIndicatorVariants(), className)}
            role="status"
            aria-label="Offline status"
        >
            <WifiOff className="h-4 w-4" aria-hidden="true" />
            <span>Offline</span>
        </div>
    );
}

// ============================================================================
// ALTERNATIVE VARIANTS
// ============================================================================

/**
 * Badge variant voor gebruik in status bars
 */
export function OfflineIndicatorBadge({
    size = 'default',
    variant = 'default',
}: {
    size?: 'sm' | 'default' | 'lg';
    variant?: 'default' | 'solid' | 'subtle';
} = {}) {
    const isOnline = useOnlineStatus();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted || isOnline) return null;

    return (
        <div
            className={compactIndicatorVariants({ size, variant })}
            role="status"
            aria-label="Offline"
            title="Je bent momenteel offline"
        >
            <WifiOff className={cn(size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4')} />
            <span>Offline</span>
        </div>
    );
}

/**
 * Dot indicator voor minimale visuele feedback
 */
export function OfflineIndicatorDot() {
    const isOnline = useOnlineStatus();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted || isOnline) return null;

    return (
        <div
            className={cn(
                'inline-flex items-center gap-1.5',
                bodyText.xs,
                'text-destructive'
            )}
            role="status"
            aria-label="Offline"
            title="Je bent offline"
        >
            <span className={cn('h-2 w-2 rounded-full bg-destructive animate-pulse')} />
            <span className="font-medium">Offline</span>
        </div>
    );
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
    OfflineIndicatorProps,
    OfflineIndicatorCompactProps,
};

export {
    indicatorBannerVariants,
    compactIndicatorVariants,
    statusMessageVariants,
};