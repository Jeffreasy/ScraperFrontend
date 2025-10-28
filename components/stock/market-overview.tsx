'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { MarketMoversResponse, SectorsResponse } from '@/lib/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

export function MarketOverview() {
    const [gainers, setGainers] = useState<MarketMoversResponse | null>(null);
    const [losers, setLosers] = useState<MarketMoversResponse | null>(null);
    const [actives, setActives] = useState<MarketMoversResponse | null>(null);
    const [sectors, setSectors] = useState<SectorsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function loadMarketData() {
            setLoading(true);
            setError(null);

            try {
                // Parallel fetch (efficient!)
                const [gainersData, losersData, activesData, sectorsData] = await Promise.all([
                    apiClient.getMarketGainers(),
                    apiClient.getMarketLosers(),
                    apiClient.getMarketActives(),
                    apiClient.getSectors()
                ]);

                if (gainersData.success && gainersData.data) setGainers(gainersData.data);
                if (losersData.success && losersData.data) setLosers(losersData.data);
                if (activesData.success && activesData.data) setActives(activesData.data);
                if (sectorsData.success && sectorsData.data) setSectors(sectorsData.data);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to load market data'));
            } finally {
                setLoading(false);
            }
        }

        loadMarketData();

        // Auto-refresh every 5 minutes (cached, no extra cost)
        const interval = setInterval(loadMarketData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[...Array(5)].map((_, j) => (
                                    <Skeleton key={j} className="h-12 w-full" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <Card className="border-destructive/50">
                <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">{error.message}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Top Gainers */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <TrendingUp className="w-5 h-5" />
                        Top Gainers
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {gainers?.gainers?.slice(0, 5).map((stock) => (
                            <div
                                key={stock.symbol}
                                className="flex items-center justify-between p-2 rounded hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="font-bold text-sm">{stock.symbol}</div>
                                    <div className="text-xs text-muted-foreground truncate">
                                        {stock.name}
                                    </div>
                                </div>
                                <div className="text-right ml-2">
                                    <div className="font-semibold text-sm">
                                        ${stock.price.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                                        +{stock.changePercent.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Top Losers */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <TrendingDown className="w-5 h-5" />
                        Top Losers
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {losers?.losers?.slice(0, 5).map((stock) => (
                            <div
                                key={stock.symbol}
                                className="flex items-center justify-between p-2 rounded hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="font-bold text-sm">{stock.symbol}</div>
                                    <div className="text-xs text-muted-foreground truncate">
                                        {stock.name}
                                    </div>
                                </div>
                                <div className="text-right ml-2">
                                    <div className="font-semibold text-sm">
                                        ${stock.price.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                                        {stock.changePercent.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Most Active */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Most Active
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {actives?.actives?.slice(0, 5).map((stock) => (
                            <div
                                key={stock.symbol}
                                className="flex items-center justify-between p-2 rounded hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="font-bold text-sm">{stock.symbol}</div>
                                    <div className="text-xs text-muted-foreground">
                                        Vol: {(stock.volume / 1000000).toFixed(1)}M
                                    </div>
                                </div>
                                <div className="text-right ml-2">
                                    <div className="font-semibold text-sm">
                                        ${stock.price.toFixed(2)}
                                    </div>
                                    <div className={`text-xs font-medium ${stock.changePercent >= 0
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-red-600 dark:text-red-400'
                                        }`}>
                                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Sector Performance */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Sector Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {sectors?.sectors?.slice(0, 10).map((sector) => (
                            <div
                                key={sector.sector}
                                className="flex items-center justify-between p-2 rounded hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="text-sm font-medium truncate">
                                        {sector.sector}
                                    </div>
                                </div>
                                <div className={`text-sm font-semibold ml-2 ${sector.changePercent >= 0
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-600 dark:text-red-400'
                                    }`}>
                                    {sector.changePercent >= 0 ? '+' : ''}{sector.changePercent.toFixed(2)}%
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}