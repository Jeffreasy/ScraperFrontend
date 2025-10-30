import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { StockQuote } from '@/lib/types/api';

/**
 * Hook voor het efficiënt ophalen van meerdere stock quotes in één API call
 * Dit is veel sneller dan individuele calls per ticker
 */
export function useBatchStockQuotes(symbols: string[]) {
    return useQuery({
        queryKey: ['batch-quotes', symbols.sort().join(',')],
        queryFn: async () => {
            if (symbols.length === 0) return {};

            // Gebruik batch endpoint voor meerdere symbols
            if (symbols.length > 1) {
                return await apiClient.getMultipleQuotes(symbols);
            }

            // Voor single symbol, gebruik gewone quote endpoint
            const quote = await apiClient.getStockQuote(symbols[0]);
            return { [symbols[0]]: quote };
        },
        enabled: symbols.length > 0,
        staleTime: 60 * 1000, // 1 minute - stock data updates frequently
        gcTime: 5 * 60 * 1000, // 5 minutes cache time
    });
}

/**
 * Hook voor het checken of een stock quote beschikbaar is
 */
export function useStockQuoteAvailability(symbol: string) {
    const { data: quotes, isLoading } = useBatchStockQuotes([symbol]);

    return {
        isAvailable: !!quotes?.[symbol],
        quote: quotes?.[symbol],
        isLoading,
    };
}

/**
 * Hook voor het transformeren van batch quotes naar individuele quote lookup
 */
export function useQuoteLookup(symbols: string[]) {
    const { data: quotes, isLoading, error } = useBatchStockQuotes(symbols);

    const getQuote = (symbol: string): StockQuote | undefined => {
        return quotes?.[symbol];
    };

    const hasQuote = (symbol: string): boolean => {
        return !!quotes?.[symbol];
    };

    return {
        quotes: quotes || {},
        getQuote,
        hasQuote,
        isLoading,
        error,
    };
}