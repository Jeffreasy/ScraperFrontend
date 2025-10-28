'use client';

import React from 'react';
import { useStockMetrics } from '@/lib/hooks/use-stock-metrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface FinancialMetricsCardProps {
    symbol: string;
}

interface MetricItemProps {
    label: string;
    value: string | number;
    subtitle?: string;
}

function MetricItem({ label, value, subtitle }: MetricItemProps) {
    return (
        <div className="space-y-1">
            <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
            <dd className="text-lg font-semibold">{value}</dd>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
    );
}

export function FinancialMetricsCard({ symbol }: FinancialMetricsCardProps) {
    const { metrics, loading, error } = useStockMetrics(symbol);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Financiële Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-6 w-16" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || !metrics) {
        return (
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle>Financiële Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
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
        <Card>
            <CardHeader>
                <CardTitle>Financiële Metrics</CardTitle>
                <p className="text-sm text-muted-foreground">Key financial indicators voor {symbol}</p>
            </CardHeader>
            <CardContent>
                <dl className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <MetricItem
                        label="Market Cap"
                        value={formatMarketCap(metrics.marketCap)}
                        subtitle="Marktkapitalisatie"
                    />
                    <MetricItem
                        label="P/E Ratio"
                        value={formatRatio(metrics.peRatio)}
                        subtitle="Koers/winst verhouding"
                    />
                    {metrics.eps && (
                        <MetricItem
                            label="EPS"
                            value={`$${metrics.eps.toFixed(2)}`}
                            subtitle="Winst per aandeel"
                        />
                    )}
                    {metrics.roe !== undefined && (
                        <MetricItem
                            label="ROE"
                            value={formatPercentage(metrics.roe)}
                            subtitle="Return on Equity"
                        />
                    )}
                    {metrics.roa !== undefined && (
                        <MetricItem
                            label="ROA"
                            value={formatPercentage(metrics.roa)}
                            subtitle="Return on Assets"
                        />
                    )}
                    {metrics.debtToEquity !== undefined && (
                        <MetricItem
                            label="Debt/Equity"
                            value={formatRatio(metrics.debtToEquity)}
                            subtitle="Schuld/eigen vermogen"
                        />
                    )}
                    {metrics.currentRatio !== undefined && (
                        <MetricItem
                            label="Current Ratio"
                            value={formatRatio(metrics.currentRatio)}
                            subtitle="Liquiditeit ratio"
                        />
                    )}
                    {metrics.dividendYield !== undefined && (
                        <MetricItem
                            label="Dividend Yield"
                            value={formatPercentage(metrics.dividendYield)}
                            subtitle="Dividend rendement"
                        />
                    )}
                    {metrics.priceToBook !== undefined && (
                        <MetricItem
                            label="P/B Ratio"
                            value={formatRatio(metrics.priceToBook)}
                            subtitle="Koers/boekwaarde"
                        />
                    )}
                </dl>
            </CardContent>
        </Card>
    );
}