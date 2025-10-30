'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { MarketMoversResponse, SectorsResponse } from '@/lib/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
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
    gridLayouts,
} from '@/lib/styles/theme';

interface MarketOverviewProps {
    variant?: 'default' | 'compact';
}

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const marketOverviewVariants = cva(
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

const marketCardVariants = cva(
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

const stockItemVariants = cva(
    ['flex items-center justify-between rounded', transitions.colors],
    {
        variants: {
            variant: {
                default: 'p-2 hover:bg-accent/50',
                compact: 'p-1.5 hover:bg-accent/30',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const sectorItemVariants = cva(
    ['flex items-center justify-between rounded', transitions.colors],
    {
        variants: {
            variant: {
                default: 'p-2 hover:bg-accent/50',
                compact: 'p-1.5 hover:bg-accent/30',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export function MarketOverview({ variant = 'default' }: MarketOverviewProps) {
    const isCompact = variant === 'compact';
    const [gainers, setGainers] = useState<MarketMoversResponse | null>(null);
    const [losers, setLosers] = useState<MarketMoversResponse | null>(null);
    const [actives, setActives] = useState<MarketMoversResponse | null>(null);
    const [sectors, setSectors] = useState<SectorsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function loadMarketData() {
            setLoading(true);
            setError(null);

            try {
                // Parallel fetch (efficient!)
                const [gainersData, losersData, activesData, sectorsData] = await Promise.all([
                    apiClient.getMarketGainers(),
                    apiClient.getMarketLosers(),
                    apiClient.getMarketActives(),
                    apiClient.getSectors()
                ]);

                // Direct responses now, no wrapper
                setGainers(gainersData);
                setLosers(losersData);
                setActives(activesData);
                setSectors(sectorsData);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to load market data'));
            } finally {
                setLoading(false);
            }
        }

        loadMarketData();

        // Auto-refresh every 5 minutes (cached, no extra cost)
        const interval = setInterval(loadMarketData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className={cn(gridLayouts.fourColumn, gap.lg)}>
                {[...Array(4)].map((_, i) => (
                    <Card key={i} variant="default" hover="lift" className={marketCardVariants({ variant })}>
                        <CardHeader className={cn(isCompact ? 'pb-3 px-4 pt-4' : padding.md)}>
                            <Skeleton className={cn(isCompact ? 'h-4 w-24' : 'h-6 w-32')} />
                        </CardHeader>
                        <CardContent className={cn(isCompact ? 'px-4 pb-4' : padding.md)}>
                            <div className={cn(isCompact ? spacing.xs : spacing.md)}>
                                {[...Array(isCompact ? 3 : 5)].map((_, j) => (
                                    <Skeleton key={j} className={cn(isCompact ? 'h-8 w-full' : 'h-12 w-full')} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <Card variant="default" hover="lift" className={cn(marketCardVariants({ variant }), 'border-destructive/50')}>
                <CardContent className={cn(isCompact ? 'px-4 py-4' : 'pt-6')}>
                    <p className={cn(bodyText.small, 'text-muted-foreground')}>{error.message}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className={cn(gridLayouts.fourColumn, gap.lg)}>
            {/* Top Gainers */}
            <Card variant="default" hover="lift" className={marketCardVariants({ variant })}>
                <CardHeader className={cn(isCompact ? 'pb-3 px-4 pt-4' : 'pb-3')}>
                    <CardTitle className={cn(flexPatterns.start, gap.sm, isCompact ? 'text-sm font-semibold' : 'text-lg font-semibold', getSentimentColor('positive').split(' ')[1])}>
                        <TrendingUp className="w-5 h-5" />
                        Top Gainers
                    </CardTitle>
                </CardHeader>
                <CardContent className={cn(isCompact ? 'px-4 pb-4' : padding.md)}>
                    <div className={cn(isCompact ? spacing.xs : spacing.sm)}>
                        {gainers?.gainers?.slice(0, isCompact ? 3 : 5).map((stock) => (
                            <div
                                key={stock.symbol}
                                className={stockItemVariants({ variant })}
                            >
                                <div className="flex-1">
                                    <div className={cn(isCompact ? 'font-semibold text-xs' : 'font-bold text-sm')}>{stock.symbol}</div>
                                    <div className={cn(bodyText.xs, 'text-muted-foreground truncate')}>
                                        {isCompact ? stock.symbol : stock.name}
                                    </div>
                                </div>
                                <div className="text-right ml-2">
                                    <div className={cn(isCompact ? 'font-medium text-xs' : 'font-semibold text-sm')}>
                                        ${stock.price.toFixed(2)}
                                    </div>
                                    <div className={cn(bodyText.xs, 'font-medium', getSentimentColor('positive').split(' ')[1])}>
                                        +{stock.changePercent.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Top Losers */}
            <Card variant="default" hover="lift" className={marketCardVariants({ variant })}>
                <CardHeader className={cn(isCompact ? 'pb-3 px-4 pt-4' : 'pb-3')}>
                    <CardTitle className={cn(flexPatterns.start, gap.sm, isCompact ? 'text-sm font-semibold' : 'text-lg font-semibold', getSentimentColor('negative').split(' ')[1])}>
                        <TrendingDown className="w-5 h-5" />
                        Top Losers
                    </CardTitle>
                </CardHeader>
                <CardContent className={cn(isCompact ? 'px-4 pb-4' : padding.md)}>
                    <div className={cn(isCompact ? spacing.xs : spacing.sm)}>
                        {losers?.losers?.slice(0, isCompact ? 3 : 5).map((stock) => (
                            <div
                                key={stock.symbol}
                                className={stockItemVariants({ variant })}
                            >
                                <div className="flex-1">
                                    <div className={cn(isCompact ? 'font-semibold text-xs' : 'font-bold text-sm')}>{stock.symbol}</div>
                                    <div className={cn(bodyText.xs, 'text-muted-foreground truncate')}>
                                        {isCompact ? stock.symbol : stock.name}
                                    </div>
                                </div>
                                <div className="text-right ml-2">
                                    <div className={cn(isCompact ? 'font-medium text-xs' : 'font-semibold text-sm')}>
                                        ${stock.price.toFixed(2)}
                                    </div>
                                    <div className={cn(bodyText.xs, 'font-medium', getSentimentColor('negative').split(' ')[1])}>
                                        {stock.changePercent.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Most Active */}
            <Card variant="default" hover="lift" className={marketCardVariants({ variant })}>
                <CardHeader className={cn(isCompact ? 'pb-3 px-4 pt-4' : 'pb-3')}>
                    <CardTitle className={cn(flexPatterns.start, gap.sm, isCompact ? 'text-sm font-semibold' : 'text-lg font-semibold')}>
                        <Activity className="w-5 h-5" />
                        Most Active
                    </CardTitle>
                </CardHeader>
                <CardContent className={cn(isCompact ? 'px-4 pb-4' : padding.md)}>
                    <div className={cn(isCompact ? spacing.xs : spacing.sm)}>
                        {actives?.actives?.slice(0, isCompact ? 3 : 5).map((stock) => (
                            <div
                                key={stock.symbol}
                                className={stockItemVariants({ variant })}
                            >
                                <div className="flex-1">
                                    <div className={cn(isCompact ? 'font-semibold text-xs' : 'font-bold text-sm')}>{stock.symbol}</div>
                                    <div className={cn(bodyText.xs, 'text-muted-foreground')}>
                                        Vol: {(stock.volume / 1000000).toFixed(1)}M
                                    </div>
                                </div>
                                <div className="text-right ml-2">
                                    <div className={cn(isCompact ? 'font-medium text-xs' : 'font-semibold text-sm')}>
                                        ${stock.price.toFixed(2)}
                                    </div>
                                    <div className={cn(bodyText.xs, 'font-medium', stock.changePercent >= 0
                                        ? getSentimentColor('positive').split(' ')[1]
                                        : getSentimentColor('negative').split(' ')[1]
                                    )}>
                                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Sector Performance */}
            <Card variant="default" hover="lift" className={marketCardVariants({ variant })}>
                <CardHeader className={cn(isCompact ? 'pb-3 px-4 pt-4' : 'pb-3')}>
                    <CardTitle className={cn(isCompact ? 'text-sm font-semibold' : 'text-lg font-semibold')}>
                        Sector Performance
                    </CardTitle>
                </CardHeader>
                <CardContent className={cn(isCompact ? 'px-4 pb-4' : padding.md)}>
                    <div className={cn(isCompact ? spacing.xs : spacing.sm)}>
                        {sectors?.sectors?.slice(0, isCompact ? 6 : 10).map((sector) => (
                            <div
                                key={sector.sector}
                                className={sectorItemVariants({ variant })}
                            >
                                <div className="flex-1">
                                    <div className={cn(isCompact ? 'text-xs font-medium' : 'text-sm font-medium', 'truncate')}>
                                        {sector.sector}
                                    </div>
                                </div>
                                <div className={cn(isCompact ? 'text-xs font-semibold' : 'text-sm font-semibold', 'ml-2', sector.changePercent >= 0
                                    ? getSentimentColor('positive').split(' ')[1]
                                    : getSentimentColor('negative').split(' ')[1]
                                )}>
                                    {sector.changePercent >= 0 ? '+' : ''}{sector.changePercent.toFixed(2)}%
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}