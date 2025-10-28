'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { StockTicker } from '@/lib/types/api';
import { StockTickerBadge } from './stock-ticker-badge';
import { TrendingUp } from 'lucide-react';

interface ArticleStockTickersProps {
    tickers: StockTicker[];
}

export function ArticleStockTickers({ tickers }: ArticleStockTickersProps) {
    const router = useRouter();

    if (!tickers || tickers.length === 0) {
        return null;
    }

    const handleTickerClick = (symbol: string) => {
        router.push(`/stocks/${symbol}`);
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Aandelen:
            </span>
            {tickers.map((ticker) => (
                <StockTickerBadge
                    key={ticker.symbol}
                    ticker={ticker}
                    onClick={handleTickerClick}
                />
            ))}
        </div>
    );
}