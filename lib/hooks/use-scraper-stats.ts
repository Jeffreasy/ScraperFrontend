'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { advancedApiClient } from '@/lib/api/advanced-client';
import type { ScraperStats } from '@/lib/types/api';

/**
 * Hook for fetching scraper statistics including:
 * - Articles by source
 * - Circuit breaker states
 * - Content extraction progress
 * - Browser pool status (if enabled)
 */
export const useScraperStats = (
    options?: Omit<UseQueryOptions<ScraperStats>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: ['scraper', 'stats'],
        queryFn: () => advancedApiClient.getScraperStats(),
        staleTime: 5 * 1000, // 5 seconds - real-time stats
        refetchInterval: 5 * 1000, // Auto-refresh every 5 seconds
        retry: 1,
        ...options,
    });
};