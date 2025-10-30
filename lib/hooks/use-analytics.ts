import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type {
    TrendingResponse,
    SentimentTrendsResponse,
    HotEntitiesResponse,
    EntitySentimentResponse,
    AnalyticsOverview,
    ArticleStatsResponse,
} from '@/lib/types/api';

export function useTrendingKeywords(hours = 24, minArticles = 3, limit = 20) {
    return useQuery({
        queryKey: ['analytics', 'trending', hours, minArticles, limit],
        queryFn: async () => {
            return await apiClient.getTrendingKeywords(hours, minArticles, limit);
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useSentimentTrends(source?: string) {
    return useQuery({
        queryKey: ['analytics', 'sentiment-trends', source],
        queryFn: async () => {
            return await apiClient.getSentimentTrends(source);
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useHotEntities(entityType?: string, limit = 50) {
    return useQuery({
        queryKey: ['analytics', 'hot-entities', entityType, limit],
        queryFn: async () => {
            return await apiClient.getHotEntities(entityType, limit);
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useEntitySentiment(entity: string, days = 30) {
    return useQuery({
        queryKey: ['analytics', 'entity-sentiment', entity, days],
        queryFn: async () => {
            return await apiClient.getEntitySentiment(entity, days);
        },
        enabled: entity.length > 0,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

export function useAnalyticsOverview() {
    return useQuery({
        queryKey: ['analytics', 'overview'],
        queryFn: async () => {
            return await apiClient.getAnalyticsOverview();
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useArticleStatsBySource() {
    return useQuery({
        queryKey: ['analytics', 'article-stats'],
        queryFn: async () => {
            return await apiClient.getArticleStatsBySource();
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useRefreshAnalytics() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            return await apiClient.refreshAnalytics();
        },
        onSuccess: () => {
            // Invalidate all analytics queries
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
        },
    });
}