'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Card } from '@/components/ui/card';
import { ComponentHealth } from '@/lib/types/api';
import { CheckCircle, AlertCircle, AlertTriangle, XCircle } from 'lucide-react';
import {
    cn,
    flexPatterns,
    spacing,
    transitions,
    bodyText,
    gap,
    statusColors,
} from '@/lib/styles/theme';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ComponentHealthCardProps {
    name: string;
    health: ComponentHealth;
}

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const healthCardVariants = cva(
    ['p-4 border-2', transitions.colors],
    {
        variants: {
            status: {
                healthy: 'border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-950/30',
                degraded: 'border-yellow-500 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-950/30',
                unhealthy: 'border-red-500 dark:border-red-600 bg-red-50 dark:bg-red-950/30',
                disabled: 'border-border bg-muted',
            },
        },
    }
);

const statusTextVariants = cva(
    [bodyText.small, 'font-semibold'],
    {
        variants: {
            status: {
                healthy: 'text-green-700 dark:text-green-300',
                degraded: 'text-yellow-700 dark:text-yellow-300',
                unhealthy: 'text-red-700 dark:text-red-300',
                disabled: 'text-muted-foreground',
            },
        },
    }
);

// ============================================================================
// CONFIGURATION
// ============================================================================

const statusConfig = {
    healthy: {
        icon: CheckCircle,
        text: 'Gezond',
        iconClass: 'text-green-600 dark:text-green-400',
    },
    degraded: {
        icon: AlertTriangle,
        text: 'Verminderd',
        iconClass: 'text-yellow-600 dark:text-yellow-400',
    },
    unhealthy: {
        icon: XCircle,
        text: 'Ongezond',
        iconClass: 'text-red-600 dark:text-red-400',
    },
    disabled: {
        icon: AlertCircle,
        text: 'Uitgeschakeld',
        iconClass: 'text-muted-foreground',
    },
} as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ComponentHealthCard({ name, health }: ComponentHealthCardProps) {
    const status = health.status as keyof typeof statusConfig;
    const config = statusConfig[status] || statusConfig.disabled;
    const Icon = config.icon;

    return (
        <Card className={healthCardVariants({ status })}>
            <div className={cn(flexPatterns.between, 'items-start mb-3')}>
                <h4 className="font-semibold text-foreground">{name}</h4>
                <Icon className={cn('h-5 w-5', config.iconClass)} />
            </div>

            <div className={spacing.xs}>
                <div className={cn(flexPatterns.start, gap.sm)}>
                    <span className={cn(bodyText.small, 'font-medium text-foreground')}>Status:</span>
                    <span className={statusTextVariants({ status })}>{config.text}</span>
                </div>

                {health.message && (
                    <p className={cn(bodyText.xs, 'text-muted-foreground')}>{health.message}</p>
                )}

                {health.latency_ms !== undefined && (
                    <div className={cn(bodyText.xs, 'text-muted-foreground')}>
                        <span className="font-medium">Latentie:</span> {health.latency_ms.toFixed(1)}ms
                    </div>
                )}

                {health.details && Object.keys(health.details).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                        <div className={spacing.xs}>
                            {Object.entries(health.details).map(([key, value]) => (
                                <div key={key} className={cn(flexPatterns.between, bodyText.xs)}>
                                    <span className="text-muted-foreground capitalize">
                                        {key.replace(/_/g, ' ')}:
                                    </span>
                                    <span className="font-medium text-foreground">
                                        {typeof value === 'boolean' ? (value ? 'Ja' : 'Nee') : String(value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
    healthCardVariants,
    statusTextVariants,
    statusConfig,
};
export type { ComponentHealthCardProps };