'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { StockQuote } from '@/lib/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PortfolioTrackerProps {
    symbols: string[];
}

export function PortfolioTracker({ symbols }: PortfolioTrackerProps) {
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

                if (response.success && response.data) {
                    setQuotes(response.data);

                    // Calculate average change
                    const changes = Object.values(response.data).map(q => q.change_percent);
                    const avgChange = changes.reduce((sum, c) => sum + c, 0) / changes.length;
                    setTotalChange(avgChange);
                } else {
                    throw new Error(response.error?.message || 'Failed to fetch portfolio');
                }
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
            <Card>
                <CardHeader>
                    <CardTitle>Portfolio Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {symbols.map((symbol) => (
                            <div key={symbol} className="flex items-center justify-between p-3 border rounded-lg">
                                <Skeleton className="h-5 w-16" />
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-5 w-20" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle>Portfolio Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{error.message}</p>
                </CardContent>
            </Card>
        );
    }

    const isPositiveTotal = totalChange >= 0;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Portfolio Overview</CardTitle>
                    <div className={`flex items-center gap-1 text-lg font-bold ${isPositiveTotal
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                        {isPositiveTotal ? (
                            <TrendingUp className="w-5 h-5" />
                        ) : (
                            <TrendingDown className="w-5 h-5" />
                        )}
                        {isPositiveTotal ? '+' : ''}{totalChange.toFixed(2)}%
                    </div>
                </div>
                <p className="text-sm text-muted-foreground">
                    {symbols.length} aande{symbols.length !== 1 ? 'len' : 'el'} gevolgd
                </p>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {symbols.map((symbol) => {
                        const quote = quotes[symbol];
                        if (!quote) {
                            return (
                                <div key={symbol} className="flex items-center justify-between p-3 border rounded-lg opacity-50">
                                    <span className="font-medium">{symbol}</span>
                                    <span className="text-sm text-muted-foreground">Niet beschikbaar</span>
                                </div>
                            );
                        }

                        const isPositive = quote.change >= 0;
                        const changeColor = isPositive
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400';
                        const changeBg = isPositive
                            ? 'bg-green-50 dark:bg-green-950/30'
                            : 'bg-red-50 dark:bg-red-950/30';

                        return (
                            <div
                                key={symbol}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="font-bold">{quote.symbol}</div>
                                    <div className="text-xs text-muted-foreground">{quote.name}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold">
                                        {quote.currency === 'USD' ? '$' : '€'}{quote.price.toFixed(2)}
                                    </div>
                                    <div className={`text-sm font-medium ${changeColor} ${changeBg} px-2 py-0.5 rounded mt-1 inline-block`}>
                                        {isPositive ? '+' : ''}{quote.change_percent.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {symbols.length === 0 && (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                        Geen aandelen toegevoegd aan portfolio
                    </div>
                )}
            </CardContent>
        </Card>
    );
}