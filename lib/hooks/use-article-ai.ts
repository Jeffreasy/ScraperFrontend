'use client';

import { useQuery } from '@tanstack/react-query';
import { advancedApiClient } from '@/lib/api/advanced-client';
import { STALE_TIMES } from '@/components/providers';

export function useArticleAI(articleId: number, enabled: boolean = true) {
    return useQuery({
        queryKey: ['article-ai', articleId],
        queryFn: async () => {
            return await advancedApiClient.getArticleEnrichment(articleId);
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
            return await advancedApiClient.getSentimentStats(source, startDate, endDate);
        },
        staleTime: STALE_TIMES.sentiment,
    });
}

export function useTrendingTopics(hours: number = 24, minArticles: number = 3) {
    return useQuery({
        queryKey: ['trending', hours, minArticles],
        queryFn: async () => {
            return await advancedApiClient.getTrendingTopics(hours, minArticles);
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
            return await advancedApiClient.getArticlesByEntity(entityName, entityType, limit);
        },
        enabled: !!entityName,
        staleTime: STALE_TIMES.articles,
    });
}

export function useProcessorStats() {
    return useQuery({
        queryKey: ['processor-stats'],
        queryFn: async () => {
            return await advancedApiClient.getProcessorStats();
        },
        staleTime: STALE_TIMES.processor,
        refetchInterval: STALE_TIMES.processor,
    });
}