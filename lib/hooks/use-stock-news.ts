import { useQuery } from '@tanstack/react-query';
import { StockNewsResponse } from '@/lib/types/api';
import { apiClient } from '@/lib/api/client';

interface UseStockNewsOptions {
    enabled?: boolean;
    staleTime?: number;
}

export function useStockNews(
    symbol: string | null,
    limit: number = 10,
    options?: UseStockNewsOptions
) {
    return useQuery({
        queryKey: ['stock', 'news', symbol, limit],
        queryFn: async () => {
            if (!symbol) {
                throw new Error('Symbol is required');
            }
            return await apiClient.getStockNews(symbol, limit);
        },
        enabled: !!symbol && (options?.enabled !== false),
        staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes default
        retry: 2,
    });
}