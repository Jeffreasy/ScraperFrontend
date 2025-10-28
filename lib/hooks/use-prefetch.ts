'use client';

import { useQueryClient } from '@tanstack/react-query';
import { advancedApiClient } from '@/lib/api/advanced-client';
import { ArticleFilters } from '@/lib/types/api';
import { STALE_TIMES } from '@/components/providers';

/**
 * Hook voor het prefetchen van de volgende pagina artikelen
 */
export const usePrefetchNextPage = () => {
    const queryClient = useQueryClient();

    const prefetchNextPage = (currentFilters: ArticleFilters, currentPage: number) => {
        const nextFilters = {
            ...currentFilters,
            offset: currentPage * (currentFilters.limit || 50),
        };

        queryClient.prefetchQuery({
            queryKey: ['articles', currentPage + 1, '', nextFilters],
            queryFn: () => advancedApiClient.getArticles(nextFilters),
            staleTime: STALE_TIMES.articles,
        });
    };

    return { prefetchNextPage };
};

/**
 * Hook voor het prefetchen van sources en categories (static data)
 */
export const usePrefetchStaticData = () => {
    const queryClient = useQueryClient();

    const prefetchStatic = () => {
        // Prefetch sources (rarely changes)
        queryClient.prefetchQuery({
            queryKey: ['sources'],
            queryFn: () => advancedApiClient.getSources(),
            staleTime: STALE_TIMES.sources,
        });

        // Prefetch categories
        queryClient.prefetchQuery({
            queryKey: ['categories'],
            queryFn: () => advancedApiClient.getCategories(),
            staleTime: STALE_TIMES.categories,
        });
    };

    return { prefetchStatic };
};

/**
 * Hook voor het prefetchen van trending topics (voor AI page)
 */
export const usePrefetchAIData = () => {
    const queryClient = useQueryClient();

    const prefetchAI = () => {
        // Prefetch trending topics
        queryClient.prefetchQuery({
            queryKey: ['trending', 24, 3],
            queryFn: () => advancedApiClient.getTrendingTopics(24, 3),
            staleTime: STALE_TIMES.trending,
        });

        // Prefetch sentiment stats
        queryClient.prefetchQuery({
            queryKey: ['sentiment-stats', undefined, undefined, undefined],
            queryFn: () => advancedApiClient.getSentimentStats(),
            staleTime: STALE_TIMES.sentiment,
        });
    };

    return { prefetchAI };
};