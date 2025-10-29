'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useScraperStats } from '@/lib/hooks/use-scraper-stats';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Activity,
    AlertCircle,
    CheckCircle,
    Clock,
    Database,
    Globe,
    Loader2,
    XCircle,
} from 'lucide-react';
import { LightweightErrorBoundary } from '@/components/error-boundary';
import {
    cn,
    flexPatterns,
    spacing,
    transitions,
    bodyText,
    gap,
    gridLayouts,
} from '@/lib/styles/theme';

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const circuitBreakerVariants = cva(
    ['p-3 rounded-lg border', transitions.colors],
    {
        variants: {
            state: {
                closed: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
                open: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
                half_open: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
            },
        },
    }
);

const statusIndicatorVariants = cva(
    [bodyText.small, 'font-semibold'],
    {
        variants: {
            status: {
                active: 'text-green-600 dark:text-green-400',
                closed: 'text-red-600 dark:text-red-400',
            },
        },
    }
);

const statBoxVariants = cva(
    ['text-center p-3 rounded-lg border', transitions.colors],
    {
        variants: {
            variant: {
                primary: 'bg-primary/5 border-primary/20',
                success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
                default: 'bg-muted/50 border-border',
            },
        },
    }
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getCircuitBreakerIcon(state: string) {
    const icons = {
        closed: <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />,
        open: <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />,
        half_open: <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />,
    };
    return icons[state as keyof typeof icons] || <Activity className="h-4 w-4 text-gray-400" />;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ScraperStatsCard() {
    const { data, isLoading, isError } = useScraperStats();

    if (isLoading) return <LoadingState />;
    if (isError || !data?.data) return <ErrorState />;

    const stats = data.data;
    const totalArticles = Object.values(stats.articles_by_source).reduce(
        (sum, count) => sum + count,
        0
    );

    return (
        <LightweightErrorBoundary componentName="Scraper Stats">
            <div className={cn(gridLayouts.threeColumn, gap.md)}>
                {/* Articles by Source */}
                <ArticlesBySource articles={stats.articles_by_source} totalArticles={totalArticles} />

                {/* Circuit Breakers */}
                <CircuitBreakers
                    breakers={stats.circuit_breakers}
                    rateLimitDelay={stats.rate_limit_delay}
                />

                {/* Content Extraction */}
                {stats.content_extraction && <ContentExtraction extraction={stats.content_extraction} />}

                {/* Browser Pool */}
                {stats.browser_pool && stats.browser_pool.enabled && (
                    <BrowserPoolInfo pool={stats.browser_pool} />
                )}

                {/* Sources Configured */}
                <SourcesConfigured sources={stats.sources_configured} />
            </div>
        </LightweightErrorBoundary>
    );
}

// ============================================================================
// SUB COMPONENTS
// ============================================================================

function LoadingState() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className={cn(flexPatterns.start, gap.sm)}>
                    <Activity className="h-5 w-5" />
                    Scraper Statistieken
                </CardTitle>
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

function ErrorState() {
    return (
        <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
            <CardHeader>
                <CardTitle className={cn(flexPatterns.start, gap.sm)}>
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    Scraper Statistieken
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className={cn(bodyText.small, 'text-red-800 dark:text-red-300')}>
                    Kan scraper statistieken niet ophalen
                </p>
            </CardContent>
        </Card>
    );
}

function ArticlesBySource({
    articles,
    totalArticles,
}: {
    articles: Record<string, number>;
    totalArticles: number;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className={cn('text-base', flexPatterns.start, gap.sm)}>
                    <Database className="h-4 w-4" />
                    Artikelen per Bron
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className={spacing.sm}>
                    {Object.entries(articles)
                        .sort(([, a], [, b]) => b - a)
                        .map(([source, count]) => {
                            const percentage = ((count / totalArticles) * 100).toFixed(1);
                            return (
                                <div key={source} className={spacing.xs}>
                                    <div className={cn(flexPatterns.between, bodyText.small)}>
                                        <span className="font-medium">{source}</span>
                                        <span className="text-muted-foreground">
                                            {count.toLocaleString('nl-NL')} ({percentage}%)
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className={cn('h-full bg-primary', transitions.base)}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    <div className="pt-2 border-t">
                        <div className={cn(flexPatterns.between, bodyText.small, 'font-semibold')}>
                            <span>Totaal</span>
                            <span>{totalArticles.toLocaleString('nl-NL')}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function CircuitBreakers({
    breakers,
    rateLimitDelay,
}: {
    breakers: Record<string, any>;
    rateLimitDelay: number;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className={cn('text-base', flexPatterns.start, gap.sm)}>
                    <Globe className="h-4 w-4" />
                    Circuit Breakers
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className={spacing.sm}>
                    {Object.entries(breakers).map(([source, breaker]) => (
                        <div key={source} className={circuitBreakerVariants({ state: breaker.state as any })}>
                            <div className={flexPatterns.between}>
                                <span className={cn('font-medium', bodyText.small)}>{source}</span>
                                <div className={cn(flexPatterns.start, gap.sm)}>
                                    {getCircuitBreakerIcon(breaker.state)}
                                    <span className={cn(bodyText.xs, 'font-semibold capitalize')}>
                                        {breaker.state}
                                    </span>
                                </div>
                            </div>
                            {breaker.failures > 0 && (
                                <div className={cn('mt-1', bodyText.xs, 'text-muted-foreground')}>
                                    Failures: {breaker.failures}
                                </div>
                            )}
                        </div>
                    ))}
                    <div className="pt-2 border-t">
                        <div className={cn(flexPatterns.between, bodyText.xs, 'text-muted-foreground')}>
                            <span>Rate Limit Delay</span>
                            <span className="font-medium">{rateLimitDelay}s</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function ContentExtraction({ extraction }: { extraction: any }) {
    const successRate = extraction.total > 0
        ? Math.round((extraction.extracted / extraction.total) * 100)
        : 0;
    const progressWidth = extraction.total > 0
        ? (extraction.extracted / extraction.total) * 100
        : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className={cn('text-base', flexPatterns.start, gap.sm)}>
                    <Activity className="h-4 w-4" />
                    Content Extractie
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className={spacing.md}>
                    <div className={cn(spacing.xs, bodyText.small)}>
                        <MetricRow label="Totaal artikelen" value={extraction.total} />
                        <div className={flexPatterns.between}>
                            <span className="text-muted-foreground">Geëxtraheerd</span>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                                {extraction.extracted}
                            </span>
                        </div>
                        <div className={flexPatterns.between}>
                            <span className="text-muted-foreground">In afwachting</span>
                            <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                                {extraction.pending}
                            </span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className={spacing.xs}>
                        <div className={cn(flexPatterns.between, bodyText.xs, 'text-muted-foreground')}>
                            <span>Voortgang</span>
                            <span className="font-semibold">{successRate}%</span>
                        </div>
                        <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                                className={cn('h-full bg-gradient-to-r from-green-500 to-green-600', transitions.base)}
                                style={{ width: `${progressWidth}%` }}
                            />
                        </div>
                    </div>

                    {/* Success Rate Display */}
                    <div className="pt-3 border-t text-center">
                        <div className="text-2xl font-bold text-primary">{successRate}%</div>
                        <div className={cn(bodyText.xs, 'text-muted-foreground')}>Success Rate</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function BrowserPoolInfo({ pool }: { pool: any }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className={cn('text-base', flexPatterns.start, gap.sm)}>
                    <Globe className="h-4 w-4" />
                    Browser Pool
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className={spacing.sm}>
                    <div className={cn(flexPatterns.between, 'p-3 bg-muted/50 rounded-lg')}>
                        <span className={cn(bodyText.small, 'text-muted-foreground')}>Status</span>
                        <span className={statusIndicatorVariants({ status: pool.closed ? 'closed' : 'active' })}>
                            {pool.closed ? '⚫ Gesloten' : '🟢 Actief'}
                        </span>
                    </div>

                    <div className={cn('grid grid-cols-2', gap.sm)}>
                        <div className={statBoxVariants({ variant: 'primary' })}>
                            <div className="text-2xl font-bold text-primary">{pool.pool_size}</div>
                            <div className={cn(bodyText.xs, 'text-muted-foreground mt-1')}>Pool Size</div>
                        </div>
                        <div className={statBoxVariants({ variant: 'success' })}>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {pool.available}
                            </div>
                            <div className={cn(bodyText.xs, 'text-muted-foreground mt-1')}>Beschikbaar</div>
                        </div>
                    </div>

                    <div className="pt-3 border-t">
                        <div className={cn(flexPatterns.between, bodyText.small)}>
                            <span className="text-muted-foreground">In gebruik</span>
                            <span className={cn('font-semibold', flexPatterns.start, gap.xs)}>
                                {pool.in_use > 0 && <Loader2 className="h-3 w-3 animate-spin" />}
                                {pool.in_use}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function SourcesConfigured({ sources }: { sources: string[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className={cn('text-base', flexPatterns.start, gap.sm)}>
                    <Clock className="h-4 w-4" />
                    Configuratie
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className={spacing.sm}>
                    <div>
                        <div className={cn(bodyText.small, 'text-muted-foreground mb-2')}>
                            Geconfigureerde Bronnen
                        </div>
                        <div className={cn('flex flex-wrap', gap.sm)}>
                            {sources.map((source) => (
                                <Badge key={source} variant="secondary">
                                    {source}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <div className="pt-3 border-t">
                        <div className={flexPatterns.between}>
                            <span className={cn(bodyText.small, 'text-muted-foreground')}>Totaal bronnen</span>
                            <span className="text-xl font-bold text-primary">{sources.length}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function MetricRow({ label, value }: { label: string; value: string | number }) {
    return (
        <div className={flexPatterns.between}>
            <span className="text-muted-foreground">{label}</span>
            <span className="font-semibold">{value}</span>
        </div>
    );
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
    circuitBreakerVariants,
    statusIndicatorVariants,
    statBoxVariants,
};