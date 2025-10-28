'use client';

import React, { useMemo } from 'react';
import { useEarningsCalendar } from '@/lib/hooks/use-earnings-calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface EarningsCalendarProps {
    daysAhead?: number;
    limit?: number;
    compact?: boolean;
}

export function EarningsCalendar({ daysAhead = 7, limit = 5, compact = false }: EarningsCalendarProps) {
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
            <Card className={compact ? 'border-muted' : undefined}>
                <CardHeader className={compact ? 'pb-3 px-4 pt-4' : undefined}>
                    <CardTitle className={compact ? 'text-sm font-semibold' : undefined}>
                        Earnings Calendar
                    </CardTitle>
                </CardHeader>
                <CardContent className={compact ? 'px-4 pb-4' : undefined}>
                    <div className={compact ? 'space-y-1' : 'space-y-3'}>
                        {[...Array(compact ? 3 : 5)].map((_, i) => (
                            <div key={i} className={`flex items-center justify-between ${compact ? 'py-1.5' : 'p-3 border rounded-lg'}`}>
                                <Skeleton className={compact ? 'h-4 w-16' : 'h-5 w-20'} />
                                <Skeleton className={compact ? 'h-4 w-20' : 'h-6 w-24'} />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || !earnings || displayEarnings.length === 0) {
        return (
            <Card className={compact ? 'border-muted' : undefined}>
                <CardHeader className={compact ? 'pb-3 px-4 pt-4' : undefined}>
                    <CardTitle className={compact ? 'text-sm font-semibold' : undefined}>
                        Earnings Calendar
                    </CardTitle>
                </CardHeader>
                <CardContent className={compact ? 'px-4 pb-4' : undefined}>
                    <p className="text-sm text-muted-foreground">
                        {error?.message || 'No upcoming earnings'}
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (compact) {
        return (
            <Card className="border-muted">
                <CardHeader className="pb-3 px-4 pt-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold">Earnings Calendar</CardTitle>
                        <span className="text-xs text-muted-foreground">{displayEarnings.length} scheduled</span>
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
                                    className={`flex items-center justify-between py-2 first:pt-0 last:pb-0 hover:bg-accent/30 transition-colors rounded px-1 ${isToday ? 'bg-primary/5' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className="font-semibold text-sm min-w-[45px]">{earning.symbol}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(earning.date).toLocaleDateString('nl-NL', {
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-medium tabular-nums text-muted-foreground">
                                            ${earning.eps.toFixed(2)}
                                        </span>
                                        {beatEstimate ? (
                                            <TrendingUp className="w-3.5 h-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                        ) : (
                                            <TrendingDown className="w-3.5 h-3.5 text-red-600 dark:text-red-400 flex-shrink-0" />
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
        <Card>
            <CardHeader className="pb-4">
                <CardTitle>Earnings Calendar</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Next {daysAhead} days • {displayEarnings.length} scheduled
                </p>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {displayEarnings.map((earning, index) => {
                        const beatEstimate = earning.eps > earning.epsEstimated;
                        const epsVariance = ((earning.eps - earning.epsEstimated) / earning.epsEstimated) * 100;

                        return (
                            <div
                                key={`${earning.symbol}-${index}`}
                                className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <span className="font-bold min-w-[60px]">{earning.symbol}</span>
                                    <span className="text-sm text-muted-foreground">
                                        {new Date(earning.date).toLocaleDateString('nl-NL', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded ${earning.time === 'bmo'
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300'
                                            : earning.time === 'amc'
                                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-300'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-950/30 dark:text-gray-300'
                                        }`}>
                                        {earning.time.toUpperCase()}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="text-sm font-semibold tabular-nums">
                                            ${earning.eps.toFixed(2)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            est. ${earning.epsEstimated.toFixed(2)}
                                        </div>
                                    </div>
                                    {beatEstimate ? (
                                        <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
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