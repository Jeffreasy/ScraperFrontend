'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StockMiniChart } from './stock-mini-chart';
import { useStockQuote } from '@/lib/hooks/use-stock-quote';
import { useStockMetrics } from '@/lib/hooks/use-stock-metrics';
import { usePriceTarget } from '@/lib/hooks/use-stock-metrics';
import { cn, bodyText, flexPatterns, gap, transitions } from '@/lib/styles/theme';

interface EnhancedStockCardProps {
    symbol: string;
    showChart?: boolean;
    showMetrics?: boolean;
    showPriceTarget?: boolean;
    compact?: boolean;
    className?: string;
}

export function EnhancedStockCard({
    symbol,
    showChart = true,
    showMetrics = true,
    showPriceTarget = true,
    compact = false,
    className,
}: EnhancedStockCardProps) {
    const [expanded, setExpanded] = useState(false);
    const { data: quote, isLoading: quoteLoading } = useStockQuote(symbol);
    const { data: metrics, isLoading: metricsLoading } = useStockMetrics(symbol, {
        enabled: showMetrics && expanded,
    });
    const { data: priceTarget, isLoading: targetLoading } = usePriceTarget(symbol, {
        enabled: showPriceTarget && expanded,
    });

    if (quoteLoading) {
        return <StockCardSkeleton compact={compact} />;
    }

    if (!quote) {
        return null;
    }

    const isPositive = quote.change >= 0;
    const changePercent = quote.change_percent;

    return (
        <Card className={cn('overflow-hidden', className)}>
            <CardHeader className={cn(compact ? 'p-3' : 'p-4', 'pb-2')}>
                <div className={cn(flexPatterns.between, gap.sm)}>
                    <div className="flex-1 min-w-0">
                        <div className={cn(flexPatterns.start, gap.sm, 'mb-1')}>
                            <h4 className={cn(compact ? bodyText.small : 'text-base', 'font-bold truncate')}>
                                {symbol}
                            </h4>
                            {quote.name && (
                                <span className={cn(bodyText.xs, 'text-muted-foreground truncate')}>
                                    {quote.name}
                                </span>
                            )}
                        </div>
                        <div className={cn(flexPatterns.start, gap.md)}>
                            <span className={cn(compact ? 'text-lg' : 'text-2xl', 'font-bold')}>
                                ${quote.price.toFixed(2)}
                            </span>
                            <div
                                className={cn(
                                    'inline-flex items-center gap-1',
                                    compact ? bodyText.xs : bodyText.small,
                                    'font-semibold px-2 py-0.5 rounded',
                                    isPositive
                                        ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                                        : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                                )}
                            >
                                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {isPositive ? '+' : ''}
                                {changePercent.toFixed(2)}%
                            </div>
                        </div>
                    </div>

                    {showChart && !compact && (
                        <StockMiniChart symbol={symbol} width={100} height={40} showChange={false} />
                    )}
                </div>
            </CardHeader>

            {!compact && (
                <CardContent className="p-4 pt-2">
                    <QuickStats quote={quote} />

                    {(showMetrics || showPriceTarget) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpanded(!expanded)}
                            className={cn('w-full mt-2', bodyText.xs)}
                        >
                            {expanded ? (
                                <>
                                    <ChevronUp className="h-3 w-3 mr-1" />
                                    Verberg details
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-3 w-3 mr-1" />
                                    Toon details
                                </>
                            )}
                        </Button>
                    )}

                    {expanded && (
                        <div className={cn('mt-3 pt-3 border-t space-y-3', 'animate-in slide-in-from-top duration-300')}>
                            {showMetrics && (
                                <MetricsSection metrics={metrics} isLoading={metricsLoading} />
                            )}
                            {showPriceTarget && (
                                <PriceTargetSection
                                    priceTarget={priceTarget}
                                    currentPrice={quote.price}
                                    isLoading={targetLoading}
                                />
                            )}
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}

// Sub Components
function QuickStats({ quote }: { quote: any }) {
    return (
        <div className="grid grid-cols-2 gap-2">
            <Stat label="Volume" value={formatVolume(quote.volume)} />
            <Stat label="Market Cap" value={formatMarketCap(quote.market_cap)} />
            {quote.day_high && <Stat label="High" value={`$${quote.day_high.toFixed(2)}`} />}
            {quote.day_low && <Stat label="Low" value={`$${quote.day_low.toFixed(2)}`} />}
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className={cn(bodyText.xs, 'text-muted-foreground')}>{label}</div>
            <div className={cn(bodyText.small, 'font-semibold')}>{value}</div>
        </div>
    );
}

function MetricsSection({ metrics, isLoading }: { metrics: any; isLoading: boolean }) {
    if (isLoading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        );
    }

    if (!metrics) return null;

    return (
        <div>
            <h5 className={cn(bodyText.small, 'font-semibold mb-2', flexPatterns.start, gap.xs)}>
                <BarChart3 className="h-4 w-4" />
                Key Metrics
            </h5>
            <div className="grid grid-cols-2 gap-2">
                {metrics.peRatio && <Stat label="P/E Ratio" value={metrics.peRatio.toFixed(2)} />}
                {metrics.eps && <Stat label="EPS" value={`$${metrics.eps.toFixed(2)}`} />}
                {metrics.dividendYield && (
                    <Stat label="Dividend" value={`${(metrics.dividendYield * 100).toFixed(2)}%`} />
                )}
                {metrics.debtToEquity && (
                    <Stat label="Debt/Equity" value={metrics.debtToEquity.toFixed(2)} />
                )}
            </div>
        </div>
    );
}

function PriceTargetSection({
    priceTarget,
    currentPrice,
    isLoading,
}: {
    priceTarget: any;
    currentPrice: number;
    isLoading: boolean;
}) {
    if (isLoading) {
        return <Skeleton className="h-16 w-full" />;
    }

    if (!priceTarget || !priceTarget.targetMean) return null;

    const upside = ((priceTarget.targetMean - currentPrice) / currentPrice) * 100;
    const isPositive = upside >= 0;

    return (
        <div>
            <h5 className={cn(bodyText.small, 'font-semibold mb-2', flexPatterns.start, gap.xs)}>
                <Target className="h-4 w-4" />
                Price Target
            </h5>
            <div className="p-2 rounded-lg bg-muted/30">
                <div className={cn(flexPatterns.between, 'mb-2')}>
                    <span className={bodyText.xs}>Target</span>
                    <span className={cn(bodyText.small, 'font-bold')}>${priceTarget.targetMean.toFixed(2)}</span>
                </div>
                <div className={cn(flexPatterns.between, 'mb-2')}>
                    <span className={bodyText.xs}>Range</span>
                    <span className={bodyText.xs}>
                        ${priceTarget.targetLow?.toFixed(2)} - ${priceTarget.targetHigh?.toFixed(2)}
                    </span>
                </div>
                <div className={cn(flexPatterns.between)}>
                    <span className={bodyText.xs}>Upside</span>
                    <span
                        className={cn(
                            bodyText.small,
                            'font-semibold',
                            isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        )}
                    >
                        {isPositive ? '+' : ''}
                        {upside.toFixed(2)}%
                    </span>
                </div>
            </div>
        </div>
    );
}

function StockCardSkeleton({ compact }: { compact: boolean }) {
    return (
        <Card>
            <CardHeader className={cn(compact ? 'p-3' : 'p-4')}>
                <Skeleton className="h-6 w-20 mb-2" />
                <Skeleton className="h-8 w-32" />
            </CardHeader>
            {!compact && (
                <CardContent className="p-4 pt-0">
                    <div className="grid grid-cols-2 gap-2">
                        <Skeleton className="h-12" />
                        <Skeleton className="h-12" />
                    </div>
                </CardContent>
            )}
        </Card>
    );
}

// Utility functions
function formatVolume(volume: number): string {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
    return volume.toString();
}

function formatMarketCap(marketCap: number): string {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toLocaleString()}`;
}