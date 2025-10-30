'use client';

import React, { useEffect, useState } from 'react';
import { StockQuote } from '@/lib/types/api';
import { advancedApiClient } from '@/lib/api/advanced-client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StockQuoteCardProps {
    symbol: string;
}

export function StockQuoteCard({ symbol }: StockQuoteCardProps) {
    const [quote, setQuote] = useState<StockQuote | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadQuote = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await advancedApiClient.getStockQuote(symbol);
                // Direct response now, no wrapper
                setQuote(response);
            } catch (err) {
                console.error('Failed to load quote:', err);
                setError('Fout bij ophalen koers');
            } finally {
                setLoading(false);
            }
        };
        loadQuote();
    }, [symbol]);

    if (loading) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-32 mt-1" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-32 mb-2" />
                    <Skeleton className="h-6 w-24" />
                </CardContent>
            </Card>
        );
    }

    if (error || !quote) {
        return (
            <Card className="border-destructive/50">
                <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">
                        {error || 'Koers niet beschikbaar'}
                    </p>
                </CardContent>
            </Card>
        );
    }

    const isPositive = quote.change >= 0;
    const changeColor = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    const changeBg = isPositive ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30';

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-baseline justify-between">
                    <div>
                        <h3 className="text-lg font-bold">{quote.symbol}</h3>
                        <p className="text-sm text-muted-foreground">{quote.name || quote.symbol}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold">
                            {quote.currency === 'USD' ? '$' : '€'}{quote.price.toFixed(2)}
                        </div>
                        <div className={`text-sm font-medium ${changeColor} ${changeBg} px-2 py-1 rounded mt-1`}>
                            {isPositive ? '+' : ''}{quote.change.toFixed(2)}
                            ({isPositive ? '+' : ''}{quote.change_percent.toFixed(2)}%)
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground pt-2 border-t">
                    <div>
                        <span className="font-medium">Volume:</span>{' '}
                        {quote.volume.toLocaleString('nl-NL')}
                    </div>
                    <div>
                        <span className="font-medium">Beurs:</span> {quote.exchange}
                    </div>
                    {quote.day_high && (
                        <div>
                            <span className="font-medium">Dag Hoog:</span>{' '}
                            {quote.currency === 'USD' ? '$' : '€'}{quote.day_high.toFixed(2)}
                        </div>
                    )}
                    {quote.day_low && (
                        <div>
                            <span className="font-medium">Dag Laag:</span>{' '}
                            {quote.currency === 'USD' ? '$' : '€'}{quote.day_low.toFixed(2)}
                        </div>
                    )}
                    {quote.market_cap && (
                        <div className="col-span-2">
                            <span className="font-medium">Marktkapitalisatie:</span>{' '}
                            {quote.currency === 'USD' ? '$' : '€'}{(quote.market_cap / 1e9).toFixed(2)}B
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}