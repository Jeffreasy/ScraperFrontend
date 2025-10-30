import { useQuery } from '@tanstack/react-query';
import { FinancialMetrics, PriceTarget } from '@/lib/types/api';
import { apiClient } from '@/lib/api/client';

interface UseStockMetricsOptions {
    enabled?: boolean;
    staleTime?: number;
}

export function useStockMetrics(
    symbol: string | null,
    options?: UseStockMetricsOptions
) {
    return useQuery({
        queryKey: ['stock', 'metrics', symbol],
        queryFn: async () => {
            if (!symbol) {
                throw new Error('Symbol is required');
            }
            return await apiClient.getFinancialMetrics(symbol);
        },
        enabled: !!symbol && (options?.enabled !== false),
        staleTime: options?.staleTime ?? 10 * 60 * 1000, // 10 minutes default
        retry: 2,
    });
}

/**
 * Hook voor het ophalen van price target data
 */
export function usePriceTarget(
    symbol: string,
    options?: UseStockMetricsOptions
) {
    return useQuery({
        queryKey: ['stock', 'price-target', symbol],
        queryFn: async () => {
            return await apiClient.getPriceTarget(symbol);
        },
        enabled: !!symbol && (options?.enabled !== false),
        staleTime: options?.staleTime ?? 30 * 60 * 1000, // 30 minutes default - analyst targets don't change often
        retry: 2,
    });
}