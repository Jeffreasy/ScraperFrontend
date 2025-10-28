'use client';

import { useQuery } from '@tanstack/react-query';
import { advancedApiClient } from '@/lib/api/advanced-client';
import { STALE_TIMES } from '@/components/providers';
import { AIEnrichment } from '@/lib/types/api';

export function useArticleAI(articleId: number, enabled: boolean = true) {
    return useQuery({
        queryKey: ['article-ai', articleId],
        queryFn: async () => {
            const response = await advancedApiClient.getArticleEnrichment(articleId);
            if (!response.success) {
                throw new Error(response.error?.message || 'Failed to fetch AI enrichment');
            }
            return response.data as AIEnrichment;
        },
        enabled,
        staleTime: STALE_TIMES.enrichment,
        retry: 1,
    });
}

export function useSentimentStats(source?: string, startDate?: string, endDate?: string) {
    return useQuery({
        queryKey: ['sentiment-stats', source, startDate, endDate],
        queryFn: async () => {
            const response = await advancedApiClient.getSentimentStats(source, startDate, endDate);
            if (!response.success) {
                throw new Error(response.error?.message || 'Failed to fetch sentiment stats');
            }
            return response.data;
        },
        staleTime: STALE_TIMES.sentiment,
    });
}

export function useTrendingTopics(hours: number = 24, minArticles: number = 3) {
    return useQuery({
        queryKey: ['trending', hours, minArticles],
        queryFn: async () => {
            const response = await advancedApiClient.getTrendingTopics(hours, minArticles);
            if (!response.success) {
                throw new Error(response.error?.message || 'Failed to fetch trending topics');
            }
            return response.data;
        },
        staleTime: STALE_TIMES.trending,
        refetchInterval: STALE_TIMES.trending,
    });
}

export function useArticlesByEntity(
    entityName: string,
    entityType: 'persons' | 'organizations' | 'locations' = 'persons',
    limit: number = 50
) {
    return useQuery({
        queryKey: ['articles-by-entity', entityName, entityType, limit],
        queryFn: async () => {
            const response = await advancedApiClient.getArticlesByEntity(entityName, entityType, limit);
            if (!response.success) {
                throw new Error(response.error?.message || 'Failed to fetch articles by entity');
            }
            return response.data;
        },
        enabled: !!entityName,
        staleTime: STALE_TIMES.articles,
    });
}

export function useProcessorStats() {
    return useQuery({
        queryKey: ['processor-stats'],
        queryFn: async () => {
            const response = await advancedApiClient.getProcessorStats();
            if (!response.success) {
                throw new Error(response.error?.message || 'Failed to fetch processor stats');
            }
            return response.data;
        },
        staleTime: STALE_TIMES.processor,
        refetchInterval: STALE_TIMES.processor,
    });
}