'use client';

import { CheckCircle2, TrendingUp, FileText, Sparkles, Calendar } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSourceStats, useSourceReliability } from '@/lib/hooks/use-source-stats';
import { cn, getSourceColor } from '@/lib/styles/theme';

interface SourceStatsTooltipProps {
    source: string;
    children: React.ReactNode;
}

export function SourceStatsTooltip({ source, children }: SourceStatsTooltipProps) {
    const { data: stats, isLoading } = useSourceStats(source);
    const { score, rating, metrics } = useSourceReliability(source);

    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent side="bottom" className="p-3 max-w-xs">
                    {isLoading ? (
                        <SourceStatsLoading />
                    ) : stats ? (
                        <SourceStatsContent
                            stats={stats}
                            score={score}
                            rating={rating}
                            metrics={metrics}
                        />
                    ) : (
                        <div className="text-xs text-muted-foreground">
                            Geen statistieken beschikbaar
                        </div>
                    )}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

function SourceStatsLoading() {
    return (
        <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-28" />
        </div>
    );
}

interface SourceStatsContentProps {
    stats: any;
    score: number;
    rating: string;
    metrics: any;
}

function SourceStatsContent({ stats, score, rating, metrics }: SourceStatsContentProps) {
    const getRatingColor = (rating: string) => {
        switch (rating) {
            case 'excellent':
                return 'text-green-600 dark:text-green-400';
            case 'good':
                return 'text-blue-600 dark:text-blue-400';
            case 'fair':
                return 'text-yellow-600 dark:text-yellow-400';
            case 'poor':
                return 'text-orange-600 dark:text-orange-400';
            default:
                return 'text-muted-foreground';
        }
    };

    const getRatingBadge = (rating: string) => {
        const labels = {
            excellent: 'Uitstekend',
            good: 'Goed',
            fair: 'Redelijk',
            poor: 'Matig',
            unknown: 'Onbekend',
        };
        return labels[rating as keyof typeof labels] || labels.unknown;
    };

    return (
        <div className="space-y-3">
            {/* Header met betrouwbaarheidsscore */}
            <div className="flex items-center justify-between">
                <div className="font-semibold text-sm">{stats.source_name || stats.source}</div>
                <Badge
                    variant="secondary"
                    className={cn('text-xs font-bold', getRatingColor(rating))}
                >
                    {getRatingBadge(rating)} ({score})
                </Badge>
            </div>

            {/* Statistieken grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
                <StatItem
                    icon={<FileText className="h-3 w-3" />}
                    label="Artikelen"
                    value={stats.total_articles.toLocaleString()}
                />
                <StatItem
                    icon={<Calendar className="h-3 w-3" />}
                    label="Vandaag"
                    value={stats.articles_today.toString()}
                    highlight={stats.articles_today > 0}
                />
                <StatItem
                    icon={<Sparkles className="h-3 w-3" />}
                    label="AI Verwerkt"
                    value={`${metrics?.aiProcessingRate || 0}%`}
                />
                <StatItem
                    icon={<CheckCircle2 className="h-3 w-3" />}
                    label="Content"
                    value={`${metrics?.contentExtractionRate || 0}%`}
                />
            </div>

            {/* Sentiment indicator */}
            {stats.avg_sentiment !== null && stats.avg_sentiment !== undefined && (
                <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Gemiddeld sentiment:</span>
                        <SentimentIndicator sentiment={stats.avg_sentiment} />
                    </div>
                </div>
            )}

            {/* Laatste artikel */}
            {metrics?.daysSinceLastArticle !== undefined && (
                <div className="text-[10px] text-muted-foreground">
                    Laatste artikel: {metrics.daysSinceLastArticle === 0
                        ? 'vandaag'
                        : `${metrics.daysSinceLastArticle} dag${metrics.daysSinceLastArticle > 1 ? 'en' : ''} geleden`
                    }
                </div>
            )}
        </div>
    );
}

interface StatItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    highlight?: boolean;
}

function StatItem({ icon, label, value, highlight }: StatItemProps) {
    return (
        <div className="flex items-center gap-1.5">
            <div className={cn('text-muted-foreground', highlight && 'text-primary')}>
                {icon}
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground leading-none">{label}</span>
                <span className={cn('font-semibold leading-none mt-0.5', highlight && 'text-primary')}>
                    {value}
                </span>
            </div>
        </div>
    );
}

function SentimentIndicator({ sentiment }: { sentiment: number }) {
    const getSentimentInfo = (score: number) => {
        if (score > 0.3) return { label: 'Positief', color: 'text-green-600 dark:text-green-400', emoji: '😊' };
        if (score < -0.3) return { label: 'Negatief', color: 'text-red-600 dark:text-red-400', emoji: '😟' };
        return { label: 'Neutraal', color: 'text-gray-600 dark:text-gray-400', emoji: '😐' };
    };

    const info = getSentimentInfo(sentiment);

    return (
        <div className={cn('flex items-center gap-1 font-semibold', info.color)}>
            <span>{info.emoji}</span>
            <span>{info.label}</span>
            <span className="text-[10px] opacity-75">({sentiment.toFixed(2)})</span>
        </div>
    );
}

/**
 * Enhanced source badge met tooltip
 */
interface EnhancedSourceBadgeProps {
    source: string;
    className?: string;
}

export function EnhancedSourceBadge({ source, className }: EnhancedSourceBadgeProps) {
    return (
        <SourceStatsTooltip source={source}>
            <Badge className={cn(getSourceColor(source), 'cursor-help', className)}>
                {source}
            </Badge>
        </SourceStatsTooltip>
    );
}