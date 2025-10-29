'use client';

import React, { useEffect, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { apiClient } from '@/lib/api/client';
import { AnalystRatingsResponse, PriceTarget } from '@/lib/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus, Target, Users } from 'lucide-react';
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

interface AnalystRatingsProps {
    symbol: string;
    limit?: number;
}

type ActionType = 'upgrade' | 'downgrade' | 'neutral';

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const actionBadgeVariants = cva(
    [bodyText.xs, 'font-medium px-2 py-0.5 rounded', transitions.colors],
    {
        variants: {
            action: {
                upgrade: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30',
                downgrade: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30',
                neutral: 'text-muted-foreground bg-muted',
            },
        },
        defaultVariants: {
            action: 'neutral',
        },
    }
);

const ratingCardVariants = cva(
    ['p-3 border rounded-lg', transitions.colors, 'hover:bg-accent/50'],
    {
        variants: {
            variant: {
                default: '',
                highlighted: 'border-primary/30 bg-accent/20',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const priceTargetBoxVariants = cva(
    ['text-center'],
    {
        variants: {
            type: {
                consensus: '',
                high: '',
                low: '',
                analysts: '',
            },
        },
    }
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getActionType(action: string): ActionType {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('upgrade') || (lowerAction.includes('initiated') && lowerAction.includes('buy'))) {
        return 'upgrade';
    }
    if (lowerAction.includes('downgrade')) {
        return 'downgrade';
    }
    return 'neutral';
}

function getActionIcon(action: string) {
    const type = getActionType(action);
    const icons = {
        upgrade: <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />,
        downgrade: <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />,
        neutral: <Minus className="w-4 h-4 text-muted-foreground" />,
    };
    return icons[type];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AnalystRatings({ symbol, limit = 10 }: AnalystRatingsProps) {
    const [ratings, setRatings] = useState<AnalystRatingsResponse | null>(null);
    const [target, setTarget] = useState<PriceTarget | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            setError(null);

            try {
                const [ratingsData, targetData] = await Promise.all([
                    apiClient.getAnalystRatings(symbol, limit),
                    apiClient.getPriceTarget(symbol),
                ]);

                if (ratingsData.success && ratingsData.data) {
                    setRatings(ratingsData.data);
                }
                if (targetData.success && targetData.data) {
                    setTarget(targetData.data);
                }
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to load analyst data'));
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [symbol, limit]);

    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error.message} />;

    const hasNoData = (!ratings || ratings.ratings.length === 0) && !target;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Analyst Ratings & Price Targets</CardTitle>
                <p className={cn(bodyText.small, 'text-muted-foreground')}>
                    Consensus en recent analyst actions voor {symbol}
                </p>
            </CardHeader>
            <CardContent className={spacing.lg}>
                {/* Price Target Consensus */}
                {target && target.targetConsensus && (
                    <PriceTargetConsensus target={target} />
                )}

                {/* Recent Ratings */}
                {ratings && ratings.ratings.length > 0 && (
                    <RecentActions ratings={ratings.ratings} />
                )}

                {/* Empty State */}
                {hasNoData && <EmptyState symbol={symbol} />}
            </CardContent>
        </Card>
    );
}

// ============================================================================
// SUB COMPONENTS
// ============================================================================

function LoadingState() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Analyst Ratings & Price Targets</CardTitle>
            </CardHeader>
            <CardContent className={spacing.md}>
                <Skeleton className="h-24 w-full" />
                <div className={spacing.sm}>
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function ErrorState({ error }: { error: string }) {
    return (
        <Card className="border-destructive/50">
            <CardHeader>
                <CardTitle>Analyst Ratings & Price Targets</CardTitle>
            </CardHeader>
            <CardContent>
                <p className={cn(bodyText.small, 'text-muted-foreground')}>{error}</p>
            </CardContent>
        </Card>
    );
}

function EmptyState({ symbol }: { symbol: string }) {
    return (
        <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className={cn(bodyText.small, 'text-muted-foreground')}>
                Geen analyst data beschikbaar voor {symbol}
            </p>
        </div>
    );
}

function PriceTargetConsensus({ target }: { target: PriceTarget }) {
    if (!target.targetConsensus) return null;

    return (
        <div className="p-4 border rounded-lg bg-accent/50">
            <h4 className={cn('font-semibold mb-3', flexPatterns.start, gap.sm)}>
                <Target className="h-4 w-4" />
                Price Target Consensus
            </h4>
            <div className={cn('grid grid-cols-2 md:grid-cols-4', gap.md, bodyText.small)}>
                <div className={priceTargetBoxVariants()}>
                    <div className="text-muted-foreground mb-1">Consensus</div>
                    <div className="text-lg font-bold">${target.targetConsensus.toFixed(2)}</div>
                </div>
                {target.targetHigh && (
                    <div className={priceTargetBoxVariants()}>
                        <div className="text-muted-foreground mb-1">High</div>
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                            ${target.targetHigh.toFixed(2)}
                        </div>
                    </div>
                )}
                {target.targetLow && (
                    <div className={priceTargetBoxVariants()}>
                        <div className="text-muted-foreground mb-1">Low</div>
                        <div className="text-lg font-bold text-red-600 dark:text-red-400">
                            ${target.targetLow.toFixed(2)}
                        </div>
                    </div>
                )}
                {target.numberOfAnalysts && (
                    <div className={priceTargetBoxVariants()}>
                        <div className="text-muted-foreground mb-1">Analysts</div>
                        <div className="text-lg font-bold">{target.numberOfAnalysts}</div>
                    </div>
                )}
            </div>
        </div>
    );
}

function RecentActions({ ratings }: { ratings: any[] }) {
    return (
        <div>
            <h4 className="font-semibold mb-3">Recent Actions</h4>
            <div className={spacing.sm}>
                {ratings.map((rating, index) => {
                    const actionType = getActionType(rating.action);

                    return (
                        <div key={index} className={ratingCardVariants()}>
                            <div className={cn('flex items-start justify-between', gap.sm)}>
                                <div className="flex-1 min-w-0">
                                    <div className={cn(flexPatterns.start, gap.sm, 'mb-1')}>
                                        {getActionIcon(rating.action)}
                                        <span className={actionBadgeVariants({ action: actionType })}>
                                            {rating.action}
                                        </span>
                                        <span className={cn(bodyText.xs, 'text-muted-foreground')}>
                                            {new Date(rating.date).toLocaleDateString('nl-NL')}
                                        </span>
                                    </div>
                                    <div className={cn(bodyText.small, 'font-medium')}>
                                        {rating.analystCompany || 'Unknown Firm'}
                                        {rating.analystName && ` - ${rating.analystName}`}
                                    </div>
                                    <div className={cn(bodyText.xs, 'text-muted-foreground mt-1')}>
                                        {rating.gradePrevious && (
                                            <>
                                                {rating.gradePrevious} → {rating.gradeNew}
                                            </>
                                        )}
                                        {!rating.gradePrevious && rating.gradeNew}
                                    </div>
                                </div>
                                {rating.priceTarget && (
                                    <div className="text-right flex-shrink-0">
                                        <div className={cn(bodyText.xs, 'text-muted-foreground')}>Target</div>
                                        <div className={cn(bodyText.small, 'font-bold')}>
                                            ${rating.priceTarget.toFixed(2)}
                                        </div>
                                        {rating.priceWhenPosted && (
                                            <div className={cn(bodyText.xs, 'text-muted-foreground')}>
                                                from ${rating.priceWhenPosted.toFixed(2)}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
    actionBadgeVariants,
    ratingCardVariants,
    priceTargetBoxVariants,
};
export type { AnalystRatingsProps, ActionType };