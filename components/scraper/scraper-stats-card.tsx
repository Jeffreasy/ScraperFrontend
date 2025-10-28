'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export function ScraperStatsCard() {
    const { data, isLoading, isError } = useScraperStats();

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Scraper Statistieken
                    </CardTitle>
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
        );
    }

    if (isError || !data?.data) {
        return (
            <Card className="border-red-200 bg-red-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        Scraper Statistieken
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-red-800">
                        Kan scraper statistieken niet ophalen
                    </p>
                </CardContent>
            </Card>
        );
    }

    const stats = data.data;
    const totalArticles = Object.values(stats.articles_by_source).reduce((sum, count) => sum + count, 0);

    const getCircuitBreakerIcon = (state: string) => {
        switch (state) {
            case 'closed':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'open':
                return <XCircle className="h-4 w-4 text-red-600" />;
            case 'half_open':
                return <AlertCircle className="h-4 w-4 text-yellow-600" />;
            default:
                return <Activity className="h-4 w-4 text-gray-400" />;
        }
    };

    return (
        <LightweightErrorBoundary componentName="Scraper Stats">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Articles by Source */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            Artikelen per Bron
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(stats.articles_by_source)
                                .sort(([, a], [, b]) => b - a)
                                .map(([source, count]) => {
                                    const percentage = ((count / totalArticles) * 100).toFixed(1);
                                    return (
                                        <div key={source} className="space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">{source}</span>
                                                <span className="text-muted-foreground">
                                                    {count.toLocaleString('nl-NL')} ({percentage}%)
                                                </span>
                                            </div>
                                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary transition-all"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            <div className="pt-2 border-t">
                                <div className="flex items-center justify-between text-sm font-semibold">
                                    <span>Totaal</span>
                                    <span>{totalArticles.toLocaleString('nl-NL')}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Circuit Breakers */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Circuit Breakers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(stats.circuit_breakers).map(([source, breaker]) => (
                                <div
                                    key={source}
                                    className={`p-3 rounded-lg border ${breaker.state === 'closed'
                                            ? 'bg-green-50 border-green-200'
                                            : breaker.state === 'open'
                                                ? 'bg-red-50 border-red-200'
                                                : 'bg-yellow-50 border-yellow-200'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm">{source}</span>
                                        <div className="flex items-center gap-2">
                                            {getCircuitBreakerIcon(breaker.state)}
                                            <span className="text-xs font-semibold capitalize">
                                                {breaker.state}
                                            </span>
                                        </div>
                                    </div>
                                    {breaker.failures > 0 && (
                                        <div className="mt-1 text-xs text-muted-foreground">
                                            Failures: {breaker.failures}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div className="pt-2 border-t">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Rate Limit Delay</span>
                                    <span className="font-medium">{stats.rate_limit_delay}s</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Content Extraction */}
                {stats.content_extraction && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                Content Extractie
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Totaal artikelen</span>
                                        <span className="font-semibold">
                                            {stats.content_extraction.total}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Geëxtraheerd</span>
                                        <span className="font-semibold text-green-600">
                                            {stats.content_extraction.extracted}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">In afwachting</span>
                                        <span className="font-semibold text-yellow-600">
                                            {stats.content_extraction.pending}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Voortgang</span>
                                        <span className="font-semibold">
                                            {stats.content_extraction.total > 0
                                                ? Math.round(
                                                    (stats.content_extraction.extracted /
                                                        stats.content_extraction.total) *
                                                    100
                                                )
                                                : 0}
                                            %
                                        </span>
                                    </div>
                                    <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                                            style={{
                                                width: `${stats.content_extraction.total > 0
                                                        ? (stats.content_extraction.extracted /
                                                            stats.content_extraction.total) *
                                                        100
                                                        : 0
                                                    }%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Success Rate */}
                                <div className="pt-3 border-t">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-primary">
                                            {stats.content_extraction.total > 0
                                                ? Math.round(
                                                    (stats.content_extraction.extracted /
                                                        stats.content_extraction.total) *
                                                    100
                                                )
                                                : 0}
                                            %
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Success Rate
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Browser Pool */}
                {stats.browser_pool && stats.browser_pool.enabled && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                Browser Pool
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    <span
                                        className={`text-sm font-semibold ${stats.browser_pool.closed
                                                ? 'text-red-600'
                                                : 'text-green-600'
                                            }`}
                                    >
                                        {stats.browser_pool.closed ? '⚫ Gesloten' : '🟢 Actief'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/20">
                                        <div className="text-2xl font-bold text-primary">
                                            {stats.browser_pool.pool_size}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Pool Size
                                        </div>
                                    </div>
                                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="text-2xl font-bold text-green-600">
                                            {stats.browser_pool.available}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Beschikbaar
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">In gebruik</span>
                                        <span className="font-semibold flex items-center gap-1">
                                            {stats.browser_pool.in_use > 0 && (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            )}
                                            {stats.browser_pool.in_use}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Sources Configured */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Configuratie
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <div className="text-sm text-muted-foreground mb-2">
                                    Geconfigureerde Bronnen
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {stats.sources_configured.map((source) => (
                                        <span
                                            key={source}
                                            className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                                        >
                                            {source}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-3 border-t">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Totaal bronnen</span>
                                    <span className="text-xl font-bold text-primary">
                                        {stats.sources_configured.length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </LightweightErrorBoundary>
    );
}