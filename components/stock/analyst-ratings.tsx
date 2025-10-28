'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { AnalystRatingsResponse, PriceTarget } from '@/lib/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AnalystRatingsProps {
    symbol: string;
    limit?: number;
}

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
                    apiClient.getPriceTarget(symbol)
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

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Analyst Ratings & Price Targets</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle>Analyst Ratings & Price Targets</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{error.message}</p>
                </CardContent>
            </Card>
        );
    }

    const getActionIcon = (action: string) => {
        const lowerAction = action.toLowerCase();
        if (lowerAction.includes('upgrade') || lowerAction.includes('initiated') && lowerAction.includes('buy')) {
            return <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />;
        }
        if (lowerAction.includes('downgrade')) {
            return <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />;
        }
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    };

    const getActionColor = (action: string) => {
        const lowerAction = action.toLowerCase();
        if (lowerAction.includes('upgrade') || lowerAction.includes('initiated') && lowerAction.includes('buy')) {
            return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30';
        }
        if (lowerAction.includes('downgrade')) {
            return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30';
        }
        return 'text-muted-foreground bg-muted';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Analyst Ratings & Price Targets</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Consensus en recent analyst actions voor {symbol}
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Price Target Consensus */}
                {target && target.targetConsensus && (
                    <div className="p-4 border rounded-lg bg-accent/50">
                        <h4 className="font-semibold mb-3">Price Target Consensus</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <div className="text-muted-foreground mb-1">Consensus</div>
                                <div className="text-lg font-bold">${target.targetConsensus.toFixed(2)}</div>
                            </div>
                            {target.targetHigh && (
                                <div>
                                    <div className="text-muted-foreground mb-1">High</div>
                                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                        ${target.targetHigh.toFixed(2)}
                                    </div>
                                </div>
                            )}
                            {target.targetLow && (
                                <div>
                                    <div className="text-muted-foreground mb-1">Low</div>
                                    <div className="text-lg font-bold text-red-600 dark:text-red-400">
                                        ${target.targetLow.toFixed(2)}
                                    </div>
                                </div>
                            )}
                            {target.numberOfAnalysts && (
                                <div>
                                    <div className="text-muted-foreground mb-1">Analysts</div>
                                    <div className="text-lg font-bold">{target.numberOfAnalysts}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Recent Ratings */}
                {ratings && ratings.ratings.length > 0 && (
                    <div>
                        <h4 className="font-semibold mb-3">Recent Actions</h4>
                        <div className="space-y-3">
                            {ratings.ratings.map((rating, index) => (
                                <div
                                    key={index}
                                    className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {getActionIcon(rating.action)}
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded ${getActionColor(rating.action)}`}>
                                                    {rating.action}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(rating.date).toLocaleDateString('nl-NL')}
                                                </span>
                                            </div>
                                            <div className="text-sm font-medium">
                                                {rating.analystCompany || 'Unknown Firm'}
                                                {rating.analystName && ` - ${rating.analystName}`}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
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
                                                <div className="text-xs text-muted-foreground">Target</div>
                                                <div className="text-sm font-bold">
                                                    ${rating.priceTarget.toFixed(2)}
                                                </div>
                                                {rating.priceWhenPosted && (
                                                    <div className="text-xs text-muted-foreground">
                                                        from ${rating.priceWhenPosted.toFixed(2)}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(!ratings || ratings.ratings.length === 0) && !target && (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                        Geen analyst data beschikbaar voor {symbol}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}