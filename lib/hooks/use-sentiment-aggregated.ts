'use client';

import { useQuery } from '@tanstack/react-query';
import { useSentimentTrends } from '@/lib/hooks/use-analytics';

/**
 * Hook die sentiment trends aggregeert naar een compatibele structuur
 * voor de SentimentDashboard component
 */
export function useSentimentAggregated(source?: string) {
    const { data: trendsData, isLoading, error } = useSentimentTrends(source);

    return useQuery({
        queryKey: ['sentiment-aggregated', source, trendsData],
        queryFn: () => {
            if (!trendsData || !trendsData.trends || trendsData.trends.length === 0) {
                return null;
            }

            // Aggregeer alle trends
            let totalArticles = 0;
            let positiveCount = 0;
            let neutralCount = 0;
            let negativeCount = 0;
            let totalSentimentSum = 0;

            trendsData.trends.forEach(trend => {
                totalArticles += trend.total_articles;
                positiveCount += trend.positive_count;
                neutralCount += trend.neutral_count;
                negativeCount += trend.negative_count;
                // Weeg avg_sentiment met aantal artikelen voor accurate gemiddelde
                totalSentimentSum += trend.avg_sentiment * trend.total_articles;
            });

            // Bereken gewogen gemiddelde sentiment
            const avgSentiment = totalArticles > 0 ? totalSentimentSum / totalArticles : 0;

            return {
                total_processed: totalArticles,
                by_sentiment: {
                    positive: positiveCount,
                    neutral: neutralCount,
                    negative: negativeCount,
                },
                avg_sentiment_score: avgSentiment,
            };
        },
        enabled: !isLoading && !error && !!trendsData,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}