import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { ArticleListResponse } from '@/lib/types/api';

/**
 * Hook voor het ophalen van gerelateerde artikelen op basis van een entity
 */
export function useRelatedArticlesByEntity(
    entityName: string,
    options: {
        enabled?: boolean;
        limit?: number;
    } = {}
) {
    const { enabled = true, limit = 10 } = options;

    return useQuery({
        queryKey: ['related-articles', 'entity', entityName, limit],
        queryFn: async () => {
            return await apiClient.getArticlesByEntity(entityName);
        },
        enabled: enabled && !!entityName && entityName.length > 0,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}

/**
 * Hook voor het ophalen van gerelateerde artikelen op basis van een ticker symbol
 */
export function useRelatedArticlesByTicker(
    symbol: string,
    options: {
        enabled?: boolean;
        limit?: number;
    } = {}
) {
    const { enabled = true, limit = 10 } = options;

    return useQuery({
        queryKey: ['related-articles', 'ticker', symbol, limit],
        queryFn: async () => {
            return await apiClient.getArticlesByTicker(symbol, limit);
        },
        enabled: enabled && !!symbol && symbol.length > 0,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}

/**
 * Hook voor het verkrijgen van alleen het aantal gerelateerde artikelen
 * Lichtgewicht versie voor snelle counts
 */
export function useRelatedArticlesCount(
    entityName?: string,
    entityType: 'entity' | 'ticker' = 'entity'
) {
    const enabled = !!entityName && entityName.length > 0;

    const entityQuery = useRelatedArticlesByEntity(entityName || '', {
        enabled: enabled && entityType === 'entity',
        limit: 1, // We need only count, so limit to 1
    });

    const tickerQuery = useRelatedArticlesByTicker(entityName || '', {
        enabled: enabled && entityType === 'ticker',
        limit: 1,
    });

    const query = entityType === 'entity' ? entityQuery : tickerQuery;

    return {
        count: query.data?.pagination?.total || 0,
        isLoading: query.isLoading,
        error: query.error,
    };
}

/**
 * Hook voor het checken of er gerelateerde artikelen zijn
 */
export function useHasRelatedArticles(
    entityName?: string,
    entityType: 'entity' | 'ticker' = 'entity'
) {
    const { count, isLoading } = useRelatedArticlesCount(entityName, entityType);

    return {
        hasRelated: count > 0,
        count,
        isLoading,
    };
}