'use client';

import { Card } from '@/components/ui/card';
import { Globe, Loader2, CheckCircle, XCircle } from 'lucide-react';

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

export function BrowserPoolCard({ stats }: BrowserPoolCardProps) {
    if (!stats || !stats.enabled) {
        return (
            <Card className="p-6 bg-muted/50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-muted">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Browser Pool</h3>
                        <p className="text-xs text-muted-foreground">Headless browser scraping</p>
                    </div>
                </div>
                <div className="text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        Uitgeschakeld
                    </span>
                </div>
            </Card>
        );
    }

    const utilizationPercent = stats.pool_size > 0
        ? Math.round((stats.in_use / stats.pool_size) * 100)
        : 0;

    const getUtilizationColor = (percent: number) => {
        if (percent < 50) return 'text-green-600 bg-green-100 dark:bg-green-950/30';
        if (percent < 80) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-950/30';
        return 'text-red-600 bg-red-100 dark:bg-red-950/30';
    };

    return (
        <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/30">
                    <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h3 className="font-semibold">Browser Pool</h3>
                    <p className="text-xs text-muted-foreground">Headless browser scraping</p>
                </div>
            </div>

            <div className="space-y-3">
                {/* Status */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium">
                        {stats.closed ? (
                            <>
                                <XCircle className="h-3 w-3 text-red-600" />
                                <span className="text-red-600">Gesloten</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                <span className="text-green-600">Actief</span>
                            </>
                        )}
                    </span>
                </div>

                {/* Pool Size */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pool grootte:</span>
                    <span className="text-sm font-medium">{stats.pool_size} browsers</span>
                </div>

                {/* Available */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Beschikbaar:</span>
                    <span className="text-sm font-medium">{stats.available}</span>
                </div>

                {/* In Use */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">In gebruik:</span>
                    <span className="text-sm font-medium flex items-center gap-1">
                        {stats.in_use}
                        {stats.in_use > 0 && (
                            <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                        )}
                    </span>
                </div>

                {/* Utilization Bar */}
                <div className="pt-2">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Gebruik:</span>
                        <span className="text-xs font-medium">{utilizationPercent}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 rounded-full ${getUtilizationColor(utilizationPercent)}`}
                            style={{ width: `${utilizationPercent}%` }}
                        />
                    </div>
                </div>

                {/* Warning if high utilization */}
                {utilizationPercent >= 80 && !stats.closed && (
                    <div className="mt-2 p-2 rounded bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                        <p className="text-xs text-yellow-800 dark:text-yellow-200">
                            ⚠️ Hoog gebruik - overweeg pool size te verhogen
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
}