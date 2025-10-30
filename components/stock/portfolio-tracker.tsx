'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { StockQuote } from '@/lib/types/api';
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

interface PortfolioTrackerProps {
    symbols: string[];
    variant?: 'default' | 'compact';
}

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const portfolioTrackerVariants = cva(
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

const portfolioItemVariants = cva(
    ['flex items-center justify-between rounded', transitions.colors],
    {
        variants: {
            variant: {
                default: 'p-3 border hover:bg-accent/50',
                compact: 'p-2 border hover:bg-accent/30',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const changeBadgeVariants = cva(
    ['inline-flex items-center px-2 py-0.5 rounded', bodyText.xs, 'font-medium'],
    {
        variants: {
            sentiment: {
                positive: getSentimentColor('positive'),
                negative: getSentimentColor('negative'),
            },
        },
        defaultVariants: {
            sentiment: 'positive',
        },
    }
);

export function PortfolioTracker({ symbols, variant = 'default' }: PortfolioTrackerProps) {
    const isCompact = variant === 'compact';
    const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [totalChange, setTotalChange] = useState(0);

    useEffect(() => {
        async function loadPortfolio() {
            if (symbols.length === 0) {
                setQuotes({});
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Single batch call for all symbols!
                const response = await apiClient.getMultipleQuotes(symbols);

                // Direct response now, no wrapper
                setQuotes(response);

                // Calculate average change
                const changes = Object.values(response).map(q => q.change_percent);
                const avgChange = changes.reduce((sum, c) => sum + c, 0) / changes.length;
                setTotalChange(avgChange);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Unknown error'));
            } finally {
                setLoading(false);
            }
        }

        loadPortfolio();

        // Refresh every 1 minute (cached, so no extra API calls if within cache TTL)
        const interval = setInterval(loadPortfolio, 60 * 1000);
        return () => clearInterval(interval);
    }, [symbols]);

    if (loading) {
        return (
            <Card variant="default" hover="lift" className={portfolioTrackerVariants({ variant })}>
                <CardHeader className={cn(isCompact ? 'pb-3 px-4 pt-4' : padding.md)}>
                    <CardTitle className={cn(isCompact ? 'text-sm font-semibold' : 'text-lg font-semibold')}>
                        Portfolio Overview
                    </CardTitle>
                </CardHeader>
                <CardContent className={cn(isCompact ? 'px-4 pb-4' : padding.md)}>
                    <div className={cn(isCompact ? spacing.xs : spacing.md)}>
                        {symbols.map((symbol) => (
                            <div key={symbol} className={portfolioItemVariants({ variant })}>
                                <Skeleton className={cn(isCompact ? 'h-4 w-12' : 'h-5 w-16')} />
                                <Skeleton className={cn(isCompact ? 'h-5 w-16' : 'h-6 w-24')} />
                                <Skeleton className={cn(isCompact ? 'h-4 w-12' : 'h-5 w-20')} />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card variant="default" hover="lift" className={cn(portfolioTrackerVariants({ variant }), 'border-destructive/50')}>
                <CardHeader className={cn(isCompact ? 'pb-3 px-4 pt-4' : padding.md)}>
                    <CardTitle className={cn(isCompact ? 'text-sm font-semibold' : 'text-lg font-semibold')}>
                        Portfolio Overview
                    </CardTitle>
                </CardHeader>
                <CardContent className={cn(isCompact ? 'px-4 pb-4' : padding.md)}>
                    <p className={cn(bodyText.small, 'text-muted-foreground')}>{error.message}</p>
                </CardContent>
            </Card>
        );
    }

    const isPositiveTotal = totalChange >= 0;

    return (
        <Card variant="default" hover="lift" className={portfolioTrackerVariants({ variant })}>
            <CardHeader className={cn(isCompact ? 'pb-3 px-4 pt-4' : padding.md)}>
                <div className={flexPatterns.between}>
                    <CardTitle className={cn(isCompact ? 'text-sm font-semibold' : 'text-lg font-semibold')}>
                        Portfolio Overview
                    </CardTitle>
                    <div className={cn(flexPatterns.start, gap.sm, isCompact ? 'text-sm font-bold' : 'text-lg font-bold', isPositiveTotal
                        ? getSentimentColor('positive').split(' ')[1]
                        : getSentimentColor('negative').split(' ')[1]
                    )}>
                        {isPositiveTotal ? (
                            <TrendingUp className="w-4 h-4" />
                        ) : (
                            <TrendingDown className="w-4 h-4" />
                        )}
                        {isPositiveTotal ? '+' : ''}{totalChange.toFixed(2)}%
                    </div>
                </div>
                {!isCompact && (
                    <p className={cn(bodyText.small, 'text-muted-foreground')}>
                        {symbols.length} aande{symbols.length !== 1 ? 'len' : 'el'} gevolgd
                    </p>
                )}
            </CardHeader>
            <CardContent className={cn(isCompact ? 'px-4 pb-4' : padding.md)}>
                <div className={cn(isCompact ? spacing.xs : spacing.sm)}>
                    {symbols.map((symbol) => {
                        const quote = quotes[symbol];
                        if (!quote) {
                            return (
                                <div key={symbol} className={cn(portfolioItemVariants({ variant }), 'opacity-50')}>
                                    <span className={cn(isCompact ? 'font-medium text-sm' : 'font-medium')}>{symbol}</span>
                                    <span className={cn(bodyText.xs, 'text-muted-foreground')}>Niet beschikbaar</span>
                                </div>
                            );
                        }

                        const isPositive = quote.change >= 0;

                        return (
                            <div
                                key={symbol}
                                className={portfolioItemVariants({ variant })}
                            >
                                <div className="flex-1">
                                    <div className={cn(isCompact ? 'font-bold text-sm' : 'font-bold')}>{quote.symbol}</div>
                                    <div className={cn(bodyText.xs, 'text-muted-foreground')}>{isCompact ? quote.symbol : quote.name}</div>
                                </div>
                                <div className="text-right">
                                    <div className={cn(isCompact ? 'font-bold text-sm' : 'font-bold')}>
                                        {quote.currency === 'USD' ? '$' : '€'}{quote.price.toFixed(2)}
                                    </div>
                                    <div className={changeBadgeVariants({ sentiment: isPositive ? 'positive' : 'negative' })}>
                                        {isPositive ? '+' : ''}{quote.change_percent.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {symbols.length === 0 && (
                    <div className={cn('text-center py-8', bodyText.small, 'text-muted-foreground')}>
                        Geen aandelen toegevoegd aan portfolio
                    </div>
                )}
            </CardContent>
        </Card>
    );
}