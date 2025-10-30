import { useQuery } from '@tanstack/react-query';
import { SymbolSearchResponse } from '@/lib/types/api';
import { apiClient } from '@/lib/api/client';

interface UseSymbolSearchOptions {
    enabled?: boolean;
    minQueryLength?: number;
}

export function useSymbolSearch(
    query: string,
    options?: UseSymbolSearchOptions
) {
    const minLength = options?.minQueryLength ?? 2;

    return useQuery({
        queryKey: ['symbol', 'search', query],
        queryFn: async () => {
            if (!query || query.length < minLength) {
                return { query, total: 0, results: [] };
            }
            return await apiClient.searchSymbols(query);
        },
        enabled: query.length >= minLength && (options?.enabled !== false),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
    });
}