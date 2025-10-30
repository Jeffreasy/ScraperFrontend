import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { CacheStats, CacheInvalidateRequest, CacheInvalidateResponse } from '@/lib/types/api';

export function useCacheStats() {
    return useQuery({
        queryKey: ['cache', 'stats'],
        queryFn: async () => {
            return await apiClient.getCacheStats();
        },
        staleTime: 30 * 1000, // 30 seconds
        refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    });
}

export function useInvalidateCache() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request?: CacheInvalidateRequest) => {
            return await apiClient.invalidateCache(request);
        },
        onSuccess: () => {
            // Refresh cache stats after invalidation
            queryClient.invalidateQueries({ queryKey: ['cache', 'stats'] });
        },
    });
}