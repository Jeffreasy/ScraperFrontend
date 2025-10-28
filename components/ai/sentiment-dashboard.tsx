'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSentimentStats } from '@/lib/hooks/use-article-ai';
import { Skeleton } from '@/components/ui/skeleton';
import { Smile, Meh, Frown, TrendingUp, BarChart3, Award } from 'lucide-react';
import { LightweightErrorBoundary } from '@/components/error-boundary';

interface SentimentDashboardProps {
    source?: string;
    startDate?: string;
    endDate?: string;
}

export function SentimentDashboard({ source, startDate, endDate }: SentimentDashboardProps) {
    const { data: stats, isLoading, error } = useSentimentStats(source, startDate, endDate);

    const percentages = useMemo(() => {
        if (!stats) return null;
        const total = stats.total_articles;
        if (total === 0) return null;

        return {
            positive: ((stats.positive_count / total) * 100).toFixed(1),
            neutral: ((stats.neutral_count / total) * 100).toFixed(1),
            negative: ((stats.negative_count / total) * 100).toFixed(1),
        };
    }, [stats]);

    const activeSentiments = useMemo(() => {
        if (!stats) return [];
        return [
            { type: 'positive', count: stats.positive_count, label: 'Positief', icon: Smile, color: 'green' },
            { type: 'neutral', count: stats.neutral_count, label: 'Neutraal', icon: Meh, color: 'gray' },
            { type: 'negative', count: stats.negative_count, label: 'Negatief', icon: Frown, color: 'red' },
        ].filter(s => s.count > 0);
    }, [stats]);

    const dominantSentiment = useMemo(() => {
        if (!stats) return null;
        const max = Math.max(stats.positive_count, stats.neutral_count, stats.negative_count);
        if (stats.positive_count === max) return 'positive';
        if (stats.negative_count === max) return 'negative';
        return 'neutral';
    }, [stats]);

    const hasLimitedData = stats && stats.total_articles < 10;

    if (error) {
        return (
            <Card className="border-red-200 bg-red-50/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Sentiment Analyse
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-red-800">
                        Kan sentiment statistieken niet laden
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Sentiment Analyse
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-20 w-full rounded-lg" />
                                <Skeleton className="h-4 w-3/4 mx-auto" />
                            </div>
                        ))}
                    </div>
                    <Skeleton className="h-24 w-full rounded-lg" />
                </CardContent>
            </Card>
        );
    }

    if (!stats || stats.total_articles === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Sentiment Analyse
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                        <p className="text-sm text-muted-foreground">
                            Geen sentiment data beschikbaar
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <LightweightErrorBoundary componentName="Sentiment Dashboard">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Sentiment Analyse
                        </span>
                        {source && (
                            <span className="text-xs font-normal text-muted-foreground">
                                Bron: {source}
                            </span>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Limited Data Warning */}
                    {hasLimitedData && (
                        <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                            <p className="text-sm text-yellow-800">
                                ⚠️ Beperkte data ({stats.total_articles} {stats.total_articles === 1 ? 'artikel' : 'artikelen'}). Resultaten zijn mogelijk niet representatief.
                            </p>
                        </div>
                    )}

                    {/* Distribution Cards - Only show sentiments with data */}
                    <div className={`grid gap-4 ${activeSentiments.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' :
                        activeSentiments.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                            'grid-cols-1 md:grid-cols-3'
                        }`}>
                        {activeSentiments.map((sentiment) => {
                            const Icon = sentiment.icon;
                            const isDominant = dominantSentiment === sentiment.type;
                            const percentage = percentages ? percentages[sentiment.type as keyof typeof percentages] : '0.0';

                            const colorClasses = {
                                green: {
                                    bg: isDominant ? 'bg-green-50 dark:bg-green-900/10 border-green-300 dark:border-green-900/50 shadow-lg scale-105' : 'bg-green-50/50 dark:bg-green-900/5 border-green-200 dark:border-green-900/30',
                                    icon: isDominant ? 'text-green-600 dark:text-green-400' : 'text-green-600/70 dark:text-green-400/70',
                                    text: 'text-green-700 dark:text-green-300',
                                },
                                gray: {
                                    bg: isDominant ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 shadow-lg scale-105' : 'bg-gray-50/50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700',
                                    icon: isDominant ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600/70 dark:text-gray-400/70',
                                    text: 'text-gray-700 dark:text-gray-300',
                                },
                                red: {
                                    bg: isDominant ? 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-900/50 shadow-lg scale-105' : 'bg-red-50/50 dark:bg-red-900/5 border-red-200 dark:border-red-900/30',
                                    icon: isDominant ? 'text-red-600 dark:text-red-400' : 'text-red-600/70 dark:text-red-400/70',
                                    text: 'text-red-700 dark:text-red-300',
                                },
                            }[sentiment.color as 'green' | 'gray' | 'red'];

                            return (
                                <div key={sentiment.type} className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${colorClasses.bg}`}>
                                    <Icon className={`h-10 w-10 mb-2 ${colorClasses.icon}`} />
                                    <div className={`text-3xl font-bold mb-1 ${colorClasses.icon}`}>
                                        {sentiment.count.toLocaleString('nl-NL')}
                                    </div>
                                    <div className={`text-sm font-medium mb-1 ${colorClasses.text}`}>
                                        {sentiment.label}
                                    </div>
                                    <div className={`text-xs font-semibold ${colorClasses.icon}`}>
                                        {percentage}%
                                    </div>
                                    {isDominant && activeSentiments.length > 1 && (
                                        <Award className={`h-4 w-4 mt-2 ${colorClasses.icon}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Average Sentiment Meter */}
                    <div className="p-4 rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold">Gemiddeld Sentiment</span>
                            <span className={`text-lg font-bold px-3 py-1 rounded-full ${stats.average_sentiment > 0.2
                                ? 'bg-green-100 text-green-700'
                                : stats.average_sentiment < -0.2
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                {stats.average_sentiment > 0 ? '+' : ''}{stats.average_sentiment.toFixed(3)}
                            </span>
                        </div>
                        <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                            <div
                                className="absolute h-full bg-gradient-to-r from-red-500 via-gray-400 to-green-500"
                                style={{ width: '100%' }}
                            />
                            <div
                                className="absolute h-full w-1.5 bg-white border-2 border-gray-900 dark:border-white rounded-full shadow-lg"
                                style={{
                                    left: `${((stats.average_sentiment + 1) / 2) * 100}%`,
                                    transform: 'translateX(-50%)',
                                }}
                            />
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground font-medium">
                            <span className="flex items-center gap-1">
                                <Frown className="h-3 w-3" />
                                -1.0
                            </span>
                            <span className="flex items-center gap-1">
                                <Meh className="h-3 w-3" />
                                0.0
                            </span>
                            <span className="flex items-center gap-1">
                                <Smile className="h-3 w-3" />
                                +1.0
                            </span>
                        </div>
                    </div>

                    {/* Extremes */}
                    {(stats.most_positive_title || stats.most_negative_title) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                            {stats.most_positive_title && (
                                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Smile className="h-4 w-4 text-green-600" />
                                        <h4 className="text-sm font-semibold text-green-700 dark:text-green-400">
                                            Meest Positief
                                        </h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                        &ldquo;{stats.most_positive_title}&rdquo;
                                    </p>
                                </div>
                            )}
                            {stats.most_negative_title && (
                                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Frown className="h-4 w-4 text-red-600" />
                                        <h4 className="text-sm font-semibold text-red-700 dark:text-red-400">
                                            Meest Negatief
                                        </h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                        &ldquo;{stats.most_negative_title}&rdquo;
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Summary Stats - Only show if we have multiple sentiments */}
                    {activeSentiments.length > 1 && (
                        <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                            <div className="text-center p-2 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground mb-1">Totaal Artikelen</p>
                                <p className="text-lg font-bold">{stats.total_articles.toLocaleString('nl-NL')}</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-primary/10">
                                <p className="text-xs text-primary mb-1">Gemiddeld Sentiment</p>
                                <p className="text-lg font-bold text-primary">
                                    {stats.average_sentiment > 0 ? '+' : ''}{stats.average_sentiment.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Footer Info */}
                    <p className="text-xs text-muted-foreground text-center pt-4 border-t">
                        Analyse van {stats.total_articles.toLocaleString('nl-NL')} artikelen
                        {source && ` van ${source}`}
                        {(startDate || endDate) && ' in geselecteerde periode'}
                    </p>
                </CardContent>
            </Card>
        </LightweightErrorBoundary>
    );
}