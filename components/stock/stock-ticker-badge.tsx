'use client';

import React from 'react';
import { StockTicker } from '@/lib/types/api';

interface StockTickerBadgeProps {
    ticker: StockTicker;
    onClick?: (symbol: string) => void;
}

export function StockTickerBadge({ ticker, onClick }: StockTickerBadgeProps) {
    return (
        <button
            onClick={() => onClick?.(ticker.symbol)}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-950/30 
                 hover:bg-blue-200 dark:hover:bg-blue-900/40 text-blue-800 dark:text-blue-300 
                 rounded-md text-sm font-medium transition-colors border border-blue-200 
                 dark:border-blue-800"
            title={ticker.name || ticker.symbol}
        >
            <span className="font-mono">{ticker.symbol}</span>
            {ticker.exchange && (
                <span className="text-xs text-blue-600 dark:text-blue-400">
                    ({ticker.exchange})
                </span>
            )}
        </button>
    );
}