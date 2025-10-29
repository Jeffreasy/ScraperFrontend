'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScraperStatsCard } from '@/components/scraper/scraper-stats-card';
import { SentimentDashboard } from '@/components/ai/sentiment-dashboard';
import { TrendingTopics } from '@/components/ai/trending-topics';
import { EmailStatsCard, EmailFetchControls } from '@/components/email';
import { useHealth, useMetrics } from '@/lib/hooks/use-health';
import { useQuery } from '@tanstack/react-query';
import { advancedApiClient } from '@/lib/api/advanced-client';
import { STALE_TIMES } from '@/components/providers';
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
    Mail,
    Shield,
    TrendingUp,
} from 'lucide-react';
import { LightweightErrorBoundary } from '@/components/error-boundary';
import {
    cn,
    flexPatterns,
    spacing,
    transitions,
    bodyText,
    gap,
    responsiveHeadings,
    gridLayouts,
    getStatusColor,
    statusColors,
} from '@/lib/styles/theme';

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const statusBadgeVariants = cva(
    ['inline-flex items-center gap-1 px-2 py-1 rounded', bodyText.xs, 'font-medium'],
    {
        variants: {
            status: {
                healthy: 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300',
                degraded: 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300',
                unhealthy: 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300',
                disabled: 'bg-muted text-muted-foreground',
            },
        },
        defaultVariants: {
            status: 'healthy',
        },
    }
);

const componentCardVariants = cva(
    ['p-4 rounded-lg border', transitions.colors],
    {
        variants: {
            variant: {
                default: 'bg-background/50',
                elevated: 'bg-card shadow-sm',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const statCardVariants = cva(
    ['p-3 rounded-lg', transitions.colors],
    {
        variants: {
            variant: {
                default: 'bg-muted/50',
                highlighted: 'bg-primary/5 border border-primary/20',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const quickLinkVariants = cva(
    [
        'p-4 rounded-lg border group',
        transitions.base,
        'hover:shadow-md',
    ],
    {
        variants: {
            variant: {
                default: 'bg-background hover:bg-accent',
                gradient: 'bg-gradient-to-br from-background to-accent/10',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}u`;
    if (hours > 0) return `${hours}u ${minutes}m`;
    return `${minutes}m`;
}

function getStatusIcon(status?: string) {
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
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

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

    return (
        <div className={spacing.lg}>
            {/* Page Header */}
            <PageHeader />

            {/* System Health Overview */}
            <LightweightErrorBoundary componentName="System Health">
                {healthLoading ? (
                    <HealthSkeleton />
                ) : healthData ? (
                    <SystemHealthCard
                        healthData={healthData}
                        metricsData={metricsData}
                        processor={processor}
                    />
                ) : null}
            </LightweightErrorBoundary>

            {/* Quick Stats */}
            {stats && <QuickStats stats={stats} />}

            {/* Scraper Operations */}
            <SectionHeader icon={Activity} title="Scraper Operations" />
            <div className={cn(gridLayouts.twoColumn, gap.lg)}>
                <ScraperStatsCard />
                <EmailStatsCard />
            </div>

            {/* Email Management */}
            <SectionHeader icon={Mail} title="Email Management" />
            <EmailFetchControls />

            {/* AI Analytics */}
            <SectionHeader icon={TrendingUp} title="AI Analytics" />
            <div className={cn('grid grid-cols-1 lg:grid-cols-3', gap.lg)}>
                <div className="lg:col-span-1">
                    <TrendingTopics hours={24} minArticles={3} maxTopics={8} />
                </div>
                <div className="lg:col-span-2">
                    <SentimentDashboard />
                </div>
            </div>

            {/* Quick Links */}
            <QuickLinksCard />
        </div>
    );
}

// ============================================================================
// SUB COMPONENTS
// ============================================================================

function PageHeader() {
    return (
        <div className={flexPatterns.between}>
            <div className={spacing.xs}>
                <h1 className={cn(responsiveHeadings.h1, flexPatterns.start, gap.sm)}>
                    <Shield className="h-8 w-8 text-primary" />
                    Admin Dashboard
                </h1>
                <p className="text-lg text-muted-foreground">Real-time system monitoring en operations</p>
            </div>
            <div className={cn('text-right', bodyText.small, 'text-muted-foreground')}>
                <div className={cn(flexPatterns.start, gap.sm)}>
                    <Clock className="h-4 w-4" />
                    <span>
                        {formatDistanceToNow(new Date(), {
                            addSuffix: true,
                            locale: nl,
                        })}
                    </span>
                </div>
                <div className={cn(bodyText.xs, 'mt-1')}>Auto-refresh: 5-30s</div>
            </div>
        </div>
    );
}

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
    return (
        <h2 className={cn('text-2xl font-bold mb-4', flexPatterns.start, gap.sm)}>
            <Icon className="h-6 w-6 text-primary" />
            {title}
        </h2>
    );
}

function HealthSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
                <div className={cn('grid grid-cols-1 md:grid-cols-4', gap.md)}>
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-24" />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

interface SystemHealthCardProps {
    healthData: any;
    metricsData: any;
    processor: any;
}

function SystemHealthCard({ healthData, metricsData, processor }: SystemHealthCardProps) {
    const status = healthData.status as 'healthy' | 'degraded' | 'unhealthy';
    const statusColorClass = statusColors[status === 'unhealthy' ? 'error' : status === 'degraded' ? 'warning' : 'healthy'].full;

    return (
        <Card className={cn('border-2', statusColorClass.replace('bg-', 'border-').replace('text-', ''))}>
            <CardHeader>
                <CardTitle className={flexPatterns.between}>
                    <span className={cn(flexPatterns.start, gap.sm)}>
                        {getStatusIcon(healthData.status)}
                        System Status: <span className="capitalize">{healthData.status}</span>
                    </span>
                    <div className={cn(flexPatterns.start, gap.md, bodyText.small, 'font-normal')}>
                        <Badge variant="outline">v{healthData.version}</Badge>
                        <span>↑ {formatUptime(healthData.uptime_seconds)}</span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className={cn('grid grid-cols-1 md:grid-cols-4', gap.md)}>
                    <ComponentStatus
                        icon={Database}
                        title="Database"
                        status={healthData.components.database.status}
                        metrics={metricsData ? {
                            'Conns': metricsData.db_total_conns || 0,
                            'Idle': metricsData.db_idle_conns || 0,
                        } : undefined}
                    />
                    <ComponentStatus
                        icon={Activity}
                        title="Cache"
                        status={healthData.components.redis.status}
                    />
                    <ComponentStatus
                        icon={Globe}
                        title="Scraper"
                        status={healthData.components.scraper.status}
                    />
                    {healthData.components.ai_processor && (
                        <ComponentStatus
                            icon={Cpu}
                            title="AI"
                            status={healthData.components.ai_processor.status}
                            metrics={processor ? {
                                'Verwerkt': processor.process_count.toLocaleString('nl-NL'),
                            } : undefined}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

interface ComponentStatusProps {
    icon: any;
    title: string;
    status: string;
    metrics?: Record<string, string | number>;
}

function ComponentStatus({ icon: Icon, title, status, metrics }: ComponentStatusProps) {
    const statusVariant = status === 'healthy' ? 'healthy' : status === 'disabled' ? 'disabled' : status === 'degraded' ? 'degraded' : 'unhealthy';

    return (
        <div className={componentCardVariants()}>
            <div className={cn(flexPatterns.start, gap.sm, 'mb-2')}>
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">{title}</h3>
            </div>
            <div className={statusBadgeVariants({ status: statusVariant as any })}>
                {status === 'healthy' && <CheckCircle className="h-3 w-3" />}
                {status === 'unhealthy' && <AlertCircle className="h-3 w-3" />}
                {status}
            </div>
            {metrics && (
                <div className={cn('mt-3', bodyText.xs, spacing.xs)}>
                    {Object.entries(metrics).map(([key, value]) => (
                        <div key={key} className={flexPatterns.between}>
                            <span className="text-muted-foreground">{key}:</span>
                            <span className="font-medium">{value}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function QuickStats({ stats }: { stats: any }) {
    const statItems = [
        { icon: FileText, label: 'Artikelen', value: stats.total_articles, color: '' },
        { icon: Clock, label: '24u', value: stats.recent_articles_24h, color: 'text-green-600 dark:text-green-400' },
        { icon: Globe, label: 'Bronnen', value: Object.keys(stats.articles_by_source).length, color: '' },
    ];

    return (
        <div className={cn('grid gap-3 md:grid-cols-4', bodyText.small)}>
            {statItems.map((item) => {
                const Icon = item.icon;
                return (
                    <div key={item.label} className={cn(statCardVariants(), flexPatterns.between)}>
                        <div className={cn(flexPatterns.start, gap.sm)}>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{item.label}</span>
                        </div>
                        <span className={cn('font-bold', item.color || '')}>
                            {typeof item.value === 'number' ? item.value.toLocaleString('nl-NL') : item.value}
                        </span>
                    </div>
                );
            })}
            <div className={cn(statCardVariants(), flexPatterns.between)}>
                <div className={cn(flexPatterns.start, gap.sm)}>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                        <Link
                            href="/stats"
                            className={cn('hover:text-primary', transitions.colors)}
                        >
                            Meer stats →
                        </Link>
                    </span>
                </div>
            </div>
        </div>
    );
}

function QuickLinksCard() {
    const links = [
        {
            href: '/health',
            icon: Activity,
            title: 'Health Details',
            description: 'Gedetailleerde component monitoring',
        },
        {
            href: '/stats',
            icon: BarChart3,
            title: 'Data Analytics',
            description: 'Bronnen, categorieën en trends',
        },
        {
            href: '/ai',
            icon: TrendingUp,
            title: 'AI Insights',
            description: 'Volledige sentiment analyse',
        },
    ];

    return (
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-6">
                <div className={cn('grid grid-cols-1 sm:grid-cols-3', gap.sm)}>
                    {links.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link key={link.href} href={link.href} className={quickLinkVariants()}>
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
    statusBadgeVariants,
    componentCardVariants,
    statCardVariants,
    quickLinkVariants,
};