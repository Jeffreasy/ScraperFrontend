'use client';

import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { TrendingUp, Clock, Hash, Flame, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTrendingTopics } from '@/lib/hooks/use-article-ai';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { LightweightErrorBoundary } from '@/components/error-boundary';
import {
    cn,
    flexPatterns,
    spacing,
    transitions,
    bodyText,
    gap,
} from '@/lib/styles/theme';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface TrendingTopicsProps {
    hours?: number;
    minArticles?: number;
    maxTopics?: number;
}

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const topicCardVariants = cva(
    ['flex items-start gap-3 p-3 rounded-lg', transitions.base, 'hover:bg-accent hover:shadow-md'],
    {
        variants: {
            highlighted: {
                true: 'bg-primary/5 border border-primary/20',
                false: '',
            },
        },
        defaultVariants: {
            highlighted: false,
        },
    }
);

const rankBadgeVariants = cva(
    ['flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center', bodyText.xs, 'font-bold'],
    {
        variants: {
            rank: {
                top: 'bg-primary text-primary-foreground',
                default: 'bg-primary/10 text-primary',
            },
        },
        defaultVariants: {
            rank: 'default',
        },
    }
);

const sentimentIndicatorVariants = cva(
    [bodyText.xs, 'font-medium px-2 py-0.5 rounded-full'],
    {
        variants: {
            sentiment: {
                positive: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
                negative: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
                neutral: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30',
            },
        },
    }
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TrendingTopics({
    hours = 24,
    minArticles = 3,
    maxTopics = 10,
}: TrendingTopicsProps = {}) {
    const { data, isLoading, error } = useTrendingTopics(hours, minArticles);

    if (error) return <ErrorState />;
    if (isLoading) return <LoadingState />;
    if (!data || data.topics.length === 0) return <EmptyState />;

    const totalArticles = data.topics.reduce((sum, t) => sum + t.article_count, 0);
    const topicsToShow = data.topics.slice(0, maxTopics);

    return (
        <LightweightErrorBoundary componentName="Trending Topics">
            <Card>
                <CardHeader>
                    <CardTitle className={cn('text-base', flexPatterns.between)}>
                        <span className={cn(flexPatterns.start, gap.sm)}>
                            <TrendingUp className="h-4 w-4" />
                            Trending Now
                        </span>
                        <span className={cn(bodyText.xs, 'font-normal text-muted-foreground', flexPatterns.start, gap.xs)}>
                            <Clock className="h-3 w-3" />
                            {hours}u
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className={spacing.sm}>
                    {topicsToShow.map((topic, index) => {
                        const isTop3 = index < 3;
                        const articlePercentage = ((topic.article_count / totalArticles) * 100).toFixed(1);
                        const sentimentType = topic.average_sentiment > 0.2 ? 'positive' : topic.average_sentiment < -0.2 ? 'negative' : 'neutral';

                        return (
                            <Link
                                key={topic.keyword}
                                href={`/?search=${encodeURIComponent(topic.keyword)}`}
                                className="block group"
                            >
                                <div className={topicCardVariants({ highlighted: isTop3 })}>
                                    <div className={rankBadgeVariants({ rank: isTop3 ? 'top' : 'default' })}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={cn(flexPatterns.between, 'gap-2')}>
                                            <h4 className={cn('font-semibold', bodyText.small, 'group-hover:text-primary', transitions.colors, 'truncate flex-1', flexPatterns.start, gap.xs)}>
                                                {topic.keyword}
                                                {isTop3 && <Flame className="h-3 w-3 text-orange-500 shrink-0" />}
                                            </h4>
                                            <div className={sentimentIndicatorVariants({ sentiment: sentimentType })}>
                                                {topic.average_sentiment > 0 ? <ArrowUp className="h-3 w-3 inline" /> : topic.average_sentiment < 0 ? <ArrowDown className="h-3 w-3 inline" /> : <Minus className="h-3 w-3 inline" />}
                                                {Math.abs(topic.average_sentiment).toFixed(2)}
                                            </div>
                                        </div>

                                        <div className={cn(flexPatterns.start, gap.sm, 'mt-2')}>
                                            <span className={cn(bodyText.xs, 'text-muted-foreground', flexPatterns.start, gap.xs)}>
                                                <Hash className="h-3 w-3" />
                                                {topic.article_count} artikelen ({articlePercentage}%)
                                            </span>
                                        </div>

                                        <div className={cn('flex flex-wrap', gap.xs, 'mt-2')}>
                                            {topic.sources.slice(0, 3).map((source) => (
                                                <span
                                                    key={source}
                                                    className={cn('inline-flex items-center rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground')}
                                                >
                                                    {source}
                                                </span>
                                            ))}
                                            {topic.sources.length > 3 && (
                                                <span className={cn('text-[10px] text-muted-foreground self-center')}>
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
                        <p className={cn(bodyText.xs, 'text-muted-foreground text-center pt-2')}>
                            {data.topics.length - maxTopics} meer trending topics beschikbaar
                        </p>
                    )}

                    <div className={cn('pt-3 border-t', spacing.xs)}>
                        <p className={cn(bodyText.xs, 'text-muted-foreground', flexPatterns.start, gap.xs)}>
                            <TrendingUp className="h-3 w-3" />
                            Gebaseerd op {totalArticles} artikelen in de laatste {data.hours_back} uur
                        </p>
                        <p className={cn(bodyText.xs, 'text-muted-foreground')}>
                            Minimaal {data.min_articles} artikelen per topic
                        </p>
                    </div>
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
                <CardTitle className={cn('text-base', flexPatterns.start, gap.sm)}>
                    <TrendingUp className="h-4 w-4" />
                    Trending Now
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className={cn(bodyText.small, 'text-red-800 dark:text-red-300')}>
                    Kan trending topics niet laden
                </p>
                <p className={cn(bodyText.xs, 'text-red-600 dark:text-red-400 mt-1')}>
                    Probeer de pagina te verversen
                </p>
            </CardContent>
        </Card>
    );
}

function LoadingState() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className={cn('text-base', flexPatterns.start, gap.sm)}>
                    <TrendingUp className="h-4 w-4" />
                    Trending Now
                </CardTitle>
            </CardHeader>
            <CardContent className={spacing.sm}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={cn(flexPatterns.start, gap.sm)}>
                        <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
                        <div className={cn('flex-1', spacing.xs)}>
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

function EmptyState() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className={cn('text-base', flexPatterns.start, gap.sm)}>
                    <TrendingUp className="h-4 w-4" />
                    Trending Now
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center py-8">
                    <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className={cn(bodyText.small, 'text-muted-foreground')}>
                        Geen trending topics op dit moment
                    </p>
                    <p className={cn(bodyText.xs, 'text-muted-foreground mt-1')}>
                        Check later voor nieuwe trends
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
    topicCardVariants,
    rankBadgeVariants,
    sentimentIndicatorVariants,
};
export type { TrendingTopicsProps };