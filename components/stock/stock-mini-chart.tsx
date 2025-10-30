'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useStockMiniChart } from '@/lib/hooks/use-stock-historical';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, bodyText } from '@/lib/styles/theme';

interface StockMiniChartProps {
    symbol: string;
    height?: number;
    width?: number;
    showChange?: boolean;
    className?: string;
}

export function StockMiniChart({
    symbol,
    height = 40,
    width = 100,
    showChange = true,
    className,
}: StockMiniChartProps) {
    const { data, isLoading, error } = useStockMiniChart(symbol);

    const chartData = useMemo(() => {
        if (!data || !data.prices || data.prices.length === 0) return null;

        const prices = data.prices.map(p => p.close);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const range = max - min;

        // Generate SVG path points
        const points = prices.map((price, index) => {
            const x = (index / (prices.length - 1)) * width;
            const y = height - ((price - min) / range) * height;
            return { x, y };
        });

        // Create smooth line using path
        const pathD = points
            .map((point, index) => {
                if (index === 0) return `M ${point.x} ${point.y}`;
                return `L ${point.x} ${point.y}`;
            })
            .join(' ');

        const firstPrice = prices[0];
        const lastPrice = prices[prices.length - 1];
        const change = lastPrice - firstPrice;
        const changePercent = (change / firstPrice) * 100;
        const isPositive = change >= 0;

        return {
            pathD,
            isPositive,
            changePercent,
            change,
            min,
            max,
        };
    }, [data, height, width]);

    if (error) return null;
    if (isLoading) return <Skeleton className={cn('rounded', className)} style={{ width, height }} />;
    if (!chartData) return null;

    const strokeColor = chartData.isPositive ? '#10b981' : '#ef4444'; // green-500 : red-500
    const fillColor = chartData.isPositive
        ? 'url(#gradient-positive)'
        : 'url(#gradient-negative)';

    return (
        <div className={cn('inline-flex flex-col gap-1', className)}>
            <svg
                width={width}
                height={height}
                className="overflow-visible"
                style={{ display: 'block' }}
            >
                <defs>
                    <linearGradient id="gradient-positive" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="gradient-negative" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Area fill */}
                <path
                    d={`${chartData.pathD} L ${width} ${height} L 0 ${height} Z`}
                    fill={fillColor}
                />

                {/* Line */}
                <path
                    d={chartData.pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>

            {showChange && (
                <div
                    className={cn(
                        'flex items-center gap-1',
                        bodyText.xs,
                        'font-semibold',
                        chartData.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    )}
                >
                    {chartData.isPositive ? (
                        <TrendingUp className="h-3 w-3" />
                    ) : (
                        <TrendingDown className="h-3 w-3" />
                    )}
                    <span>
                        {chartData.isPositive ? '+' : ''}
                        {chartData.changePercent.toFixed(2)}%
                    </span>
                </div>
            )}
        </div>
    );
}

/**
 * Sparkline variant - ultra minimal
 */
export function StockSparkline({
    symbol,
    width = 60,
    height = 20,
    className,
}: Omit<StockMiniChartProps, 'showChange'>) {
    return (
        <StockMiniChart
            symbol={symbol}
            width={width}
            height={height}
            showChange={false}
            className={className}
        />
    );
}