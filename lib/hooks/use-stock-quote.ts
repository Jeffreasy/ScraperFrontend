import { useQuery } from '@tanstack/react-query';
import { StockQuote } from '@/lib/types/api';
import { advancedApiClient } from '@/lib/api/advanced-client';

interface UseStockQuoteOptions {
    enabled?: boolean;
    staleTime?: number;
    refetchInterval?: number;
}

export function useStockQuote(
    symbol: string | null,
    options?: UseStockQuoteOptions
) {
    return useQuery({
        queryKey: ['stock', 'quote', symbol],
        queryFn: async () => {
            if (!symbol) {
                throw new Error('Symbol is required');
            }
            return await advancedApiClient.getStockQuote(symbol);
        },
        enabled: !!symbol && (options?.enabled !== false),
        staleTime: options?.staleTime ?? 60 * 1000, // 1 minute default
        refetchInterval: options?.refetchInterval,
        retry: 2,
    });
}

export function useMultipleStockQuotes(
    symbols: string[],
    options?: UseStockQuoteOptions
) {
    return useQuery({
        queryKey: ['stock', 'quotes', symbols],
        queryFn: async () => {
            if (!symbols || symbols.length === 0) {
                throw new Error('Symbols are required');
            }
            return await advancedApiClient.getMultipleQuotes(symbols);
        },
        enabled: symbols.length > 0 && (options?.enabled !== false),
        staleTime: options?.staleTime ?? 60 * 1000,
        refetchInterval: options?.refetchInterval,
        retry: 2,
    });
}