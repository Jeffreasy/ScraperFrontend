import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { TrendingKeyword } from '@/lib/types/api';

/**
 * Hook voor het ophalen van trending keywords
 * NOTE: Dit is een wrapper voor backwards compatibility
 * De primaire hook zit in use-analytics.ts
 */
export function useTrendingKeywords(
    hours: number = 24,
    minArticles: number = 3,
    limit: number = 50
) {
    return useQuery({
        queryKey: ['analytics', 'trending', hours, minArticles, limit],
        queryFn: async () => {
            console.log('[useTrendingKeywords] Fetching with params:', { hours, minArticles, limit });
            const result = await apiClient.getTrendingKeywords(hours, minArticles, limit);
            console.log('[useTrendingKeywords] Result:', result);
            return result;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes
        refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
        retry: 2,
    });
}

/**
 * Hook voor het checken of een artikel trending keywords bevat
 */
export function useTrendingCheck(keywords?: string[]) {
    const { data: trending, isLoading } = useTrendingKeywords(24, 3, 100);

    if (!keywords || keywords.length === 0 || !trending) {
        return {
            isTrending: false,
            trendingKeywords: [],
            trendingScore: 0,
            isLoading,
        };
    }

    // Maak set van trending keywords (lowercase voor case-insensitive matching)
    const trendingSet = new Set(
        trending.trending.map((t) => t.keyword.toLowerCase())
    );

    // Check welke article keywords trending zijn
    const matchingTrending = keywords.filter((kw) =>
        trendingSet.has(kw.toLowerCase())
    );

    // Bereken trending score (gemiddelde trending_score van matched keywords)
    const trendingScores = matchingTrending
        .map((kw) => {
            const trend = trending.trending.find(
                (t) => t.keyword.toLowerCase() === kw.toLowerCase()
            );
            return trend?.trending_score || 0;
        })
        .filter((score) => score > 0);

    const avgTrendingScore =
        trendingScores.length > 0
            ? trendingScores.reduce((a, b) => a + b, 0) / trendingScores.length
            : 0;

    return {
        isTrending: matchingTrending.length > 0,
        trendingKeywords: matchingTrending,
        trendingScore: avgTrendingScore,
        matchedTrends: matchingTrending.map((kw) =>
            trending.trending.find(
                (t) => t.keyword.toLowerCase() === kw.toLowerCase()
            )
        ).filter(Boolean) as TrendingKeyword[],
        isLoading,
    };
}

/**
 * Hook voor het checken of specifieke entity trending is
 */
export function useEntityTrendingCheck(entityName?: string) {
    const { data: trending, isLoading } = useTrendingKeywords(24, 3, 100);

    if (!entityName || !trending) {
        return {
            isTrending: false,
            trendingData: null,
            isLoading,
        };
    }

    const trendingData = trending.trending.find(
        (t) => t.keyword.toLowerCase() === entityName.toLowerCase()
    );

    return {
        isTrending: !!trendingData,
        trendingData,
        isLoading,
    };
}

/**
 * Hook voor het verkrijgen van trending rank
 * Geeft terug hoe hoog in de trending lijst een keyword staat
 */
export function useTrendingRank(keyword?: string) {
    const { data: trending, isLoading } = useTrendingKeywords(24, 3, 100);

    if (!keyword || !trending) {
        return {
            rank: null,
            totalTrending: 0,
            isLoading,
        };
    }

    const rank = trending.trending.findIndex(
        (t) => t.keyword.toLowerCase() === keyword.toLowerCase()
    );

    return {
        rank: rank >= 0 ? rank + 1 : null, // Convert to 1-based index
        totalTrending: trending.trending.length,
        isTopTrending: rank >= 0 && rank < 10, // Top 10
        isLoading,
    };
}