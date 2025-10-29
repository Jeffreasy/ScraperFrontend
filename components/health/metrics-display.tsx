'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Card } from '@/components/ui/card';
import { MetricsResponse } from '@/lib/types/api';
import { Database, Cpu, Activity, TrendingUp } from 'lucide-react';
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

interface MetricsDisplayProps {
    metrics: MetricsResponse;
}

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const metricCardVariants = cva(
    ['p-4', transitions.colors],
    {
        variants: {
            variant: {
                default: '',
                highlighted: 'bg-accent/20',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const metricIconBoxVariants = cva(
    ['p-2 rounded-lg'],
    {
        variants: {
            type: {
                database: 'bg-blue-100 dark:bg-blue-900/30',
                ai: 'bg-purple-100 dark:bg-purple-900/30',
                scraper: 'bg-green-100 dark:bg-green-900/30',
                system: 'bg-indigo-100 dark:bg-indigo-900/30',
            },
        },
    }
);

const metricIconVariants = cva(
    ['h-5 w-5'],
    {
        variants: {
            type: {
                database: 'text-blue-600 dark:text-blue-400',
                ai: 'text-purple-600 dark:text-purple-400',
                scraper: 'text-green-600 dark:text-green-400',
                system: 'text-indigo-600 dark:text-indigo-400',
            },
        },
    }
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatDuration(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}u`;
    if (hours > 0) return `${hours}u ${minutes}m`;
    return `${minutes}m`;
}

function formatTimestamp(timestamp?: number): string {
    if (!timestamp) return 'Nooit';
    return new Date(timestamp * 1000).toLocaleString('nl-NL', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MetricsDisplay({ metrics }: MetricsDisplayProps) {
    return (
        <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3')}>
            {/* Database Metrics */}
            <DatabaseMetrics metrics={metrics} />

            {/* AI Processor Metrics */}
            {(metrics.ai_is_running !== undefined || metrics.ai_process_count !== undefined) && (
                <AIProcessorMetrics metrics={metrics} />
            )}

            {/* Scraper Metrics */}
            {metrics.scraper && <ScraperMetrics scraper={metrics.scraper} />}

            {/* System Uptime */}
            <SystemMetrics metrics={metrics} />
        </div>
    );
}

// ============================================================================
// SUB COMPONENTS
// ============================================================================

function DatabaseMetrics({ metrics }: { metrics: MetricsResponse }) {
    return (
        <Card className={metricCardVariants()}>
            <div className={cn(flexPatterns.start, gap.sm, 'mb-3')}>
                <div className={metricIconBoxVariants({ type: 'database' })}>
                    <Database className={metricIconVariants({ type: 'database' })} />
                </div>
                <h4 className="font-semibold text-foreground">Database</h4>
            </div>
            <div className={cn(spacing.xs, bodyText.small)}>
                {metrics.db_total_conns !== undefined && (
                    <MetricRow label="Totale connecties" value={metrics.db_total_conns} />
                )}
                {metrics.db_idle_conns !== undefined && (
                    <MetricRow label="Idle" value={metrics.db_idle_conns} />
                )}
                {metrics.db_acquired_conns !== undefined && (
                    <MetricRow label="In gebruik" value={metrics.db_acquired_conns} />
                )}
                {metrics.db_max_conns !== undefined && (
                    <MetricRow label="Max connecties" value={metrics.db_max_conns} />
                )}
                {metrics.db_acquire_duration_ms !== undefined && (
                    <MetricRow label="Acquire tijd" value={`${metrics.db_acquire_duration_ms.toFixed(1)}ms`} />
                )}
            </div>
        </Card>
    );
}

function AIProcessorMetrics({ metrics }: { metrics: MetricsResponse }) {
    return (
        <Card className={metricCardVariants()}>
            <div className={cn(flexPatterns.start, gap.sm, 'mb-3')}>
                <div className={metricIconBoxVariants({ type: 'ai' })}>
                    <Cpu className={metricIconVariants({ type: 'ai' })} />
                </div>
                <h4 className="font-semibold text-foreground">AI Processor</h4>
            </div>
            <div className={cn(spacing.xs, bodyText.small)}>
                {metrics.ai_is_running !== undefined && (
                    <div className={flexPatterns.between}>
                        <span className="text-muted-foreground">Status:</span>
                        <span className={cn('font-medium', metrics.ai_is_running ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground')}>
                            {metrics.ai_is_running ? 'Actief' : 'Inactief'}
                        </span>
                    </div>
                )}
                {metrics.ai_process_count !== undefined && (
                    <MetricRow label="Verwerkte artikelen" value={metrics.ai_process_count} />
                )}
                {metrics.ai_last_run !== undefined && (
                    <MetricRow label="Laatste run" value={formatTimestamp(metrics.ai_last_run)} />
                )}
                {metrics.ai_current_interval_seconds !== undefined && (
                    <MetricRow label="Interval" value={formatDuration(metrics.ai_current_interval_seconds)} />
                )}
            </div>
        </Card>
    );
}

function ScraperMetrics({ scraper }: { scraper: any }) {
    const successRate = scraper.total_scrapes > 0
        ? ((scraper.successful_scrapes / scraper.total_scrapes) * 100).toFixed(1)
        : '0';

    return (
        <Card className={metricCardVariants()}>
            <div className={cn(flexPatterns.start, gap.sm, 'mb-3')}>
                <div className={metricIconBoxVariants({ type: 'scraper' })}>
                    <TrendingUp className={metricIconVariants({ type: 'scraper' })} />
                </div>
                <h4 className="font-semibold text-foreground">Scraper</h4>
            </div>
            <div className={cn(spacing.xs, bodyText.small)}>
                <MetricRow label="Totaal scrapes" value={scraper.total_scrapes} />
                <div className={flexPatterns.between}>
                    <span className="text-muted-foreground">Succesvol:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                        {scraper.successful_scrapes}
                    </span>
                </div>
                <div className={flexPatterns.between}>
                    <span className="text-muted-foreground">Mislukt:</span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                        {scraper.failed_scrapes}
                    </span>
                </div>
                <MetricRow label="Successpercentage" value={`${successRate}%`} />
            </div>
        </Card>
    );
}

function SystemMetrics({ metrics }: { metrics: MetricsResponse }) {
    return (
        <Card className={metricCardVariants()}>
            <div className={cn(flexPatterns.start, gap.sm, 'mb-3')}>
                <div className={metricIconBoxVariants({ type: 'system' })}>
                    <Activity className={metricIconVariants({ type: 'system' })} />
                </div>
                <h4 className="font-semibold text-foreground">Systeem</h4>
            </div>
            <div className={cn(spacing.xs, bodyText.small)}>
                <MetricRow label="Uptime" value={formatDuration(metrics.uptime)} />
                <MetricRow label="Timestamp" value={formatTimestamp(metrics.timestamp)} />
            </div>
        </Card>
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
    metricCardVariants,
    metricIconBoxVariants,
    metricIconVariants,
};
export type { MetricsDisplayProps };