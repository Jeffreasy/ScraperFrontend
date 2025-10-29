'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useHealth, useMetrics } from '@/lib/hooks/use-health';
import { useScraperStats } from '@/lib/hooks/use-scraper-stats';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ComponentHealthCard } from './component-health-card';
import { MetricsDisplay } from './metrics-display';
import { BrowserPoolCard } from './browser-pool-card';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
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

const overallStatusVariants = cva(
    ['p-6 border-2', transitions.colors],
    {
        variants: {
            status: {
                healthy: 'border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400',
                degraded: 'border-yellow-500 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400',
                unhealthy: 'border-red-500 dark:border-red-600 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400',
            },
        },
    }
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getStatusIcon(status: string) {
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
}

function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}u ${minutes}m`;
    if (hours > 0) return `${hours}u ${minutes}m`;
    return `${minutes}m`;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function HealthDashboard() {
    const { data: health, isLoading, isError } = useHealth();
    const { data: metrics } = useMetrics();
    const { data: scraperStats } = useScraperStats();

    if (isLoading) return <LoadingState />;
    if (isError || !health?.data) return <ErrorState />;

    const healthData = health.data;
    const metricsData = metrics?.data;

    return (
        <div className={spacing.lg}>
            {/* Overall Status */}
            <OverallStatusCard healthData={healthData} />

            {/* Component Status */}
            <SectionHeader title="Component Status" />
            <ComponentsGrid healthData={healthData} />

            {/* Browser Pool Stats */}
            {scraperStats?.data?.browser_pool && (
                <>
                    <SectionHeader title="Browser Scraping" />
                    <BrowserScrapingGrid scraperStats={scraperStats.data} />
                </>
            )}

            {/* Metrics */}
            {metricsData && (
                <>
                    <SectionHeader title="System Metrics" />
                    <MetricsDisplay metrics={metricsData} />
                </>
            )}
        </div>
    );
}

// ============================================================================
// SUB COMPONENTS
// ============================================================================

function LoadingState() {
    return (
        <div className={cn(gridLayouts.threeColumn, gap.lg)}>
            {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6">
                    <div className={cn('animate-pulse', spacing.sm)}>
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </Card>
            ))}
        </div>
    );
}

function ErrorState() {
    return (
        <Card className="p-6 bg-destructive/10 border-destructive/50">
            <div className={cn(flexPatterns.start, gap.sm, 'text-destructive')}>
                <AlertCircle className="h-5 w-5" />
                <div>
                    <h3 className="font-semibold">Kan health status niet ophalen</h3>
                    <p className={cn(bodyText.small, 'text-destructive/90')}>
                        Er is een probleem met de verbinding naar de API
                    </p>
                </div>
            </div>
        </Card>
    );
}

function SectionHeader({ title }: { title: string }) {
    return <h3 className="text-lg font-semibold mb-4">{title}</h3>;
}

function OverallStatusCard({ healthData }: { healthData: any }) {
    const status = healthData.status as 'healthy' | 'degraded' | 'unhealthy';

    return (
        <Card className={overallStatusVariants({ status })}>
            <div className={flexPatterns.between}>
                <div className={cn(flexPatterns.start, gap.sm)}>
                    {getStatusIcon(healthData.status)}
                    <div>
                        <h2 className="text-2xl font-bold capitalize">{healthData.status}</h2>
                        <p className={cn(bodyText.small, 'opacity-80')}>API Status</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className={cn(bodyText.small, 'opacity-80')}>Uptime</div>
                    <div className="text-xl font-semibold">{formatUptime(healthData.uptime_seconds)}</div>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-current/20">
                <div className={cn('grid grid-cols-2', gap.md, bodyText.small)}>
                    <div>
                        <span className="opacity-80">Version:</span>{' '}
                        <span className="font-medium">{healthData.version}</span>
                    </div>
                    <div>
                        <span className="opacity-80">Laatst gecontroleerd:</span>{' '}
                        <span className="font-medium">
                            {formatDistanceToNow(new Date(healthData.timestamp), {
                                addSuffix: true,
                                locale: nl,
                            })}
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
}

function ComponentsGrid({ healthData }: { healthData: any }) {
    return (
        <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4')}>
            <ComponentHealthCard name="Database" health={healthData.components.database} />
            <ComponentHealthCard name="Redis" health={healthData.components.redis} />
            <ComponentHealthCard name="Scraper" health={healthData.components.scraper} />
            {healthData.components.ai_processor && (
                <ComponentHealthCard name="AI Processor" health={healthData.components.ai_processor} />
            )}
        </div>
    );
}

function BrowserScrapingGrid({ scraperStats }: { scraperStats: any }) {
    return (
        <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3')}>
            <BrowserPoolCard stats={scraperStats.browser_pool} />

            {/* Content Extraction Stats */}
            {scraperStats.content_extraction && (
                <Card className="p-6">
                    <h4 className="font-semibold mb-4">Content Extractie</h4>
                    <div className={cn(spacing.sm, bodyText.small)}>
                        <MetricRow label="Totaal artikelen" value={scraperStats.content_extraction.total} />
                        <div className={flexPatterns.between}>
                            <span className="text-muted-foreground">Geëxtraheerd:</span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                                {scraperStats.content_extraction.extracted}
                            </span>
                        </div>
                        <div className={flexPatterns.between}>
                            <span className="text-muted-foreground">In afwachting:</span>
                            <span className="font-medium text-yellow-600 dark:text-yellow-400">
                                {scraperStats.content_extraction.pending}
                            </span>
                        </div>
                        <div className="pt-2 border-t border-border">
                            <MetricRow
                                label="Success rate"
                                value={`${scraperStats.content_extraction.total > 0
                                        ? Math.round(
                                            (scraperStats.content_extraction.extracted /
                                                scraperStats.content_extraction.total) *
                                            100
                                        )
                                        : 0
                                    }%`}
                            />
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}

function MetricRow({ label, value }: { label: string; value: string | number }) {
    return (
        <div className={flexPatterns.between}>
            <span className="text-muted-foreground">{label}:</span>
            <span className="font-medium text-foreground">{value}</span>
        </div>
    );
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
    overallStatusVariants,
};