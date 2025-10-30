'use client';

import { TrendingUp, Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTrendingCheck } from '@/lib/hooks/use-trending';
import { cn } from '@/lib/styles/theme';

interface TrendingBadgeProps {
    keywords?: string[];
    variant?: 'icon' | 'full' | 'minimal';
    className?: string;
}

export function TrendingBadge({
    keywords,
    variant = 'full',
    className
}: TrendingBadgeProps) {
    const { isTrending, trendingScore, trendingKeywords, isLoading } = useTrendingCheck(keywords);

    if (isLoading || !isTrending) {
        return null;
    }

    // Bereken intensity op basis van trending score
    const intensity = trendingScore > 80 ? 'high' : trendingScore > 50 ? 'medium' : 'low';

    if (variant === 'icon') {
        return (
            <div
                className={cn(
                    'inline-flex items-center justify-center',
                    'rounded-full p-1',
                    intensity === 'high' && 'bg-red-500/20 text-red-600 dark:text-red-400',
                    intensity === 'medium' && 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
                    intensity === 'low' && 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
                    className
                )}
                title={`Trending: ${trendingKeywords.join(', ')}`}
            >
                <Flame className="h-3.5 w-3.5" />
            </div>
        );
    }

    if (variant === 'minimal') {
        return (
            <Badge
                variant="secondary"
                className={cn(
                    'gap-1 font-semibold',
                    intensity === 'high' && 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
                    intensity === 'medium' && 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
                    intensity === 'low' && 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
                    className
                )}
            >
                <Flame className="h-3 w-3" />
                <span className="text-xs">Trending</span>
            </Badge>
        );
    }

    return (
        <Badge
            variant="secondary"
            className={cn(
                'gap-1.5 font-semibold animate-pulse',
                intensity === 'high' && 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-600 dark:text-red-400 border-red-500/30',
                intensity === 'medium' && 'bg-gradient-to-r from-orange-500/20 to-yellow-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30',
                intensity === 'low' && 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
                className
            )}
            title={`Trending keywords: ${trendingKeywords.join(', ')}`}
        >
            <Flame className={cn('h-3.5 w-3.5', intensity === 'high' && 'animate-pulse')} />
            <span className="text-xs font-bold">
                {intensity === 'high' ? '🔥 HOT' : 'Trending'}
            </span>
            {trendingKeywords.length > 0 && (
                <span className="hidden sm:inline text-[10px] opacity-75">
                    ({trendingKeywords.length})
                </span>
            )}
        </Badge>
    );
}

interface TrendingIndicatorProps {
    keywords?: string[];
    className?: string;
}

/**
 * Subtiele trending indicator voor in de header
 */
export function TrendingIndicator({ keywords, className }: TrendingIndicatorProps) {
    const { isTrending, trendingScore } = useTrendingCheck(keywords);

    if (!isTrending) {
        return null;
    }

    const intensity = trendingScore > 80 ? 'high' : trendingScore > 50 ? 'medium' : 'low';

    return (
        <div
            className={cn(
                'inline-flex items-center gap-1',
                intensity === 'high' && 'text-red-600 dark:text-red-400',
                intensity === 'medium' && 'text-orange-600 dark:text-orange-400',
                intensity === 'low' && 'text-yellow-600 dark:text-yellow-400',
                className
            )}
            title={`Trending score: ${Math.round(trendingScore)}`}
        >
            <TrendingUp className="h-3 w-3" />
        </div>
    );
}