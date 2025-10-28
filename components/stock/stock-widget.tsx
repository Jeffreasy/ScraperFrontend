'use client';

import React, { useEffect, useState } from 'react';
import { useStockQuote } from '@/lib/hooks/use-stock-quote';
import { useStockMetrics } from '@/lib/hooks/use-stock-metrics';
import { useStockNews } from '@/lib/hooks/use-stock-news';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink } from 'lucide-react';

interface StockWidgetProps {
    symbol: string;
}

interface MetricItemProps {
    label: string;
    value: string;
}

function MetricItem({ label, value }: MetricItemProps) {
    return (
        <div className="text-center">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-sm font-semibold mt-1">{value}</div>
        </div>
    );
}

export function StockWidget({ symbol }: StockWidgetProps) {
    const { quote, loading: quoteLoading, error: quoteError } = useStockQuote(symbol);
    const { metrics, loading: metricsLoading } = useStockMetrics(symbol);
    const { news, loading: newsLoading } = useStockNews(symbol, 5);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <Skeleton className="h-40 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (quoteLoading) {
        return (
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                    <Skeleton className="h-16 w-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (quoteError || !quote) {
        return (
            <Card className="border-destructive/50">
                <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">
                        {quoteError?.message || 'Stock data niet beschikbaar'}
                    </p>
                </CardContent>
            </Card>
        );
    }

    const isPositive = quote.change >= 0;
    const changeColor = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    const changeBg = isPositive ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30';

    const formatMarketCap = (value: number) => {
        if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
        if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
        if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
        return `$${value.toFixed(2)}`;
    };

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-6 space-y-6">
                {/* Price Card */}
                <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">{quote.symbol}</h2>
                            <p className="text-sm text-muted-foreground">{quote.name}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold">
                                {quote.currency === 'USD' ? '$' : '€'}{quote.price.toFixed(2)}
                            </div>
                            <div className={`text-sm font-medium ${changeColor} ${changeBg} px-2 py-1 rounded mt-1 inline-block`}>
                                {isPositive ? '+' : ''}{quote.change.toFixed(2)}
                                ({isPositive ? '+' : ''}{quote.change_percent.toFixed(2)}%)
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
                        <span>Volume: {(quote.volume / 1000000).toFixed(2)}M</span>
                        <span>{quote.exchange}</span>
                    </div>
                </div>

                {/* Metrics Grid */}
                {!metricsLoading && metrics && (
                    <div className="border-t pt-4">
                        <h3 className="text-sm font-semibold mb-3">Key Metrics</h3>
                        <div className="grid grid-cols-4 gap-4">
                            <MetricItem label="P/E" value={metrics.peRatio.toFixed(2)} />
                            <MetricItem label="Market Cap" value={formatMarketCap(metrics.marketCap)} />
                            {metrics.roe !== undefined && (
                                <MetricItem label="ROE" value={`${(metrics.roe * 100).toFixed(1)}%`} />
                            )}
                            {metrics.dividendYield !== undefined && (
                                <MetricItem label="Div Yield" value={`${(metrics.dividendYield * 100).toFixed(2)}%`} />
                            )}
                        </div>
                    </div>
                )}

                {/* Recent News */}
                {!newsLoading && news && news.news.length > 0 && (
                    <div className="border-t pt-4">
                        <h3 className="text-sm font-semibold mb-3">Recent News</h3>
                        <div className="space-y-2">
                            {news.news.slice(0, 3).map((item, index) => (
                                <a
                                    key={index}
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block group hover:bg-accent/50 rounded p-2 transition-colors"
                                >
                                    <div className="flex items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                                                {item.title}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                <span>{item.site}</span>
                                                <span>•</span>
                                                <time dateTime={item.publishedDate}>
                                                    {new Date(item.publishedDate).toLocaleDateString('nl-NL', {
                                                        day: 'numeric',
                                                        month: 'short'
                                                    })}
                                                </time>
                                            </div>
                                        </div>
                                        <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Last Updated */}
                <div className="text-xs text-muted-foreground text-center border-t pt-3">
                    Laatst bijgewerkt: {new Date(quote.last_updated).toLocaleString('nl-NL')}
                </div>
            </CardContent>
        </Card>
    );
}