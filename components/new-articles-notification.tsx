'use client';

import { cva } from 'class-variance-authority';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, flexPatterns, transitions, bodyText, gap } from '@/lib/styles/theme';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface NewArticlesNotificationProps {
    count: number;
    onRefresh: () => void;
    onDismiss: () => void;
}

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const notificationVariants = cva(
    [
        'fixed top-20 left-1/2 -translate-x-1/2 z-50',
        'rounded-lg border shadow-lg',
        'px-4 py-3',
        'backdrop-blur-sm',
        transitions.base,
    ],
    {
        variants: {
            variant: {
                default: [
                    'bg-primary/95 text-primary-foreground',
                    'border-primary',
                ],
                info: [
                    'bg-blue-500/95 text-white',
                    'border-blue-600',
                ],
                success: [
                    'bg-green-500/95 text-white',
                    'border-green-600',
                ],
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function NewArticlesNotification({
    count,
    onRefresh,
    onDismiss,
}: NewArticlesNotificationProps) {
    return (
        <div
            className={cn(
                notificationVariants(),
                'animate-in slide-in-from-top duration-300'
            )}
            role="alert"
            aria-live="polite"
        >
            <div className={cn(flexPatterns.between, gap.md)}>
                <div className={cn(flexPatterns.start, gap.sm)}>
                    <RefreshCw className="h-4 w-4 shrink-0" />
                    <span className={cn(bodyText.small, 'font-medium')}>
                        {count} {count === 1 ? 'nieuw artikel' : 'nieuwe artikelen'} beschikbaar
                    </span>
                </div>

                <div className={cn(flexPatterns.start, gap.xs)}>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRefresh}
                        className={cn(
                            'h-7 px-2',
                            'text-primary-foreground hover:text-primary-foreground',
                            'hover:bg-primary-foreground/20',
                            transitions.colors
                        )}
                    >
                        Toon nieuw
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDismiss}
                        className={cn(
                            'h-7 w-7 p-0',
                            'text-primary-foreground hover:text-primary-foreground',
                            'hover:bg-primary-foreground/20',
                            transitions.colors
                        )}
                        aria-label="Sluiten"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { NewArticlesNotificationProps };
export { notificationVariants };