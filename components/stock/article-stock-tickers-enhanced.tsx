'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { StockTicker } from '@/lib/types/api';
import { StockTickerBadge } from './stock-ticker-badge';
import { StockMiniChart, StockSparkline } from './stock-mini-chart';
import { EnhancedStockCard } from './enhanced-stock-card';
import { Button } from '@/components/ui/button';
import { useBatchStockQuotes } from '@/lib/hooks/use-batch-stock-quotes';
import {
    cn,
    flexPatterns,
    transitions,
    bodyText,
    gap,
} from '@/lib/styles/theme';

interface ArticleStockTickersEnhancedProps {
    tickers: StockTicker[];
    showCharts?: boolean;
    showMetrics?: boolean;
    maxVisible?: number;
    variant?: 'default' | 'compact' | 'enhanced';
}

export function ArticleStockTickersEnhanced({
    tickers,
    showCharts = true,
    showMetrics = false,
    maxVisible = 4,
    variant = 'enhanced',
}: ArticleStockTickersEnhancedProps) {
    const router = useRouter();
    const [expanded, setExpanded] = useState(false);

    const tickerSymbols = tickers.map(t => typeof t === 'string' ? t : t.symbol);
    const { data: quotes, isLoading } = useBatchStockQuotes(tickerSymbols);

    if (!tickers || tickers.length === 0) {
        return null;
    }

    const handleTickerClick = (symbol: string) => {
        router.push(`/stocks/${symbol}`);
    };

    const visibleTickers = expanded ? tickers : tickers.slice(0, maxVisible);
    const hasMore = tickers.length > maxVisible;

    if (variant === 'compact') {
        return (
            <div className={cn('flex flex-wrap', gap.xs)}>
                <span className={cn(bodyText.xs, 'text-muted-foreground font-medium')}>
                    📈
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

    if (variant === 'enhanced') {
        return (
            <div className="space-y-3">
                <div className={cn(flexPatterns.between)}>
                    <span className={cn(bodyText.small, 'font-semibold', flexPatterns.start, gap.xs)}>
                        <TrendingUp className="h-4 w-4" />
                        Gerelateerde Aandelen
                    </span>
                    {hasMore && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpanded(!expanded)}
                            className={bodyText.xs}
                        >
                            {expanded ? (
                                <>
                                    <ChevronUp className="h-3 w-3 mr-1" />
                                    Toon minder
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-3 w-3 mr-1" />
                                    Toon alle ({tickers.length})
                                </>
                            )}
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {visibleTickers.map((ticker) => {
                        const symbol = typeof ticker === 'string' ? ticker : ticker.symbol;
                        const quote = quotes?.[symbol];

                        return (
                            <button
                                key={symbol}
                                onClick={() => handleTickerClick(symbol)}
                                className={cn(
                                    'p-3 rounded-lg border text-left',
                                    'hover:bg-accent hover:border-primary/50',
                                    transitions.base,
                                    'focus:outline-none focus:ring-2 focus:ring-ring'
                                )}
                            >
                                <div className={cn(flexPatterns.between, 'mb-2')}>
                                    <div>
                                        <div className="font-bold">{symbol}</div>
                                        {quote && (
                                            <div className={cn(bodyText.xs, 'text-muted-foreground')}>
                                                {quote.name}
                                            </div>
                                        )}
                                    </div>
                                    {showCharts && (
                                        <StockSparkline symbol={symbol} width={60} height={24} />
                                    )}
                                </div>

                                {quote && (
                                    <div className={cn(flexPatterns.between)}>
                                        <div className="text-lg font-bold">
                                            ${quote.price.toFixed(2)}
                                        </div>
                                        <div
                                            className={cn(
                                                bodyText.xs,
                                                'font-semibold',
                                                quote.change >= 0
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-red-600 dark:text-red-400'
                                            )}
                                        >
                                            {quote.change >= 0 ? '+' : ''}
                                            {quote.change_percent.toFixed(2)}%
                                        </div>
                                    </div>
                                )}

                                {!quote && !isLoading && (
                                    <div className={cn(bodyText.xs, 'text-muted-foreground')}>
                                        Loading quote...
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {showMetrics && expanded && (
                    <div className="space-y-3 animate-in slide-in-from-top duration-300">
                        {visibleTickers.map((ticker) => {
                            const symbol = typeof ticker === 'string' ? ticker : ticker.symbol;
                            return (
                                <EnhancedStockCard
                                    key={symbol}
                                    symbol={symbol}
                                    showChart={true}
                                    showMetrics={true}
                                    showPriceTarget={true}
                                    compact={false}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // Default variant with simple badges + optional charts
    return (
        <div className="space-y-2">
            <div className={cn(flexPatterns.start, gap.sm, 'flex-wrap')}>
                <span className={cn(bodyText.small, 'font-medium text-muted-foreground')}>
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                    Aandelen:
                </span>
                {visibleTickers.map((ticker) => (
                    <StockTickerBadge
                        key={ticker.symbol}
                        ticker={ticker}
                        onClick={handleTickerClick}
                    />
                ))}
                {hasMore && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpanded(!expanded)}
                        className={bodyText.xs}
                    >
                        {expanded ? `Minder` : `+${tickers.length - maxVisible} meer`}
                    </Button>
                )}
            </div>

            {showCharts && expanded && (
                <div className={cn('grid grid-cols-2 md:grid-cols-4', gap.sm, 'animate-in fade-in duration-300')}>
                    {visibleTickers.map((ticker) => {
                        const symbol = typeof ticker === 'string' ? ticker : ticker.symbol;
                        return (
                            <div key={symbol} className="text-center">
                                <div className={cn(bodyText.xs, 'font-medium mb-1')}>{symbol}</div>
                                <StockMiniChart symbol={symbol} width={100} height={40} showChange={true} />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}