'use client';

import React, { useMemo } from 'react';
import { useEarningsCalendar } from '@/lib/hooks/use-earnings-calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import {
    cn,
    cardStyles,
    spacing,
    padding,
    transitions,
    getSentimentColor,
    flexPatterns,
    gap,
    bodyText,
} from '@/lib/styles/theme';

interface EarningsCalendarProps {
    daysAhead?: number;
    limit?: number;
    variant?: 'default' | 'compact';
}

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const earningsCalendarVariants = cva(
    ['transition-all duration-200'],
    {
        variants: {
            variant: {
                default: '',
                compact: 'border-muted',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const earningsItemVariants = cva(
    ['flex items-center justify-between', transitions.colors],
    {
        variants: {
            variant: {
                default: 'p-3 border rounded-md hover:bg-accent/50',
                compact: 'py-2 first:pt-0 last:pb-0 hover:bg-accent/30 rounded px-1',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const earningsBadgeVariants = cva(
    ['inline-flex items-center px-2 py-0.5 rounded', bodyText.xs, 'font-medium'],
    {
        variants: {
            time: {
                bmo: 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300',
                amc: 'bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-300',
                default: 'bg-gray-100 text-gray-800 dark:bg-gray-950/30 dark:text-gray-300',
            },
        },
        defaultVariants: {
            time: 'default',
        },
    }
);

export function EarningsCalendar({ daysAhead = 7, limit = 5, variant = 'default' }: EarningsCalendarProps) {
    const isCompact = variant === 'compact';
    const from = useMemo(() => new Date().toISOString().split('T')[0], []);
    const to = useMemo(() => {
        const date = new Date();
        date.setDate(date.getDate() + daysAhead);
        return date.toISOString().split('T')[0];
    }, [daysAhead]);

    const { earnings, loading, error } = useEarningsCalendar(from, to);

    const displayEarnings = useMemo(() =>
        earnings?.earnings?.slice(0, limit) || [],
        [earnings, limit]
    );

    if (loading) {
        return (
            <Card variant="default" hover="lift" className={earningsCalendarVariants({ variant })}>
                <CardHeader className={cn(isCompact ? 'pb-3 px-4 pt-4' : padding.md)}>
                    <CardTitle className={cn(isCompact ? 'text-sm font-semibold' : 'text-lg font-semibold')}>
                        Earnings Calendar
                    </CardTitle>
                </CardHeader>
                <CardContent className={cn(isCompact ? 'px-4 pb-4' : padding.md)}>
                    <div className={cn(isCompact ? spacing.xs : spacing.md)}>
                        {[...Array(isCompact ? 3 : 5)].map((_, i) => (
                            <div key={i} className={earningsItemVariants({ variant })}>
                                <Skeleton className={cn(isCompact ? 'h-4 w-16' : 'h-5 w-20')} />
                                <Skeleton className={cn(isCompact ? 'h-4 w-20' : 'h-6 w-24')} />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || !earnings || displayEarnings.length === 0) {
        return (
            <Card variant="default" hover="lift" className={earningsCalendarVariants({ variant })}>
                <CardHeader className={cn(isCompact ? 'pb-3 px-4 pt-4' : padding.md)}>
                    <CardTitle className={cn(isCompact ? 'text-sm font-semibold' : 'text-lg font-semibold')}>
                        Earnings Calendar
                    </CardTitle>
                </CardHeader>
                <CardContent className={cn(isCompact ? 'px-4 pb-4' : padding.md)}>
                    <p className={cn(bodyText.small, 'text-muted-foreground')}>
                        {error?.message || 'No upcoming earnings'}
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (isCompact) {
        return (
            <Card variant="default" hover="lift" className={earningsCalendarVariants({ variant })}>
                <CardHeader className="pb-3 px-4 pt-4">
                    <div className={flexPatterns.between}>
                        <CardTitle className="text-sm font-semibold">Earnings Calendar</CardTitle>
                        <span className={cn(bodyText.xs, 'text-muted-foreground')}>{displayEarnings.length} scheduled</span>
                    </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                    <div className="space-y-0 divide-y divide-border">
                        {displayEarnings.map((earning, index) => {
                            const beatEstimate = earning.eps > earning.epsEstimated;
                            const isToday = new Date(earning.date).toDateString() === new Date().toDateString();

                            return (
                                <div
                                    key={`${earning.symbol}-${index}`}
                                    className={earningsItemVariants({ variant })}
                                >
                                    <div className={cn(flexPatterns.start, gap.sm, 'flex-1 min-w-0')}>
                                        <span className="font-semibold text-sm min-w-[45px]">{earning.symbol}</span>
                                        <span className={cn(bodyText.xs, 'text-muted-foreground')}>
                                            {new Date(earning.date).toLocaleDateString('nl-NL', {
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <div className={cn(flexPatterns.start, gap.xs)}>
                                        <span className={cn(bodyText.xs, 'font-medium tabular-nums text-muted-foreground')}>
                                            ${earning.eps.toFixed(2)}
                                        </span>
                                        {beatEstimate ? (
                                            <TrendingUp className={cn('w-3.5 h-3.5 flex-shrink-0', getSentimentColor('positive').split(' ')[1])} />
                                        ) : (
                                            <TrendingDown className={cn('w-3.5 h-3.5 flex-shrink-0', getSentimentColor('negative').split(' ')[1])} />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card variant="default" hover="lift">
            <CardHeader className={cn(padding.lg, 'pb-4')}>
                <CardTitle className="text-xl font-semibold">Earnings Calendar</CardTitle>
                <p className={cn(bodyText.small, 'text-muted-foreground')}>
                    Next {daysAhead} days • {displayEarnings.length} scheduled
                </p>
            </CardHeader>
            <CardContent className={padding.lg}>
                <div className={cn(spacing.sm)}>
                    {displayEarnings.map((earning, index) => {
                        const beatEstimate = earning.eps > earning.epsEstimated;
                        const epsVariance = ((earning.eps - earning.epsEstimated) / earning.epsEstimated) * 100;

                        return (
                            <div
                                key={`${earning.symbol}-${index}`}
                                className={earningsItemVariants({ variant: 'default' })}
                            >
                                <div className={cn(flexPatterns.start, gap.md, 'flex-1')}>
                                    <span className="font-bold min-w-[60px]">{earning.symbol}</span>
                                    <span className={cn(bodyText.small, 'text-muted-foreground')}>
                                        {new Date(earning.date).toLocaleDateString('nl-NL', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </span>
                                    <span className={earningsBadgeVariants({ time: earning.time as any })}>
                                        {earning.time?.toUpperCase() || 'TBD'}
                                    </span>
                                </div>

                                <div className={cn(flexPatterns.start, gap.md)}>
                                    <div className="text-right">
                                        <div className={cn(bodyText.small, 'font-semibold tabular-nums')}>
                                            ${earning.eps.toFixed(2)}
                                        </div>
                                        <div className={cn(bodyText.xs, 'text-muted-foreground')}>
                                            est. ${earning.epsEstimated.toFixed(2)}
                                        </div>
                                    </div>
                                    {beatEstimate ? (
                                        <TrendingUp className={cn('w-4 h-4 flex-shrink-0', getSentimentColor('positive').split(' ')[1])} />
                                    ) : (
                                        <TrendingDown className={cn('w-4 h-4 flex-shrink-0', getSentimentColor('negative').split(' ')[1])} />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}