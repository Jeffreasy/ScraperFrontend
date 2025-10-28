'use client';

import React, { useMemo } from 'react';
import { useStockHistorical } from '@/lib/hooks/use-stock-historical';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StockChartProps {
    symbol: string;
    days?: number;
}

export function StockChart({ symbol, days = 30 }: StockChartProps) {
    const to = useMemo(() => new Date().toISOString().split('T')[0], []);
    const from = useMemo(() => {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString().split('T')[0];
    }, [days]);

    const { data, loading, error } = useStockHistorical(symbol, from, to);

    const chartData = useMemo(() => {
        if (!data || !data.prices || data.prices.length === 0) return null;

        const prices = data.prices.map(p => p.close);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const priceRange = maxPrice - minPrice;

        // Add padding
        const padding = priceRange * 0.1;
        const chartMin = minPrice - padding;
        const chartMax = maxPrice + padding;
        const chartRange = chartMax - chartMin;

        // SVG dimensions
        const width = 800;
        const height = 300;
        const paddingLeft = 60;
        const paddingRight = 20;
        const paddingTop = 20;
        const paddingBottom = 40;

        const chartWidth = width - paddingLeft - paddingRight;
        const chartHeight = height - paddingTop - paddingBottom;

        // Calculate points for the line
        const points = data.prices.map((price, index) => {
            const x = paddingLeft + (index / (data.prices.length - 1)) * chartWidth;
            const y = paddingTop + ((chartMax - price.close) / chartRange) * chartHeight;
            return { x, y, price: price.close, date: price.date };
        });

        // Create path string
        const pathD = points.map((p, i) =>
            `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
        ).join(' ');

        // Create gradient area
        const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${paddingLeft} ${height - paddingBottom} Z`;

        // Y-axis labels (5 labels)
        const yLabels = Array.from({ length: 5 }, (_, i) => {
            const value = chartMin + (chartRange * (4 - i) / 4);
            const y = paddingTop + (i / 4) * chartHeight;
            return { value, y };
        });

        return {
            width,
            height,
            paddingLeft,
            paddingBottom,
            pathD,
            areaD,
            points,
            yLabels,
            minPrice,
            maxPrice,
            currentPrice: prices[prices.length - 1],
            priceChange: prices[prices.length - 1] - prices[0],
            priceChangePercent: ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100
        };
    }, [data]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Koersontwikkeling</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="w-full h-80" />
                </CardContent>
            </Card>
        );
    }

    if (error || !chartData) {
        return (
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle>Koersontwikkeling</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {error?.message || 'Geen data beschikbaar'}
                    </p>
                </CardContent>
            </Card>
        );
    }

    const isPositive = chartData.priceChange >= 0;
    const lineColor = isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';
    const gradientColor = isPositive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)';

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Koersontwikkeling {symbol}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                        {days} dagen
                    </span>
                </CardTitle>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                        ${chartData.currentPrice.toFixed(2)}
                    </span>
                    <span className={`text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {isPositive ? '+' : ''}{chartData.priceChange.toFixed(2)} ({isPositive ? '+' : ''}{chartData.priceChangePercent.toFixed(2)}%)
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    <svg
                        viewBox={`0 0 ${chartData.width} ${chartData.height}`}
                        className="w-full h-auto"
                        style={{ maxHeight: '400px' }}
                    >
                        {/* Grid lines */}
                        {chartData.yLabels.map((label, i) => (
                            <line
                                key={i}
                                x1={chartData.paddingLeft}
                                y1={label.y}
                                x2={chartData.width - 20}
                                y2={label.y}
                                stroke="currentColor"
                                strokeWidth="1"
                                className="opacity-10"
                            />
                        ))}

                        {/* Y-axis labels */}
                        {chartData.yLabels.map((label, i) => (
                            <text
                                key={i}
                                x={chartData.paddingLeft - 10}
                                y={label.y}
                                textAnchor="end"
                                dominantBaseline="middle"
                                className="text-xs fill-muted-foreground"
                            >
                                ${label.value.toFixed(2)}
                            </text>
                        ))}

                        {/* Gradient area */}
                        <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={gradientColor} stopOpacity="0.8" />
                                <stop offset="100%" stopColor={gradientColor} stopOpacity="0.1" />
                            </linearGradient>
                        </defs>
                        <path
                            d={chartData.areaD}
                            fill="url(#chartGradient)"
                        />

                        {/* Line */}
                        <path
                            d={chartData.pathD}
                            fill="none"
                            stroke={lineColor}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* Data points */}
                        {chartData.points.map((point, i) => (
                            <circle
                                key={i}
                                cx={point.x}
                                cy={point.y}
                                r="3"
                                fill={lineColor}
                                className="opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <title>
                                    {new Date(point.date).toLocaleDateString('nl-NL')} - ${point.price.toFixed(2)}
                                </title>
                            </circle>
                        ))}
                    </svg>
                </div>

                <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                    <span>Min: ${chartData.minPrice.toFixed(2)}</span>
                    <span>Max: ${chartData.maxPrice.toFixed(2)}</span>
                </div>
            </CardContent>
        </Card>
    );
}