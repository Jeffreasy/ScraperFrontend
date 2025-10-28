'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScraperStatsCard } from '@/components/scraper/scraper-stats-card';
import { SentimentDashboard } from '@/components/ai/sentiment-dashboard';
import { TrendingTopics } from '@/components/ai/trending-topics';
import { useHealth, useMetrics } from '@/lib/hooks/use-health';
import { useQuery } from '@tanstack/react-query';
import { advancedApiClient } from '@/lib/api/advanced-client';
import { STALE_TIMES } from '@/components/providers';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Activity,
    AlertCircle,
    BarChart3,
    CheckCircle,
    Clock,
    Cpu,
    Database,
    FileText,
    Globe,
    Shield,
    TrendingUp,
} from 'lucide-react';
import { LightweightErrorBoundary } from '@/components/error-boundary';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import Link from 'next/link';

export default function AdminDashboard() {
    const { data: health, isLoading: healthLoading } = useHealth();
    const { data: metrics } = useMetrics();
    const { data: statsData } = useQuery({
        queryKey: ['stats'],
        queryFn: () => advancedApiClient.getArticleStats(),
        staleTime: STALE_TIMES.stats,
        refetchInterval: STALE_TIMES.stats,
    });
    const { data: processorData } = useQuery({
        queryKey: ['processor-stats'],
        queryFn: () => advancedApiClient.getProcessorStats(),
        staleTime: STALE_TIMES.processor,
        refetchInterval: STALE_TIMES.processor,
    });

    const healthData = health?.data;
    const metricsData = metrics?.data;
    const stats = statsData?.success ? statsData.data : null;
    const processor = processorData?.success ? processorData.data : null;

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'healthy':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'degraded':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'unhealthy':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case 'healthy':
                return <CheckCircle className="h-6 w-6" />;
            case 'degraded':
                return <Activity className="h-6 w-6" />;
            case 'unhealthy':
                return <AlertCircle className="h-6 w-6" />;
            default:
                return <Activity className="h-6 w-6" />;
        }
    };

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (days > 0) return `${days}d ${hours}u`;
        if (hours > 0) return `${hours}u ${minutes}m`;
        return `${minutes}m`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold flex items-center gap-3">
                        <Shield className="h-8 w-8 text-primary" />
                        Admin Dashboard
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Real-time system monitoring en operations
                    </p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                            {formatDistanceToNow(new Date(), {
                                addSuffix: true,
                                locale: nl,
                            })}
                        </span>
                    </div>
                    <div className="text-xs mt-1">Auto-refresh: 5-30s</div>
                </div>
            </div>

            {/* System Health Overview */}
            <LightweightErrorBoundary componentName="System Health">
                {healthLoading ? (
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-48" />
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <Skeleton key={i} className="h-24" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : healthData ? (
                    <Card className={`border-2 ${getStatusColor(healthData.status)}`}>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    {getStatusIcon(healthData.status)}
                                    System Status:{' '}
                                    <span className="capitalize">{healthData.status}</span>
                                </span>
                                <div className="flex items-center gap-4 text-sm font-normal">
                                    <span>v{healthData.version}</span>
                                    <span>↑ {formatUptime(healthData.uptime_seconds)}</span>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Database */}
                                <div className="p-4 rounded-lg bg-background/50 border">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Database className="h-5 w-5" />
                                        <h3 className="font-semibold">Database</h3>
                                    </div>
                                    <div
                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${healthData.components.database.status === 'healthy'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                            }`}
                                    >
                                        {healthData.components.database.status === 'healthy' ? (
                                            <CheckCircle className="h-3 w-3" />
                                        ) : (
                                            <AlertCircle className="h-3 w-3" />
                                        )}
                                        {healthData.components.database.status}
                                    </div>
                                    {metricsData && (
                                        <div className="mt-3 text-xs space-y-1">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Conns:</span>
                                                <span className="font-medium">
                                                    {metricsData.db_total_conns || 0}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Idle:</span>
                                                <span className="font-medium">
                                                    {metricsData.db_idle_conns || 0}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Redis */}
                                <div className="p-4 rounded-lg bg-background/50 border">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Activity className="h-5 w-5" />
                                        <h3 className="font-semibold">Cache</h3>
                                    </div>
                                    <div
                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${healthData.components.redis.status === 'healthy'
                                                ? 'bg-green-100 text-green-700'
                                                : healthData.components.redis.status === 'disabled'
                                                    ? 'bg-gray-100 text-gray-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                            }`}
                                    >
                                        {healthData.components.redis.status}
                                    </div>
                                </div>

                                {/* Scraper */}
                                <div className="p-4 rounded-lg bg-background/50 border">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Globe className="h-5 w-5" />
                                        <h3 className="font-semibold">Scraper</h3>
                                    </div>
                                    <div
                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${healthData.components.scraper.status === 'healthy'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                            }`}
                                    >
                                        {healthData.components.scraper.status}
                                    </div>
                                </div>

                                {/* AI Processor */}
                                {healthData.components.ai_processor && (
                                    <div className="p-4 rounded-lg bg-background/50 border">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Cpu className="h-5 w-5" />
                                            <h3 className="font-semibold">AI</h3>
                                        </div>
                                        <div
                                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${healthData.components.ai_processor.status === 'healthy'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            {healthData.components.ai_processor.status}
                                        </div>
                                        {processor && (
                                            <div className="mt-3 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Verwerkt:</span>
                                                    <span className="font-medium">
                                                        {processor.process_count.toLocaleString('nl-NL')}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : null}
            </LightweightErrorBoundary>

            {/* Quick Stats - Compact */}
            {stats && (
                <div className="grid gap-3 md:grid-cols-4 text-sm">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Artikelen</span>
                        </div>
                        <span className="font-bold">{stats.total_articles.toLocaleString('nl-NL')}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">24u</span>
                        </div>
                        <span className="font-bold text-green-600">
                            {stats.recent_articles_24h.toLocaleString('nl-NL')}
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Bronnen</span>
                        </div>
                        <span className="font-bold">{Object.keys(stats.articles_by_source).length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                                <Link href="/stats" className="hover:text-primary transition-colors">
                                    Meer stats →
                                </Link>
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Scraper Statistics */}
            <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Activity className="h-6 w-6" />
                    Scraper Operations
                </h2>
                <ScraperStatsCard />
            </div>

            {/* AI Analytics */}
            <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-6 w-6" />
                    AI Analytics
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <TrendingTopics hours={24} minArticles={3} maxTopics={8} />
                    </div>
                    <div className="lg:col-span-2">
                        <SentimentDashboard />
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Link
                            href="/health"
                            className="p-4 rounded-lg bg-background hover:bg-accent border transition-all group"
                        >
                            <Activity className="h-6 w-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                            <p className="font-semibold text-sm">Health Details</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Gedetailleerde component monitoring
                            </p>
                        </Link>
                        <Link
                            href="/stats"
                            className="p-4 rounded-lg bg-background hover:bg-accent border transition-all group"
                        >
                            <BarChart3 className="h-6 w-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                            <p className="font-semibold text-sm">Data Analytics</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Bronnen, categorieën en trends
                            </p>
                        </Link>
                        <Link
                            href="/ai"
                            className="p-4 rounded-lg bg-background hover:bg-accent border transition-all group"
                        >
                            <TrendingUp className="h-6 w-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                            <p className="font-semibold text-sm">AI Insights</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Volledige sentiment analyse
                            </p>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}