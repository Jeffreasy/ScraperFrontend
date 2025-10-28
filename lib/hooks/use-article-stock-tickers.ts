import { useMemo } from 'react';
import { Article, StockTicker } from '@/lib/types/api';

interface UseArticleStockTickersResult {
    tickers: StockTicker[];
    symbols: string[];
    hasTickers: boolean;
}

export function useArticleStockTickers(article: Article | null): UseArticleStockTickersResult {
    const tickers = useMemo(() => {
        return article?.ai_enrichment?.entities?.stock_tickers || [];
    }, [article]);

    const symbols = useMemo(() => {
        return tickers.map(t => t.symbol);
    }, [tickers]);

    const hasTickers = useMemo(() => {
        return tickers.length > 0;
    }, [tickers]);

    return { tickers, symbols, hasTickers };
}