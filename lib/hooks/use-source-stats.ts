import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { ArticleSourceStats } from '@/lib/types/api';

/**
 * Hook voor het ophalen van statistieken van een specifieke bron
 */
export function useSourceStats(source?: string) {
    return useQuery({
        queryKey: ['source-stats', source],
        queryFn: async () => {
            const response = await apiClient.getArticleStatsBySource();
            const sourceData = response.sources.find((s) => s.source === source);
            return sourceData || null;
        },
        enabled: !!source && source.length > 0,
        staleTime: 10 * 60 * 1000, // 10 minutes - source stats don't change frequently
        gcTime: 30 * 60 * 1000, // 30 minutes
    });
}

/**
 * Hook voor het ophalen van alle bron statistieken
 */
export function useAllSourceStats() {
    return useQuery({
        queryKey: ['all-source-stats'],
        queryFn: async () => {
            return await apiClient.getArticleStatsBySource();
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    });
}

/**
 * Hook voor het vergelijken van bronnen
 */
export function useSourceComparison(sources: string[]) {
    const { data: allStats, isLoading } = useAllSourceStats();

    if (!allStats || sources.length === 0) {
        return {
            comparison: [],
            isLoading,
        };
    }

    const comparison = sources
        .map((source) => {
            const stats = allStats.sources.find((s) => s.source === source);
            return stats;
        })
        .filter(Boolean) as ArticleSourceStats[];

    return {
        comparison,
        isLoading,
    };
}

/**
 * Hook voor source reliability score
 * Berekent een score op basis van verschillende metrics
 */
export function useSourceReliability(source?: string) {
    const { data: stats, isLoading } = useSourceStats(source);

    if (!stats) {
        return {
            score: 0,
            rating: 'unknown' as const,
            metrics: null,
            isLoading,
        };
    }

    // Bereken reliability score (0-100)
    let score = 0;

    // Aantal artikelen (max 30 punten)
    const articleScore = Math.min(stats.total_articles / 100, 1) * 30;
    score += articleScore;

    // AI processing percentage (max 25 punten)
    const aiProcessingRate = stats.total_articles > 0
        ? stats.ai_processed_count / stats.total_articles
        : 0;
    score += aiProcessingRate * 25;

    // Content extraction percentage (max 25 punten)
    const contentExtractionRate = stats.total_articles > 0
        ? stats.content_extracted_count / stats.total_articles
        : 0;
    score += contentExtractionRate * 25;

    // Sentiment score (max 20 punten)
    // Positive sentiment gets higher score
    const sentimentScore = stats.avg_sentiment
        ? ((stats.avg_sentiment + 1) / 2) * 20 // Map -1..1 to 0..20
        : 10; // Neutral if no sentiment data
    score += sentimentScore;

    // Recent activity bonus (max 10 punten)
    const daysSinceLastArticle = stats.latest_article_date
        ? Math.floor(
            (Date.now() - new Date(stats.latest_article_date).getTime()) /
            (1000 * 60 * 60 * 24)
        )
        : 999;
    const activityBonus = Math.max(0, 10 - daysSinceLastArticle);
    score += activityBonus;

    // Determine rating
    let rating: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
    if (score >= 80) rating = 'excellent';
    else if (score >= 60) rating = 'good';
    else if (score >= 40) rating = 'fair';
    else if (score >= 20) rating = 'poor';
    else rating = 'unknown';

    return {
        score: Math.round(score),
        rating,
        metrics: {
            totalArticles: stats.total_articles,
            aiProcessingRate: Math.round(aiProcessingRate * 100),
            contentExtractionRate: Math.round(contentExtractionRate * 100),
            avgSentiment: stats.avg_sentiment || 0,
            daysSinceLastArticle,
            articlesToday: stats.articles_today,
            articlesThisWeek: stats.articles_week,
        },
        isLoading,
    };
}

/**
 * Hook voor het checken of een bron actief is
 */
export function useIsSourceActive(source?: string) {
    const { data: stats, isLoading } = useSourceStats(source);

    if (!stats) {
        return {
            isActive: false,
            lastSeen: null,
            isLoading,
        };
    }

    // Bron is actief als er in de laatste 7 dagen artikelen zijn
    const daysSinceLastArticle = Math.floor(
        (Date.now() - new Date(stats.latest_article_date).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    return {
        isActive: daysSinceLastArticle <= 7,
        lastSeen: stats.latest_article_date,
        daysSinceLastArticle,
        articlesToday: stats.articles_today,
        isLoading,
    };
}