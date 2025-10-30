'use client';

import React from 'react';
import { useStockMetrics } from '@/lib/hooks/use-stock-metrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cva, type VariantProps } from 'class-variance-authority';
import {
    cn,
    cardStyles,
    spacing,
    padding,
    transitions,
    bodyText,
    gap,
    flexPatterns,
} from '@/lib/styles/theme';

interface FinancialMetricsCardProps {
    symbol: string;
    variant?: 'default' | 'compact';
}

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const financialMetricsCardVariants = cva(
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

const metricItemVariants = cva(
    ['space-y-1'],
    {
        variants: {
            variant: {
                default: '',
                compact: 'space-y-0.5',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const metricGridVariants = cva(
    ['grid gap-6'],
    {
        variants: {
            variant: {
                default: 'grid-cols-2 md:grid-cols-3',
                compact: 'grid-cols-1 sm:grid-cols-2',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

interface MetricItemProps {
    label: string;
    value: string | number;
    subtitle?: string;
    variant?: 'default' | 'compact';
}

function MetricItem({ label, value, subtitle, variant = 'default' }: MetricItemProps) {
    return (
        <div className={metricItemVariants({ variant })}>
            <dt className={cn(bodyText.small, 'font-medium text-muted-foreground')}>{label}</dt>
            <dd className={cn(variant === 'compact' ? bodyText.base : 'text-lg', 'font-semibold')}>{value}</dd>
            {subtitle && <p className={cn(bodyText.xs, 'text-muted-foreground')}>{subtitle}</p>}
        </div>
    );
}

export function FinancialMetricsCard({ symbol, variant = 'default' }: FinancialMetricsCardProps) {
    const isCompact = variant === 'compact';
    const { metrics, loading, error } = useStockMetrics(symbol);

    if (loading) {
        return (
            <Card variant="default" hover="lift" className={financialMetricsCardVariants({ variant })}>
                <CardHeader className={cn(isCompact ? 'pb-3 px-4 pt-4' : padding.md)}>
                    <CardTitle className={cn(isCompact ? 'text-sm font-semibold' : 'text-lg font-semibold')}>
                        Financiële Metrics
                    </CardTitle>
                </CardHeader>
                <CardContent className={cn(isCompact ? 'px-4 pb-4' : padding.md)}>
                    <div className={metricGridVariants({ variant })}>
                        {[...Array(isCompact ? 4 : 6)].map((_, i) => (
                            <div key={i} className={metricItemVariants({ variant })}>
                                <Skeleton className={cn(isCompact ? 'h-3 w-16' : 'h-4 w-20')} />
                                <Skeleton className={cn(isCompact ? 'h-4 w-12' : 'h-6 w-16')} />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || !metrics) {
        return (
            <Card variant="default" hover="lift" className={cn(financialMetricsCardVariants({ variant }), 'border-destructive/50')}>
                <CardHeader className={cn(isCompact ? 'pb-3 px-4 pt-4' : padding.md)}>
                    <CardTitle className={cn(isCompact ? 'text-sm font-semibold' : 'text-lg font-semibold')}>
                        Financiële Metrics
                    </CardTitle>
                </CardHeader>
                <CardContent className={cn(isCompact ? 'px-4 pb-4' : padding.md)}>
                    <p className={cn(bodyText.small, 'text-muted-foreground')}>
                        {error?.message || 'Metrics niet beschikbaar'}
                    </p>
                </CardContent>
            </Card>
        );
    }

    const formatMarketCap = (value: number) => {
        if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
        if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
        if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
        return `$${value.toFixed(2)}`;
    };

    const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`;
    const formatRatio = (value: number) => value.toFixed(2);

    return (
        <Card variant="default" hover="lift" className={financialMetricsCardVariants({ variant })}>
            <CardHeader className={cn(isCompact ? 'pb-3 px-4 pt-4' : padding.md)}>
                <CardTitle className={cn(isCompact ? 'text-sm font-semibold' : 'text-lg font-semibold')}>
                    Financiële Metrics
                </CardTitle>
                {!isCompact && (
                    <p className={cn(bodyText.small, 'text-muted-foreground')}>
                        Key financial indicators voor {symbol}
                    </p>
                )}
            </CardHeader>
            <CardContent className={cn(isCompact ? 'px-4 pb-4' : padding.md)}>
                <dl className={metricGridVariants({ variant })}>
                    <MetricItem
                        label="Market Cap"
                        value={formatMarketCap(metrics.marketCap)}
                        subtitle={isCompact ? undefined : "Marktkapitalisatie"}
                        variant={variant}
                    />
                    <MetricItem
                        label="P/E Ratio"
                        value={formatRatio(metrics.peRatio)}
                        subtitle={isCompact ? undefined : "Koers/winst verhouding"}
                        variant={variant}
                    />
                    {metrics.eps && (
                        <MetricItem
                            label="EPS"
                            value={`$${metrics.eps.toFixed(2)}`}
                            subtitle={isCompact ? undefined : "Winst per aandeel"}
                            variant={variant}
                        />
                    )}
                    {metrics.roe !== undefined && (
                        <MetricItem
                            label="ROE"
                            value={formatPercentage(metrics.roe)}
                            subtitle={isCompact ? undefined : "Return on Equity"}
                            variant={variant}
                        />
                    )}
                    {metrics.roa !== undefined && (
                        <MetricItem
                            label="ROA"
                            value={formatPercentage(metrics.roa)}
                            subtitle={isCompact ? undefined : "Return on Assets"}
                            variant={variant}
                        />
                    )}
                    {metrics.debtToEquity !== undefined && (
                        <MetricItem
                            label="Debt/Equity"
                            value={formatRatio(metrics.debtToEquity)}
                            subtitle={isCompact ? undefined : "Schuld/eigen vermogen"}
                            variant={variant}
                        />
                    )}
                    {metrics.currentRatio !== undefined && (
                        <MetricItem
                            label="Current Ratio"
                            value={formatRatio(metrics.currentRatio)}
                            subtitle={isCompact ? undefined : "Liquiditeit ratio"}
                            variant={variant}
                        />
                    )}
                    {metrics.dividendYield !== undefined && (
                        <MetricItem
                            label="Dividend Yield"
                            value={formatPercentage(metrics.dividendYield)}
                            subtitle={isCompact ? undefined : "Dividend rendement"}
                            variant={variant}
                        />
                    )}
                    {metrics.priceToBook !== undefined && (
                        <MetricItem
                            label="P/B Ratio"
                            value={formatRatio(metrics.priceToBook)}
                            subtitle={isCompact ? undefined : "Koers/boekwaarde"}
                            variant={variant}
                        />
                    )}
                </dl>
            </CardContent>
        </Card>
    );
}