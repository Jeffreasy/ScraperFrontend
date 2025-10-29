'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { cva, type VariantProps } from 'class-variance-authority';
import { StockTicker } from '@/lib/types/api';
import { StockTickerBadge } from './stock-ticker-badge';
import { TrendingUp } from 'lucide-react';
import {
    cn,
    flexPatterns,
    transitions,
    bodyText,
    gap,
} from '@/lib/styles/theme';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ArticleStockTickersProps {
    tickers: StockTicker[];
    variant?: 'default' | 'compact';
}

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const tickersContainerVariants = cva(
    ['flex flex-wrap items-center', transitions.colors],
    {
        variants: {
            variant: {
                default: gap.sm,
                compact: gap.xs,
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const labelVariants = cva(
    ['inline-flex items-center gap-1 font-medium text-muted-foreground'],
    {
        variants: {
            size: {
                sm: bodyText.xs,
                default: bodyText.small,
                lg: bodyText.base,
            },
        },
        defaultVariants: {
            size: 'default',
        },
    }
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ArticleStockTickers({ tickers, variant = 'default' }: ArticleStockTickersProps) {
    const router = useRouter();

    if (!tickers || tickers.length === 0) {
        return null;
    }

    const handleTickerClick = (symbol: string) => {
        router.push(`/stocks/${symbol}`);
    };

    return (
        <div className={tickersContainerVariants({ variant })}>
            <span className={labelVariants()}>
                <TrendingUp className="h-4 w-4" />
                Aandelen:
            </span>
            {tickers.map((ticker) => (
                <StockTickerBadge key={ticker.symbol} ticker={ticker} onClick={handleTickerClick} />
            ))}
        </div>
    );
}

// ============================================================================
// COMPACT VARIANT
// ============================================================================

/**
 * Compact variant zonder label
 */
export function ArticleStockTickersCompact({ tickers }: { tickers: StockTicker[] }) {
    const router = useRouter();

    if (!tickers || tickers.length === 0) {
        return null;
    }

    const handleTickerClick = (symbol: string) => {
        router.push(`/stocks/${symbol}`);
    };

    return (
        <div className={cn('flex flex-wrap', gap.xs)}>
            {tickers.map((ticker) => (
                <StockTickerBadge key={ticker.symbol} ticker={ticker} onClick={handleTickerClick} />
            ))}
        </div>
    );
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
    tickersContainerVariants,
    labelVariants,
};
export type { ArticleStockTickersProps };