'use client';

import { useHealth, useMetrics } from '@/lib/hooks/use-health';
import { useScraperStats } from '@/lib/hooks/use-scraper-stats';
import { Card } from '@/components/ui/card';
import { ComponentHealthCard } from './component-health-card';
import { MetricsDisplay } from './metrics-display';
import { BrowserPoolCard } from './browser-pool-card';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

export function HealthDashboard() {
    const { data: health, isLoading, isError } = useHealth();
    const { data: metrics } = useMetrics();
    const { data: scraperStats } = useScraperStats();

    if (isLoading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="p-6">
                        <div className="animate-pulse space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-8 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    if (isError || !health?.data) {
        return (
            <Card className="p-6 bg-red-50 border-red-200">
                <div className="flex items-center gap-3 text-red-800">
                    <AlertCircle className="h-5 w-5" />
                    <div>
                        <h3 className="font-semibold">Kan health status niet ophalen</h3>
                        <p className="text-sm text-red-600">Er is een probleem met de verbinding naar de API</p>
                    </div>
                </div>
            </Card>
        );
    }

    const healthData = health.data;
    const metricsData = metrics?.data;

    const getStatusColor = (status: string) => {
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy':
                return <CheckCircle className="h-6 w-6" />;
            case 'degraded':
                return <AlertTriangle className="h-6 w-6" />;
            case 'unhealthy':
                return <AlertCircle className="h-6 w-6" />;
            default:
                return <AlertCircle className="h-6 w-6" />;
        }
    };

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (days > 0) {
            return `${days}d ${hours}u ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}u ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    };

    return (
        <div className="space-y-6">
            {/* Overall Status */}
            <Card className={`p-6 ${getStatusColor(healthData.status)}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {getStatusIcon(healthData.status)}
                        <div>
                            <h2 className="text-2xl font-bold capitalize">{healthData.status}</h2>
                            <p className="text-sm opacity-80">API Status</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm opacity-80">Uptime</div>
                        <div className="text-xl font-semibold">{formatUptime(healthData.uptime_seconds)}</div>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-current/20">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="opacity-80">Version:</span>{' '}
                            <span className="font-medium">{healthData.version}</span>
                        </div>
                        <div>
                            <span className="opacity-80">Laatst gecontroleerd:</span>{' '}
                            <span className="font-medium">
                                {formatDistanceToNow(new Date(healthData.timestamp), {
                                    addSuffix: true,
                                    locale: nl
                                })}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Component Status */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Component Status</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <ComponentHealthCard
                        name="Database"
                        health={healthData.components.database}
                    />
                    <ComponentHealthCard
                        name="Redis"
                        health={healthData.components.redis}
                    />
                    <ComponentHealthCard
                        name="Scraper"
                        health={healthData.components.scraper}
                    />
                    {healthData.components.ai_processor && (
                        <ComponentHealthCard
                            name="AI Processor"
                            health={healthData.components.ai_processor}
                        />
                    )}
                </div>
            </div>

            {/* Browser Pool Stats */}
            {scraperStats?.data?.browser_pool && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">Browser Scraping</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <BrowserPoolCard stats={scraperStats.data.browser_pool} />

                        {/* Content Extraction Stats */}
                        {scraperStats.data.content_extraction && (
                            <Card className="p-6">
                                <h4 className="font-semibold mb-4">Content Extractie</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Totaal artikelen:</span>
                                        <span className="text-sm font-medium">
                                            {scraperStats.data.content_extraction.total}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Geëxtraheerd:</span>
                                        <span className="text-sm font-medium text-green-600">
                                            {scraperStats.data.content_extraction.extracted}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">In afwachting:</span>
                                        <span className="text-sm font-medium text-yellow-600">
                                            {scraperStats.data.content_extraction.pending}
                                        </span>
                                    </div>
                                    <div className="pt-2 border-t">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Success rate:</span>
                                            <span className="text-sm font-semibold">
                                                {scraperStats.data.content_extraction.total > 0
                                                    ? Math.round(
                                                        (scraperStats.data.content_extraction.extracted /
                                                            scraperStats.data.content_extraction.total) *
                                                        100
                                                    )
                                                    : 0}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            )}

            {/* Metrics */}
            {metricsData && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">System Metrics</h3>
                    <MetricsDisplay metrics={metricsData} />
                </div>
            )}
        </div>
    );
}