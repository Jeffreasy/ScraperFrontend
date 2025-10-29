'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { useEmailStats } from '@/lib/hooks/use-email';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import {
    cn,
    flexPatterns,
    spacing,
    transitions,
    bodyText,
    gap,
} from '@/lib/styles/theme';

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const statItemVariants = cva(
    [flexPatterns.start, gap.sm],
    {
        variants: {
            variant: {
                default: '',
                compact: 'flex-col items-center text-center',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const statIconBoxVariants = cva(
    ['p-2 rounded-lg', transitions.colors],
    {
        variants: {
            status: {
                total: 'bg-blue-50 dark:bg-blue-900/20',
                success: 'bg-green-50 dark:bg-green-900/20',
                error: 'bg-red-50 dark:bg-red-900/20',
                pending: 'bg-yellow-50 dark:bg-yellow-900/20',
            },
        },
    }
);

const statIconVariants = cva(
    ['h-4 w-4'],
    {
        variants: {
            status: {
                total: 'text-blue-600 dark:text-blue-400',
                success: 'text-green-600 dark:text-green-400',
                error: 'text-red-600 dark:text-red-400',
                pending: 'text-yellow-600 dark:text-yellow-400',
            },
        },
    }
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EmailStatsCard() {
    const { data, isLoading, error } = useEmailStats();

    if (isLoading) return <LoadingState />;
    if (error || !data?.data) return <ErrorState />;

    const stats = data.data;

    return (
        <Card>
            <CardHeader>
                <CardTitle className={cn(flexPatterns.start, gap.sm)}>
                    <Mail className="h-5 w-5" />
                    Email Processing
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className={cn('grid grid-cols-2', gap.md)}>
                    <StatItem
                        icon={Mail}
                        value={stats.total_emails}
                        label="Total Emails"
                        status="total"
                    />
                    <StatItem
                        icon={CheckCircle}
                        value={stats.processed_emails}
                        label="Processed"
                        status="success"
                    />
                    <StatItem
                        icon={XCircle}
                        value={stats.failed_emails}
                        label="Failed"
                        status="error"
                    />
                    <StatItem
                        icon={Clock}
                        value={stats.pending_emails}
                        label="Pending"
                        status="pending"
                    />
                </div>

                {/* Success Rate */}
                <div className={cn('mt-4 pt-4 border-t', flexPatterns.between)}>
                    <span className={cn(bodyText.small, 'text-muted-foreground')}>Success Rate</span>
                    <Badge variant={stats.processed_emails > 0 ? 'success' : 'secondary'}>
                        {stats.total_emails > 0
                            ? Math.round((stats.processed_emails / stats.total_emails) * 100)
                            : 0}
                        %
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}

// ============================================================================
// SUB COMPONENTS
// ============================================================================

interface StatItemProps {
    icon: React.ComponentType<{ className?: string }>;
    value: number;
    label: string;
    status: 'total' | 'success' | 'error' | 'pending';
}

function StatItem({ icon: Icon, value, label, status }: StatItemProps) {
    return (
        <div className={statItemVariants()}>
            <div className={statIconBoxVariants({ status })}>
                <Icon className={statIconVariants({ status })} />
            </div>
            <div>
                <p className="text-2xl font-bold">{value.toLocaleString('nl-NL')}</p>
                <p className={cn(bodyText.small, 'text-muted-foreground')}>{label}</p>
            </div>
        </div>
    );
}

function LoadingState() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className={cn(flexPatterns.start, gap.sm)}>
                    <Mail className="h-5 w-5" />
                    Email Processing
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className={cn('grid grid-cols-2', gap.md)}>
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-16" />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function ErrorState() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className={cn(flexPatterns.start, gap.sm)}>
                    <Mail className="h-5 w-5" />
                    Email Processing
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center text-muted-foreground py-8">
                    <XCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
                    <p className={bodyText.small}>Email processing data unavailable</p>
                </div>
            </CardContent>
        </Card>
    );
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
    statItemVariants,
    statIconBoxVariants,
    statIconVariants,
};