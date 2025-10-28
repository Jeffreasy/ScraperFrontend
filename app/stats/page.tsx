'use client';

import { useQuery } from '@tanstack/react-query';
import {
    TrendingUp,
    FileText,
    Clock,
    Calendar,
    BarChart3,
    Activity,
    Cpu,
    Sparkles,
} from 'lucide-react';
import { advancedApiClient } from '@/lib/api/advanced-client';
import { STALE_TIMES } from '@/components/providers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, getCategoryIcon } from '@/lib/utils';
import { LightweightErrorBoundary } from '@/components/error-boundary';
import Link from 'next/link';

function StatCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
}: {
    title: string;
    value: string | number;
    icon: any;
    description?: string;
    trend?: 'up' | 'down' | 'neutral';
}) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-bold">{value}</div>
                    {trend && (
                        <span
                            className={`text-xs font-medium ${trend === 'up'
                                    ? 'text-green-600'
                                    : trend === 'down'
                                        ? 'text-red-600'
                                        : 'text-gray-600'
                                }`}
                        >
                            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
                        </span>
                    )}
                </div>
                {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            </CardContent>
        </Card>
    );
}

function StatCardSkeleton() {
    return (
        <Card>
            <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
            </CardContent>
        </Card>
    );
}

export default function StatsPage() {
    const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery({
        queryKey: ['stats'],
        queryFn: () => advancedApiClient.getArticleStats(),
        staleTime: STALE_TIMES.stats,
        refetchInterval: STALE_TIMES.stats,
    });

    const stats = statsData?.success ? statsData.data : null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-4xl font-bold flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-primary" />
                    Data Statistieken
                </h1>
                <p className="text-lg text-muted-foreground">
                    Analyse van artikelen, bronnen en categorieën
                </p>
            </div>

            {/* Global Error */}
            {statsError && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <p className="text-sm text-red-800">
                            Kan statistieken niet ophalen. Probeer de pagina te verversen.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Main Statistics */}
            <LightweightErrorBoundary componentName="Statistics Cards">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {statsLoading ? (
                        <>
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                        </>
                    ) : stats ? (
                        <>
                            <StatCard
                                title="Totaal Artikelen"
                                value={stats.total_articles.toLocaleString('nl-NL')}
                                icon={FileText}
                                description="In de database"
                                trend="up"
                            />
                            <StatCard
                                title="Laatste 24 Uur"
                                value={stats.recent_articles_24h.toLocaleString('nl-NL')}
                                icon={Clock}
                                description={`${((stats.recent_articles_24h / stats.total_articles) * 100).toFixed(1)}% van totaal`}
                                trend={stats.recent_articles_24h > 0 ? 'up' : 'neutral'}
                            />
                            <StatCard
                                title="Nieuwsbronnen"
                                value={Object.keys(stats.articles_by_source).length}
                                icon={TrendingUp}
                                description="Actieve bronnen"
                            />
                            <StatCard
                                title="Categorieën"
                                value={Object.keys(stats.categories).length}
                                icon={Calendar}
                                description="Verschillende categorieën"
                            />
                        </>
                    ) : null}
                </div>
            </LightweightErrorBoundary>

            {/* Articles by Source */}
            <LightweightErrorBoundary componentName="Articles by Source">
                {statsLoading ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Artikelen per Bron</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-2 w-full" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ) : stats && Object.keys(stats.articles_by_source).length > 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Artikelen per Bron</span>
                                <span className="text-sm font-normal text-muted-foreground">
                                    {Object.keys(stats.articles_by_source).length} bronnen
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Object.entries(stats.articles_by_source)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([source, count], index) => {
                                        const percentage = (count / stats.total_articles) * 100;
                                        const isTop3 = index < 3;

                                        return (
                                            <Link
                                                key={source}
                                                href={`/?source=${encodeURIComponent(source)}`}
                                                className="block group"
                                            >
                                                <div className="space-y-2 p-2 rounded-lg hover:bg-accent transition-colors">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="font-medium group-hover:text-primary transition-colors flex items-center gap-2">
                                                            {isTop3 && (
                                                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                                                                    {index + 1}
                                                                </span>
                                                            )}
                                                            {source}
                                                        </span>
                                                        <span className="text-muted-foreground">
                                                            {count.toLocaleString('nl-NL')} ({percentage.toFixed(1)}%)
                                                        </span>
                                                    </div>
                                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all ${isTop3 ? 'bg-primary' : 'bg-primary/60'
                                                                }`}
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                            </div>
                        </CardContent>
                    </Card>
                ) : null}
            </LightweightErrorBoundary>

            {/* Categories Grid */}
            <LightweightErrorBoundary componentName="Categories">
                {statsLoading ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Categorieën</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Card key={i} className="text-center">
                                        <CardContent className="pt-6">
                                            <Skeleton className="h-12 w-12 rounded-full mx-auto mb-2" />
                                            <Skeleton className="h-4 w-20 mx-auto mb-1" />
                                            <Skeleton className="h-8 w-16 mx-auto" />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : stats && stats.categories && Object.keys(stats.categories).length > 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Categorieën</span>
                                <span className="text-sm font-normal text-muted-foreground">
                                    {Object.keys(stats.categories).length} categorieën
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {Object.entries(stats.categories)
                                    .sort(([, a], [, b]) => b.article_count - a.article_count)
                                    .map(([name, category], index) => {
                                        const percentage = ((category.article_count / stats.total_articles) * 100).toFixed(1);
                                        const isTop3 = index < 3;

                                        return (
                                            <Link
                                                key={name}
                                                href={`/?category=${encodeURIComponent(name)}`}
                                                className="block group"
                                            >
                                                <Card
                                                    className={`text-center transition-all hover:shadow-lg hover:scale-105 cursor-pointer ${isTop3 ? 'ring-2 ring-primary/20' : ''
                                                        }`}
                                                >
                                                    <CardContent className="pt-6 pb-4">
                                                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                                                            {getCategoryIcon(name)}
                                                        </div>
                                                        <p className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
                                                            {name}
                                                        </p>
                                                        <p className="text-2xl font-bold text-primary mb-1">
                                                            {category.article_count.toLocaleString('nl-NL')}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {percentage}% van totaal
                                                        </p>
                                                        {isTop3 && (
                                                            <div className="mt-2">
                                                                <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                                                                    Top {index + 1}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        );
                                    })}
                            </div>
                        </CardContent>
                    </Card>
                ) : stats ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Categorieën</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground text-center py-8">
                                Geen categorieën gevonden
                            </p>
                        </CardContent>
                    </Card>
                ) : null}
            </LightweightErrorBoundary>

            {/* Date Range Info */}
            <LightweightErrorBoundary componentName="Date Range">
                {statsLoading ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Datum Bereik</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[1, 2].map((i) => (
                                    <div key={i}>
                                        <Skeleton className="h-4 w-24 mb-2" />
                                        <Skeleton className="h-6 w-full" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : stats && (stats.oldest_article || stats.newest_article) ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Database Bereik</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {stats.oldest_article && (
                                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                                        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            Oudste artikel
                                        </p>
                                        <p className="font-semibold text-lg">
                                            {formatDate(stats.oldest_article)}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {Math.floor(
                                                (Date.now() - new Date(stats.oldest_article).getTime()) /
                                                (1000 * 60 * 60 * 24)
                                            )}{' '}
                                            dagen geleden
                                        </p>
                                    </div>
                                )}
                                {stats.newest_article && (
                                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                                        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4" />
                                            Nieuwste artikel
                                        </p>
                                        <p className="font-semibold text-lg">
                                            {formatDate(stats.newest_article)}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {Math.floor(
                                                (Date.now() - new Date(stats.newest_article).getTime()) /
                                                (1000 * 60)
                                            )}{' '}
                                            minuten geleden
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Coverage Summary */}
                            {stats.oldest_article && stats.newest_article && (
                                <div className="mt-4 pt-4 border-t">
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground mb-1">
                                            Database Periode
                                        </p>
                                        <p className="font-semibold text-lg">
                                            {Math.floor(
                                                (new Date(stats.newest_article).getTime() -
                                                    new Date(stats.oldest_article).getTime()) /
                                                (1000 * 60 * 60 * 24)
                                            )}{' '}
                                            dagen coverage
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : null}
            </LightweightErrorBoundary>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Meer Insights
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Link
                            href="/admin"
                            className="p-4 rounded-lg bg-background hover:bg-accent border transition-all group"
                        >
                            <Activity className="h-6 w-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                            <p className="font-semibold text-sm">System Monitoring</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Scraper status en circuit breakers
                            </p>
                        </Link>
                        <Link
                            href="/ai"
                            className="p-4 rounded-lg bg-background hover:bg-accent border transition-all group"
                        >
                            <Sparkles className="h-6 w-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                            <p className="font-semibold text-sm">AI Insights</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Sentiment analyse en trending topics
                            </p>
                        </Link>
                        <Link
                            href="/"
                            className="p-4 rounded-lg bg-background hover:bg-accent border transition-all group"
                        >
                            <FileText className="h-6 w-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                            <p className="font-semibold text-sm">Browse Artikelen</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Bekijk alle {stats?.total_articles.toLocaleString('nl-NL') || 0} artikelen
                            </p>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}