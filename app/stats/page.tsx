'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import {
    TrendingUp,
    FileText,
    Clock,
    Calendar,
    BarChart3,
    Activity,
    Sparkles,
    AlertCircle,
} from 'lucide-react';
import { advancedApiClient } from '@/lib/api/advanced-client';
import { STALE_TIMES } from '@/components/providers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    responsiveHeadings,
    getCategoryIcon,
} from '@/lib/styles/theme';

// ============================================================================
// TYPES
// ============================================================================

type TrendType = 'up' | 'down' | 'neutral';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('nl-NL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const statCardVariants = cva(
    ['transition-all duration-200'],
    {
        variants: {
            hover: {
                none: '',
                lift: 'hover:shadow-md cursor-default',
                interactive: 'hover:shadow-lg hover:scale-105 cursor-pointer',
            },
        },
        defaultVariants: {
            hover: 'lift',
        },
    }
);

const trendIndicatorVariants = cva(
    [bodyText.xs, 'font-medium'],
    {
        variants: {
            trend: {
                up: 'text-green-600 dark:text-green-400',
                down: 'text-red-600 dark:text-red-400',
                neutral: 'text-muted-foreground',
            },
        },
        defaultVariants: {
            trend: 'neutral',
        },
    }
);

const progressBarVariants = cva(
    ['h-2 rounded-full transition-all duration-500'],
    {
        variants: {
            variant: {
                default: 'bg-primary/60',
                highlighted: 'bg-primary',
                gradient: 'bg-gradient-to-r from-primary to-primary/60',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const categoryCardVariants = cva(
    ['text-center transition-all duration-200'],
    {
        variants: {
            highlighted: {
                true: 'ring-2 ring-primary/30 shadow-md',
                false: '',
            },
            interactive: {
                true: 'hover:shadow-lg hover:scale-105 cursor-pointer',
                false: '',
            },
        },
        defaultVariants: {
            highlighted: false,
            interactive: true,
        },
    }
);

const dateRangeCardVariants = cva(
    ['p-4 rounded-lg border', transitions.colors],
    {
        variants: {
            variant: {
                oldest: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
                newest: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
            },
        },
    }
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function StatsPage() {
    const {
        data: statsData,
        isLoading: statsLoading,
        error: statsError,
    } = useQuery({
        queryKey: ['stats'],
        queryFn: () => advancedApiClient.getArticleStats(),
        staleTime: STALE_TIMES.stats,
        refetchInterval: STALE_TIMES.stats,
    });

    const stats = statsData?.success ? statsData.data : null;

    return (
        <div className={spacing.lg}>
            {/* Page Header */}
            <PageHeader />

            {/* Error State */}
            {statsError && <ErrorBanner />}

            {/* Main Statistics */}
            <LightweightErrorBoundary componentName="Statistics Cards">
                <StatsOverview stats={stats} isLoading={statsLoading} />
            </LightweightErrorBoundary>

            {/* Articles by Source */}
            <LightweightErrorBoundary componentName="Articles by Source">
                <ArticlesBySource stats={stats} isLoading={statsLoading} />
            </LightweightErrorBoundary>

            {/* Categories Grid */}
            <LightweightErrorBoundary componentName="Categories">
                <CategoriesGrid stats={stats} isLoading={statsLoading} />
            </LightweightErrorBoundary>

            {/* Date Range Info */}
            <LightweightErrorBoundary componentName="Date Range">
                <DateRangeInfo stats={stats} isLoading={statsLoading} />
            </LightweightErrorBoundary>

            {/* Quick Actions */}
            <QuickActionsCard stats={stats} />
        </div>
    );
}

// ============================================================================
// SUB COMPONENTS
// ============================================================================

function PageHeader() {
    return (
        <div className={spacing.xs}>
            <h1 className={cn(responsiveHeadings.h1, flexPatterns.start, gap.sm)}>
                <BarChart3 className="h-8 w-8 text-primary" />
                Data Statistieken
            </h1>
            <p className="text-lg text-muted-foreground">
                Analyse van artikelen, bronnen en categorieën
            </p>
        </div>
    );
}

function ErrorBanner() {
    return (
        <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className={cn('pt-6', flexPatterns.start, gap.sm)}>
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className={cn(bodyText.small, 'text-destructive')}>
                    Kan statistieken niet ophalen. Probeer de pagina te verversen.
                </p>
            </CardContent>
        </Card>
    );
}

function StatsOverview({ stats, isLoading }: { stats: any; isLoading: boolean }) {
    if (isLoading) {
        return (
            <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4')}>
                {[1, 2, 3, 4].map((i) => (
                    <StatCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4')}>
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
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: any;
    description?: string;
    trend?: TrendType;
}

function StatCard({ title, value, icon: Icon, description, trend }: StatCardProps) {
    return (
        <Card className={statCardVariants({ hover: 'lift' })}>
            <CardHeader className={cn(flexPatterns.between, 'pb-2')}>
                <CardTitle className={cn(bodyText.small, 'font-medium')}>{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className={cn(flexPatterns.start, 'items-baseline', gap.sm)}>
                    <div className="text-2xl font-bold">{value}</div>
                    {trend && (
                        <span className={trendIndicatorVariants({ trend })}>
                            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
                        </span>
                    )}
                </div>
                {description && (
                    <p className={cn(bodyText.xs, 'text-muted-foreground mt-1')}>{description}</p>
                )}
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

function ArticlesBySource({ stats, isLoading }: { stats: any; isLoading: boolean }) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Artikelen per Bron</CardTitle>
                </CardHeader>
                <CardContent className={spacing.md}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={spacing.xs}>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-2 w-full" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (!stats || !stats.articles_by_source || Object.keys(stats.articles_by_source).length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className={flexPatterns.between}>
                    <span>Artikelen per Bron</span>
                    <span className={cn(bodyText.small, 'font-normal text-muted-foreground')}>
                        {Object.keys(stats.articles_by_source).length} bronnen
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className={spacing.md}>
                    {Object.entries(stats.articles_by_source)
                        .sort(([, a]: any, [, b]: any) => b - a)
                        .map(([source, count]: any, index) => {
                            const percentage = (count / stats.total_articles) * 100;
                            const isTop3 = index < 3;

                            return (
                                <Link
                                    key={source}
                                    href={`/?source=${encodeURIComponent(source)}`}
                                    className="block group"
                                >
                                    <div className={cn('p-2 rounded-lg', 'hover:bg-accent', transitions.colors, spacing.xs)}>
                                        <div className={cn(flexPatterns.between, bodyText.small)}>
                                            <span className={cn('font-medium group-hover:text-primary', transitions.colors, flexPatterns.start, gap.sm)}>
                                                {isTop3 && (
                                                    <span className={cn('inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground', bodyText.xs, 'font-bold')}>
                                                        {index + 1}
                                                    </span>
                                                )}
                                                {source}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {count.toLocaleString('nl-NL')} ({percentage.toFixed(1)}%)
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mt-2">
                                            <div
                                                className={progressBarVariants({ variant: isTop3 ? 'highlighted' : 'default' })}
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
    );
}

function CategoriesGrid({ stats, isLoading }: { stats: any; isLoading: boolean }) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Categorieën</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={cn('grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5', gap.md)}>
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
        );
    }

    if (!stats?.categories || Object.keys(stats.categories).length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Categorieën</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className={cn(bodyText.small, 'text-muted-foreground text-center py-8')}>
                        Geen categorieën gevonden
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className={flexPatterns.between}>
                    <span>Categorieën</span>
                    <span className={cn(bodyText.small, 'font-normal text-muted-foreground')}>
                        {Object.keys(stats.categories).length} categorieën
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className={cn('grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5', gap.md)}>
                    {Object.entries(stats.categories)
                        .sort(([, a]: any, [, b]: any) => b.article_count - a.article_count)
                        .map(([name, category]: any, index) => {
                            const percentage = ((category.article_count / stats.total_articles) * 100).toFixed(1);
                            const isTop3 = index < 3;

                            return (
                                <Link
                                    key={name}
                                    href={`/?category=${encodeURIComponent(name)}`}
                                    className="block group"
                                >
                                    <Card className={categoryCardVariants({ highlighted: isTop3, interactive: true })}>
                                        <CardContent className="pt-6 pb-4">
                                            <div className={cn('text-3xl mb-2', 'group-hover:scale-110', transitions.transform)}>
                                                {getCategoryIcon(name)}
                                            </div>
                                            <p className={cn('font-medium', bodyText.small, 'mb-1', 'group-hover:text-primary', transitions.colors)}>
                                                {name}
                                            </p>
                                            <p className="text-2xl font-bold text-primary mb-1">
                                                {category.article_count.toLocaleString('nl-NL')}
                                            </p>
                                            <p className={cn(bodyText.xs, 'text-muted-foreground')}>
                                                {percentage}% van totaal
                                            </p>
                                            {isTop3 && (
                                                <div className="mt-2">
                                                    <Badge size="sm" variant="default">
                                                        Top {index + 1}
                                                    </Badge>
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
    );
}

function DateRangeInfo({ stats, isLoading }: { stats: any; isLoading: boolean }) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Datum Bereik</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={cn('grid grid-cols-1 sm:grid-cols-2', gap.md)}>
                        {[1, 2].map((i) => (
                            <div key={i}>
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-6 w-full" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!stats || (!stats.oldest_article && !stats.newest_article)) {
        return null;
    }

    const daysCoverage = stats.oldest_article && stats.newest_article
        ? Math.floor(
            (new Date(stats.newest_article).getTime() - new Date(stats.oldest_article).getTime()) /
            (1000 * 60 * 60 * 24)
        )
        : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Database Bereik</CardTitle>
            </CardHeader>
            <CardContent>
                <div className={cn('grid grid-cols-1 sm:grid-cols-2', gap.lg)}>
                    {stats.oldest_article && (
                        <div className={dateRangeCardVariants({ variant: 'oldest' })}>
                            <p className={cn(bodyText.small, 'text-muted-foreground mb-2', flexPatterns.start, gap.xs)}>
                                <Clock className="h-4 w-4" />
                                Oudste artikel
                            </p>
                            <p className="font-semibold text-lg">{formatDate(stats.oldest_article)}</p>
                            <p className={cn(bodyText.xs, 'text-muted-foreground mt-1')}>
                                {Math.floor((Date.now() - new Date(stats.oldest_article).getTime()) / (1000 * 60 * 60 * 24))}{' '}
                                dagen geleden
                            </p>
                        </div>
                    )}
                    {stats.newest_article && (
                        <div className={dateRangeCardVariants({ variant: 'newest' })}>
                            <p className={cn(bodyText.small, 'text-muted-foreground mb-2', flexPatterns.start, gap.xs)}>
                                <TrendingUp className="h-4 w-4" />
                                Nieuwste artikel
                            </p>
                            <p className="font-semibold text-lg">{formatDate(stats.newest_article)}</p>
                            <p className={cn(bodyText.xs, 'text-muted-foreground mt-1')}>
                                {Math.floor((Date.now() - new Date(stats.newest_article).getTime()) / (1000 * 60))}{' '}
                                minuten geleden
                            </p>
                        </div>
                    )}
                </div>

                {daysCoverage > 0 && (
                    <div className="mt-4 pt-4 border-t text-center">
                        <p className={cn(bodyText.small, 'text-muted-foreground mb-1')}>Database Periode</p>
                        <p className="font-semibold text-lg">{daysCoverage} dagen coverage</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function QuickActionsCard({ stats }: { stats: any }) {
    const links = [
        {
            href: '/admin',
            icon: Activity,
            title: 'System Monitoring',
            description: 'Scraper status en circuit breakers',
        },
        {
            href: '/ai',
            icon: Sparkles,
            title: 'AI Insights',
            description: 'Sentiment analyse en trending topics',
        },
        {
            href: '/',
            icon: FileText,
            title: 'Browse Artikelen',
            description: `Bekijk alle ${stats?.total_articles.toLocaleString('nl-NL') || 0} artikelen`,
        },
    ];

    return (
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
                <CardTitle className={cn(flexPatterns.start, gap.sm)}>
                    <Activity className="h-5 w-5" />
                    Meer Insights
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className={cn('grid grid-cols-1 sm:grid-cols-3', gap.sm)}>
                    {links.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn('p-4 rounded-lg border group', 'bg-background hover:bg-accent', transitions.base, 'hover:shadow-md')}
                            >
                                <Icon className={cn('h-6 w-6 text-primary mb-2', 'group-hover:scale-110', transitions.transform)} />
                                <p className={cn('font-semibold', bodyText.small)}>{link.title}</p>
                                <p className={cn(bodyText.xs, 'text-muted-foreground mt-1')}>{link.description}</p>
                            </Link>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
    statCardVariants,
    trendIndicatorVariants,
    progressBarVariants,
    categoryCardVariants,
    dateRangeCardVariants,
};