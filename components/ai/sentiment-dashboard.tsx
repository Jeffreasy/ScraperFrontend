'use client';

import { useMemo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSentimentStats } from '@/lib/hooks/use-article-ai';
import { Smile, Meh, Frown, TrendingUp, BarChart3, Award, AlertCircle } from 'lucide-react';
import { LightweightErrorBoundary } from '@/components/error-boundary';
import {
    cn,
    flexPatterns,
    spacing,
    transitions,
    bodyText,
    gap,
    getSentimentColor,
} from '@/lib/styles/theme';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface SentimentDashboardProps {
    source?: string;
    startDate?: string;
    endDate?: string;
}

type SentimentType = 'positive' | 'neutral' | 'negative';

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const sentimentCardVariants = cva(
    ['flex flex-col items-center p-4 rounded-lg border-2', transitions.base],
    {
        variants: {
            type: {
                positive: 'bg-green-50/50 dark:bg-green-900/5 border-green-200 dark:border-green-900/30',
                neutral: 'bg-gray-50/50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700',
                negative: 'bg-red-50/50 dark:bg-red-900/5 border-red-200 dark:border-red-900/30',
            },
            dominant: {
                true: 'shadow-lg scale-105',
                false: '',
            },
        },
        defaultVariants: {
            dominant: false,
        },
    }
);

const extremeArticleVariants = cva(
    ['p-3 rounded-lg border', transitions.colors],
    {
        variants: {
            type: {
                positive: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30',
                negative: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30',
            },
        },
    }
);

// ============================================================================
// CONFIGURATION
// ============================================================================

const sentimentConfig = {
    positive: { icon: Smile, label: 'Positief', color: 'green' },
    neutral: { icon: Meh, label: 'Neutraal', color: 'gray' },
    negative: { icon: Frown, label: 'Negatief', color: 'red' },
} as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SentimentDashboard({ source, startDate, endDate }: SentimentDashboardProps = {}) {
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
            { type: 'positive' as const, count: stats.positive_count },
            { type: 'neutral' as const, count: stats.neutral_count },
            { type: 'negative' as const, count: stats.negative_count },
        ].filter((s) => s.count > 0);
    }, [stats]);

    const dominantSentiment = useMemo(() => {
        if (!stats) return null;
        const max = Math.max(stats.positive_count, stats.neutral_count, stats.negative_count);
        if (stats.positive_count === max) return 'positive';
        if (stats.negative_count === max) return 'negative';
        return 'neutral';
    }, [stats]);

    const hasLimitedData = stats && stats.total_articles < 10;

    if (error) return <ErrorState />;
    if (isLoading) return <LoadingState />;
    if (!stats || stats.total_articles === 0) return <EmptyState />;

    return (
        <LightweightErrorBoundary componentName="Sentiment Dashboard">
            <Card>
                <CardHeader>
                    <CardTitle className={flexPatterns.between}>
                        <span className={cn(flexPatterns.start, gap.sm)}>
                            <TrendingUp className="h-5 w-5" />
                            Sentiment Analyse
                        </span>
                        {source && (
                            <span className={cn(bodyText.xs, 'font-normal text-muted-foreground')}>
                                Bron: {source}
                            </span>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className={spacing.lg}>
                    {/* Limited Data Warning */}
                    {hasLimitedData && <LimitedDataWarning count={stats.total_articles} />}

                    {/* Distribution Cards */}
                    <SentimentDistribution
                        activeSentiments={activeSentiments}
                        percentages={percentages}
                        dominantSentiment={dominantSentiment}
                    />

                    {/* Average Sentiment Meter */}
                    <AverageSentimentMeter averageSentiment={stats.average_sentiment} />

                    {/* Extreme Articles */}
                    {(stats.most_positive_title || stats.most_negative_title) && (
                        <ExtremeArticles
                            mostPositive={stats.most_positive_title}
                            mostNegative={stats.most_negative_title}
                        />
                    )}

                    {/* Summary Stats */}
                    {activeSentiments.length > 1 && (
                        <SummaryStats totalArticles={stats.total_articles} averageSentiment={stats.average_sentiment} />
                    )}

                    {/* Footer Info */}
                    <FooterInfo
                        totalArticles={stats.total_articles}
                        source={source}
                        startDate={startDate}
                        endDate={endDate}
                    />
                </CardContent>
            </Card>
        </LightweightErrorBoundary>
    );
}

// ============================================================================
// SUB COMPONENTS
// ============================================================================

function ErrorState() {
    return (
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900">
            <CardHeader>
                <CardTitle className={cn(flexPatterns.start, gap.sm)}>
                    <TrendingUp className="h-5 w-5" />
                    Sentiment Analyse
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className={cn(bodyText.small, 'text-red-800 dark:text-red-300')}>
                    Kan sentiment statistieken niet laden
                </p>
            </CardContent>
        </Card>
    );
}

function LoadingState() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className={cn(flexPatterns.start, gap.sm)}>
                    <TrendingUp className="h-5 w-5" />
                    Sentiment Analyse
                </CardTitle>
            </CardHeader>
            <CardContent className={spacing.md}>
                <div className={cn('grid grid-cols-3', gap.md)}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={spacing.xs}>
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

function EmptyState() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className={cn(flexPatterns.start, gap.sm)}>
                    <TrendingUp className="h-5 w-5" />
                    Sentiment Analyse
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className={cn(bodyText.small, 'text-muted-foreground')}>
                        Geen sentiment data beschikbaar
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

function LimitedDataWarning({ count }: { count: number }) {
    return (
        <div className={cn('p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800')}>
            <p className={cn(bodyText.small, 'text-yellow-800 dark:text-yellow-300', flexPatterns.start, gap.sm)}>
                <AlertCircle className="h-4 w-4" />
                Beperkte data ({count} {count === 1 ? 'artikel' : 'artikelen'}). Resultaten zijn mogelijk niet representatief.
            </p>
        </div>
    );
}

function SentimentDistribution({
    activeSentiments,
    percentages,
    dominantSentiment,
}: {
    activeSentiments: Array<{ type: SentimentType; count: number }>;
    percentages: Record<SentimentType, string> | null;
    dominantSentiment: SentimentType | null;
}) {
    const gridClass = activeSentiments.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : activeSentiments.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3';

    return (
        <div className={cn('grid', gridClass, gap.md)}>
            {activeSentiments.map((sentiment) => {
                const config = sentimentConfig[sentiment.type as SentimentType];
                const Icon = config.icon;
                const isDominant = dominantSentiment === sentiment.type;
                const percentage = percentages ? percentages[sentiment.type] : '0.0';

                return (
                    <div key={sentiment.type} className={sentimentCardVariants({ type: sentiment.type, dominant: isDominant })}>
                        <Icon className={cn('h-10 w-10 mb-2', isDominant ? '' : 'opacity-70')} />
                        <div className="text-3xl font-bold mb-1">{sentiment.count.toLocaleString('nl-NL')}</div>
                        <div className={cn(bodyText.small, 'font-medium mb-1')}>{config.label}</div>
                        <div className={cn(bodyText.xs, 'font-semibold')}>{percentage}%</div>
                        {isDominant && activeSentiments.length > 1 && <Award className="h-4 w-4 mt-2" />}
                    </div>
                );
            })}
        </div>
    );
}

function AverageSentimentMeter({ averageSentiment }: { averageSentiment: number }) {
    const position = Math.max(0, Math.min(100, ((Number(averageSentiment) + 1) / 2) * 100));
    const sentimentType: SentimentType = averageSentiment > 0.2 ? 'positive' : averageSentiment < -0.2 ? 'negative' : 'neutral';
    const colorClasses = {
        positive: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        negative: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300',
    };

    return (
        <div className="p-4 rounded-lg bg-muted/30">
            <div className={cn(flexPatterns.between, 'mb-3')}>
                <span className={cn(bodyText.small, 'font-semibold')}>Gemiddeld Sentiment</span>
                <span className={cn('text-lg font-bold px-3 py-1 rounded-full', colorClasses[sentimentType])}>
                    {averageSentiment > 0 ? '+' : ''}
                    {Number(averageSentiment).toFixed(3)}
                </span>
            </div>
            <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                <div className="absolute h-full bg-gradient-to-r from-red-500 via-gray-400 to-green-500 w-full" />
                <div
                    className={cn('absolute h-full w-1.5 bg-white border-2 border-gray-900 dark:border-white rounded-full shadow-lg', transitions.base)}
                    style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                    title={`Sentiment: ${Number(averageSentiment).toFixed(3)}`}
                />
            </div>
            <div className={cn(flexPatterns.between, 'mt-2', bodyText.xs, 'text-muted-foreground font-medium')}>
                <span className={cn(flexPatterns.start, gap.xs)}>
                    <Frown className="h-3 w-3" />
                    -1.0
                </span>
                <span className={cn(flexPatterns.start, gap.xs)}>
                    <Meh className="h-3 w-3" />
                    0.0
                </span>
                <span className={cn(flexPatterns.start, gap.xs)}>
                    <Smile className="h-3 w-3" />
                    +1.0
                </span>
            </div>
        </div>
    );
}

function ExtremeArticles({ mostPositive, mostNegative }: { mostPositive?: string; mostNegative?: string }) {
    return (
        <div className={cn('grid grid-cols-1 md:grid-cols-2', gap.md, 'pt-4 border-t')}>
            {mostPositive && (
                <div className={extremeArticleVariants({ type: 'positive' })}>
                    <div className={cn(flexPatterns.start, gap.sm, 'mb-2')}>
                        <Smile className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <h4 className={cn(bodyText.small, 'font-semibold text-green-700 dark:text-green-400')}>
                            Meest Positief
                        </h4>
                    </div>
                    <p className={cn(bodyText.small, 'text-muted-foreground line-clamp-2 leading-relaxed')}>
                        &ldquo;{mostPositive}&rdquo;
                    </p>
                </div>
            )}
            {mostNegative && (
                <div className={extremeArticleVariants({ type: 'negative' })}>
                    <div className={cn(flexPatterns.start, gap.sm, 'mb-2')}>
                        <Frown className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <h4 className={cn(bodyText.small, 'font-semibold text-red-700 dark:text-red-400')}>
                            Meest Negatief
                        </h4>
                    </div>
                    <p className={cn(bodyText.small, 'text-muted-foreground line-clamp-2 leading-relaxed')}>
                        &ldquo;{mostNegative}&rdquo;
                    </p>
                </div>
            )}
        </div>
    );
}

function SummaryStats({ totalArticles, averageSentiment }: { totalArticles: number; averageSentiment: number }) {
    return (
        <div className={cn('grid grid-cols-2', gap.sm, 'pt-4 border-t')}>
            <div className="text-center p-2 rounded-lg bg-muted/50">
                <p className={cn(bodyText.xs, 'text-muted-foreground mb-1')}>Totaal Artikelen</p>
                <p className="text-lg font-bold">{totalArticles.toLocaleString('nl-NL')}</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-primary/10">
                <p className={cn(bodyText.xs, 'text-primary mb-1')}>Gemiddeld Sentiment</p>
                <p className="text-lg font-bold text-primary">
                    {averageSentiment > 0 ? '+' : ''}
                    {averageSentiment.toFixed(2)}
                </p>
            </div>
        </div>
    );
}

function FooterInfo({
    totalArticles,
    source,
    startDate,
    endDate,
}: {
    totalArticles: number;
    source?: string;
    startDate?: string;
    endDate?: string;
}) {
    return (
        <p className={cn(bodyText.xs, 'text-muted-foreground text-center pt-4 border-t')}>
            Analyse van {totalArticles.toLocaleString('nl-NL')} artikelen
            {source && ` van ${source}`}
            {(startDate || endDate) && ' in geselecteerde periode'}
        </p>
    );
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
    sentimentCardVariants,
    extremeArticleVariants,
};
export type { SentimentDashboardProps, SentimentType };