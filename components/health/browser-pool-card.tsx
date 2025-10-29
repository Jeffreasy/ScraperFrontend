'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Card } from '@/components/ui/card';
import { Globe, Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
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

interface BrowserPoolStats {
    enabled: boolean;
    pool_size: number;
    available: number;
    in_use: number;
    closed: boolean;
}

interface BrowserPoolCardProps {
    stats?: BrowserPoolStats;
}

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const utilizationBarVariants = cva(
    ['h-full rounded-full', transitions.base],
    {
        variants: {
            utilization: {
                low: 'bg-green-600 dark:bg-green-500',
                medium: 'bg-yellow-600 dark:bg-yellow-500',
                high: 'bg-red-600 dark:bg-red-500',
            },
        },
    }
);

const warningBannerVariants = cva(
    ['mt-2 p-2 rounded border', bodyText.xs],
    {
        variants: {
            severity: {
                warning: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
                error: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
            },
        },
    }
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getUtilizationLevel(percent: number): 'low' | 'medium' | 'high' {
    if (percent < 50) return 'low';
    if (percent < 80) return 'medium';
    return 'high';
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function BrowserPoolCard({ stats }: BrowserPoolCardProps) {
    if (!stats || !stats.enabled) {
        return <DisabledState />;
    }

    const utilizationPercent = stats.pool_size > 0 ? Math.round((stats.in_use / stats.pool_size) * 100) : 0;
    const utilizationLevel = getUtilizationLevel(utilizationPercent);

    return (
        <Card className="p-6">
            <div className={cn(flexPatterns.start, gap.sm, 'mb-4')}>
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/30">
                    <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h3 className="font-semibold">Browser Pool</h3>
                    <p className={cn(bodyText.xs, 'text-muted-foreground')}>Headless browser scraping</p>
                </div>
            </div>

            <div className={spacing.sm}>
                {/* Status */}
                <div className={flexPatterns.between}>
                    <span className={cn(bodyText.small, 'text-muted-foreground')}>Status:</span>
                    <span className={cn('inline-flex items-center', gap.xs, bodyText.small, 'font-medium')}>
                        {stats.closed ? (
                            <>
                                <XCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
                                <span className="text-red-600 dark:text-red-400">Gesloten</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                                <span className="text-green-600 dark:text-green-400">Actief</span>
                            </>
                        )}
                    </span>
                </div>

                {/* Pool Size */}
                <MetricRow label="Pool grootte:" value={`${stats.pool_size} browsers`} />
                <MetricRow label="Beschikbaar:" value={stats.available} />

                {/* In Use */}
                <div className={flexPatterns.between}>
                    <span className={cn(bodyText.small, 'text-muted-foreground')}>In gebruik:</span>
                    <span className={cn(bodyText.small, 'font-medium', flexPatterns.start, gap.xs)}>
                        {stats.in_use}
                        {stats.in_use > 0 && <Loader2 className="h-3 w-3 animate-spin text-blue-600" />}
                    </span>
                </div>

                {/* Utilization Bar */}
                <div className="pt-2">
                    <div className={cn(flexPatterns.between, 'mb-1')}>
                        <span className={cn(bodyText.xs, 'text-muted-foreground')}>Gebruik:</span>
                        <span className={cn(bodyText.xs, 'font-medium')}>{utilizationPercent}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                            className={utilizationBarVariants({ utilization: utilizationLevel })}
                            style={{ width: `${utilizationPercent}%` }}
                        />
                    </div>
                </div>

                {/* High Utilization Warning */}
                {utilizationPercent >= 80 && !stats.closed && (
                    <div className={warningBannerVariants({ severity: 'warning' })}>
                        <p className={cn('flex items-center', gap.xs)}>
                            <AlertTriangle className="h-3 w-3" />
                            Hoog gebruik - overweeg pool size te verhogen
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
}

// ============================================================================
// SUB COMPONENTS
// ============================================================================

function DisabledState() {
    return (
        <Card className="p-6 bg-muted/50">
            <div className={cn(flexPatterns.start, gap.sm, 'mb-4')}>
                <div className="p-2 rounded-lg bg-muted">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                    <h3 className="font-semibold">Browser Pool</h3>
                    <p className={cn(bodyText.xs, 'text-muted-foreground')}>Headless browser scraping</p>
                </div>
            </div>
            <div className={cn(bodyText.small, 'text-muted-foreground')}>
                <span className={cn('inline-flex items-center', gap.xs)}>
                    <XCircle className="h-3 w-3" />
                    Uitgeschakeld
                </span>
            </div>
        </Card>
    );
}

function MetricRow({ label, value }: { label: string; value: string | number }) {
    return (
        <div className={flexPatterns.between}>
            <span className={cn(bodyText.small, 'text-muted-foreground')}>{label}</span>
            <span className={cn(bodyText.small, 'font-medium')}>{value}</span>
        </div>
    );
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
    utilizationBarVariants,
    warningBannerVariants,
};
export type { BrowserPoolCardProps, BrowserPoolStats };