import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { HistoricalDataResponse } from '@/lib/types/api';

/**
 * Hook voor het ophalen van historische stock data
 */
export function useStockHistorical(
    symbol: string,
    options: {
        from?: string;
        to?: string;
        enabled?: boolean;
    } = {}
) {
    const { from, to, enabled = true } = options;

    return useQuery({
        queryKey: ['stock', 'historical', symbol, from, to],
        queryFn: async () => {
            return await apiClient.getHistoricalData(symbol, from, to);
        },
        enabled: enabled && !!symbol && symbol.length > 0,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes
    });
}

/**
 * Hook voor mini chart data (laatste 7 dagen)
 */
export function useStockMiniChart(symbol: string, enabled: boolean = true) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const from = sevenDaysAgo.toISOString().split('T')[0];
    const to = new Date().toISOString().split('T')[0];

    return useStockHistorical(symbol, { from, to, enabled });
}

/**
 * Hook voor het berekenen van price change percentage
 */
export function useStockPriceChange(symbol: string) {
    const { data, isLoading, error } = useStockMiniChart(symbol);

    if (!data || !data.prices || data.prices.length < 2) {
        return {
            changePercent: 0,
            change: 0,
            isPositive: true,
            isLoading,
            error,
        };
    }

    const firstPrice = data.prices[0].close;
    const lastPrice = data.prices[data.prices.length - 1].close;
    const change = lastPrice - firstPrice;
    const changePercent = (change / firstPrice) * 100;

    return {
        changePercent,
        change,
        isPositive: change >= 0,
        firstPrice,
        lastPrice,
        isLoading,
        error,
        prices: data.prices,
    };
}