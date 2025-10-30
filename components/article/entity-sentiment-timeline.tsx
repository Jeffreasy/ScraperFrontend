'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useEntitySentiment } from '@/lib/hooks/use-analytics';
import { cn, bodyText, flexPatterns, gap } from '@/lib/styles/theme';

interface EntitySentimentTimelineProps {
    entityName: string;
    days?: number;
    trigger?: React.ReactNode;
    children?: React.ReactNode;
}

export function EntitySentimentTimeline({
    entityName,
    days = 30,
    trigger,
    children,
}: EntitySentimentTimelineProps) {
    const { data, isLoading, error } = useEntitySentiment(entityName, days);

    const timelineData = useMemo(() => {
        if (!data || !data.timeline) return null;

        // Sort by date
        const sorted = [...data.timeline].sort(
            (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime()
        );

        // Calculate min/max for scaling
        const sentiments = sorted.map((d) => d.avg_sentiment);
        const min = Math.min(...sentiments);
        const max = Math.max(...sentiments);

        return {
            timeline: sorted,
            min,
            max,
            range: max - min,
        };
    }, [data]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children || trigger || (
                    <Button variant="outline" size="sm" className={bodyText.xs}>
                        Sentiment Timeline
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Sentiment Timeline: {entityName}</DialogTitle>
                    <DialogDescription>
                        Sentiment ontwikkeling over de laatste {days} dagen
                    </DialogDescription>
                </DialogHeader>

                {isLoading && <TimelineLoading />}
                {error && <TimelineError />}
                {timelineData && <TimelineChart data={timelineData} entityName={entityName} />}
            </DialogContent>
        </Dialog>
    );
}

function TimelineLoading() {
    return (
        <div className="space-y-3 py-4">
            {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
            ))}
        </div>
    );
}

function TimelineError() {
    return (
        <div className="text-center py-8 text-muted-foreground">
            <p>Kon sentiment timeline niet laden</p>
        </div>
    );
}

interface TimelineChartProps {
    data: {
        timeline: any[];
        min: number;
        max: number;
        range: number;
    };
    entityName: string;
}

function TimelineChart({ data, entityName }: TimelineChartProps) {
    const { timeline, min, max, range } = data;

    if (timeline.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <p>Geen sentiment data beschikbaar voor {entityName}</p>
            </div>
        );
    }

    const height = 200;
    const width = 600;
    const padding = 40;

    // Create SVG points
    const points = timeline.map((item, index) => {
        const x = padding + (index / (timeline.length - 1)) * (width - padding * 2);
        const normalizedValue = range > 0 ? (item.avg_sentiment - min) / range : 0.5;
        const y = height - padding - normalizedValue * (height - padding * 2);
        return { x, y, data: item };
    });

    const pathD = points
        .map((point, index) => {
            if (index === 0) return `M ${point.x} ${point.y}`;
            return `L ${point.x} ${point.y}`;
        })
        .join(' ');

    return (
        <div className="space-y-4">
            {/* Chart */}
            <div className="relative">
                <svg width={width} height={height} className="overflow-visible">
                    <defs>
                        <linearGradient id="sentiment-gradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                            <stop offset="50%" stopColor="#6b7280" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2" />
                        </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    <line
                        x1={padding}
                        y1={height / 2}
                        x2={width - padding}
                        y2={height / 2}
                        stroke="currentColor"
                        strokeOpacity="0.1"
                        strokeDasharray="4 4"
                    />

                    {/* Zero line (neutral sentiment) */}
                    {min < 0 && max > 0 && (
                        <line
                            x1={padding}
                            y1={height - padding - (-min / range) * (height - padding * 2)}
                            x2={width - padding}
                            y2={height - padding - (-min / range) * (height - padding * 2)}
                            stroke="currentColor"
                            strokeOpacity="0.2"
                            strokeWidth="2"
                        />
                    )}

                    {/* Area under line */}
                    <path
                        d={`${pathD} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`}
                        fill="url(#sentiment-gradient)"
                    />

                    {/* Line */}
                    <path
                        d={pathD}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Data points */}
                    {points.map((point, index) => (
                        <circle
                            key={index}
                            cx={point.x}
                            cy={point.y}
                            r="4"
                            fill={
                                point.data.avg_sentiment > 0.2
                                    ? '#10b981'
                                    : point.data.avg_sentiment < -0.2
                                        ? '#ef4444'
                                        : '#6b7280'
                            }
                            className="cursor-pointer hover:r-6 transition-all"
                        >
                            <title>
                                {new Date(point.data.day).toLocaleDateString('nl-NL')}
                                {'\n'}
                                Sentiment: {point.data.avg_sentiment.toFixed(2)}
                                {'\n'}
                                Mentions: {point.data.mention_count}
                            </title>
                        </circle>
                    ))}

                    {/* Y-axis labels */}
                    <text x={10} y={padding} className={cn(bodyText.xs, 'fill-muted-foreground')}>
                        {max.toFixed(2)}
                    </text>
                    <text x={10} y={height - padding} className={cn(bodyText.xs, 'fill-muted-foreground')}>
                        {min.toFixed(2)}
                    </text>
                </svg>
            </div>

            {/* Timeline cards */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {timeline.map((item) => (
                    <TimelineItem key={item.day} item={item} />
                ))}
            </div>
        </div>
    );
}

function TimelineItem({ item }: { item: any }) {
    const sentiment = item.avg_sentiment;
    const sentimentType = sentiment > 0.2 ? 'positive' : sentiment < -0.2 ? 'negative' : 'neutral';

    return (
        <div className="p-3 rounded-lg border hover:bg-accent transition-colors">
            <div className={cn(flexPatterns.between, 'mb-2')}>
                <span className={cn(bodyText.small, 'font-semibold')}>
                    {new Date(item.day).toLocaleDateString('nl-NL', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                    })}
                </span>
                <div
                    className={cn(
                        'inline-flex items-center gap-1',
                        bodyText.xs,
                        'font-semibold px-2 py-0.5 rounded',
                        sentimentType === 'positive' && 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
                        sentimentType === 'negative' && 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
                        sentimentType === 'neutral' && 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    )}
                >
                    {sentimentType === 'positive' && <TrendingUp className="h-3 w-3" />}
                    {sentimentType === 'negative' && <TrendingDown className="h-3 w-3" />}
                    {sentimentType === 'neutral' && <Minus className="h-3 w-3" />}
                    {sentiment > 0 ? '+' : ''}
                    {sentiment.toFixed(2)}
                </div>
            </div>

            <div className={cn(flexPatterns.start, gap.md, bodyText.xs, 'text-muted-foreground')}>
                <span>{item.mention_count} mentions</span>
                {item.sources && item.sources.length > 0 && (
                    <span>{item.sources.length} sources</span>
                )}
                {item.categories && item.categories.length > 0 && (
                    <span>{item.categories.length} categories</span>
                )}
            </div>

            {item.sources && item.sources.length > 0 && (
                <div className={cn('flex flex-wrap', gap.xs, 'mt-2')}>
                    {item.sources.slice(0, 3).map((source: string) => (
                        <span
                            key={source}
                            className={cn(
                                'inline-flex items-center rounded-md bg-secondary px-1.5 py-0.5',
                                'text-[10px] font-medium text-secondary-foreground'
                            )}
                        >
                            {source}
                        </span>
                    ))}
                    {item.sources.length > 3 && (
                        <span className={cn('text-[10px] text-muted-foreground self-center')}>
                            +{item.sources.length - 3}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * Compact inline sentiment timeline (mini version)
 */
interface CompactSentimentTimelineProps {
    entityName: string;
    days?: number;
    className?: string;
}

export function CompactSentimentTimeline({
    entityName,
    days = 7,
    className,
}: CompactSentimentTimelineProps) {
    const { data, isLoading } = useEntitySentiment(entityName, days);

    if (isLoading) {
        return <Skeleton className={cn('h-8 w-24', className)} />;
    }

    if (!data || !data.timeline || data.timeline.length === 0) {
        return null;
    }

    const avgSentiment =
        data.timeline.reduce((sum, item) => sum + item.avg_sentiment, 0) / data.timeline.length;
    const totalMentions = data.timeline.reduce((sum, item) => sum + item.mention_count, 0);

    return (
        <EntitySentimentTimeline entityName={entityName} days={days}>
            <Button variant="outline" size="sm" className={cn(bodyText.xs, className)}>
                📊 {totalMentions} mentions • Avg: {avgSentiment.toFixed(2)}
            </Button>
        </EntitySentimentTimeline>
    );
}