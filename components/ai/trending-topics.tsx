'use client';

import Link from 'next/link';
import { TrendingUp, Clock, Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTrendingTopics } from '@/lib/hooks/use-article-ai';
import { Skeleton } from '@/components/ui/skeleton';
import { LightweightErrorBoundary } from '@/components/error-boundary';

interface TrendingTopicsProps {
    hours?: number;
    minArticles?: number;
    maxTopics?: number;
}

export function TrendingTopics({
    hours = 24,
    minArticles = 3,
    maxTopics = 10
}: TrendingTopicsProps) {
    const { data, isLoading, error } = useTrendingTopics(hours, minArticles);

    if (error) {
        return (
            <Card className="border-red-200 bg-red-50/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="h-4 w-4" />
                        Trending Now
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-red-800">
                        Kan trending topics niet laden
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                        Probeer de pagina te verversen
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="h-4 w-4" />
                        Trending Now
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (!data || data.topics.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="h-4 w-4" />
                        Trending Now
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                        <p className="text-sm text-muted-foreground">
                            Geen trending topics op dit moment
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Check later voor nieuwe trends
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const totalArticles = data.topics.reduce((sum, t) => sum + t.article_count, 0);
    const topicsToShow = data.topics.slice(0, maxTopics);

    return (
        <LightweightErrorBoundary componentName="Trending Topics">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                        <span className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Trending Now
                        </span>
                        <span className="text-xs font-normal text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {hours}u
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {topicsToShow.map((topic, index) => {
                        const sentimentColor =
                            topic.average_sentiment > 0.2
                                ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                                : topic.average_sentiment < -0.2
                                    ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                                    : 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30';

                        const isTop3 = index < 3;
                        const articlePercentage = ((topic.article_count / totalArticles) * 100).toFixed(1);

                        return (
                            <Link
                                key={topic.keyword}
                                href={`/?search=${encodeURIComponent(topic.keyword)}`}
                                className="block group"
                            >
                                <div className={`flex items-start gap-3 p-3 rounded-lg transition-all hover:bg-accent hover:shadow-md ${isTop3 ? 'bg-primary/5 border border-primary/20' : ''
                                    }`}>
                                    <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isTop3
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-primary/10 text-primary'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className="font-semibold text-sm group-hover:text-primary transition-colors truncate flex-1">
                                                {topic.keyword}
                                                {isTop3 && (
                                                    <span className="ml-2 text-[10px] font-bold text-primary">🔥</span>
                                                )}
                                            </h4>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sentimentColor}`}>
                                                {topic.average_sentiment > 0 ? '↑' : topic.average_sentiment < 0 ? '↓' : '→'}
                                                {Math.abs(topic.average_sentiment).toFixed(2)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Hash className="h-3 w-3" />
                                                {topic.article_count} artikelen ({articlePercentage}%)
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {topic.sources.slice(0, 3).map((source) => (
                                                <span
                                                    key={source}
                                                    className="inline-flex items-center rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground"
                                                >
                                                    {source}
                                                </span>
                                            ))}
                                            {topic.sources.length > 3 && (
                                                <span className="text-[10px] text-muted-foreground self-center">
                                                    +{topic.sources.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}

                    {data.topics.length > maxTopics && (
                        <p className="text-xs text-muted-foreground text-center pt-2">
                            {data.topics.length - maxTopics} meer trending topics beschikbaar
                        </p>
                    )}

                    <div className="pt-3 border-t space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Gebaseerd op {totalArticles} artikelen in de laatste {data.hours_back} uur
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Minimaal {data.min_articles} artikelen per topic
                        </p>
                    </div>
                </CardContent>
            </Card>
        </LightweightErrorBoundary>
    );
}