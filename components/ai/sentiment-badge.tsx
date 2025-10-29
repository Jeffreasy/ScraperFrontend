'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Smile, Frown, Meh, Star } from 'lucide-react';
import { SentimentAnalysis } from '@/lib/types/api';
import {
    cn,
    transitions,
    bodyText,
    getSentimentColor,
} from '@/lib/styles/theme';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface SentimentBadgeProps {
    sentiment: SentimentAnalysis;
    showScore?: boolean;
    showConfidence?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'subtle';
}

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const sentimentBadgeVariants = cva(
    [
        'inline-flex items-center gap-1.5 rounded-full font-semibold border',
        transitions.base,
        'hover:scale-105',
    ],
    {
        variants: {
            size: {
                sm: 'text-xs px-2 py-0.5',
                md: 'text-sm px-2.5 py-0.5',
                lg: 'text-base px-3 py-1',
            },
            variant: {
                default: '',
                subtle: 'opacity-90',
            },
        },
        defaultVariants: {
            size: 'md',
            variant: 'default',
        },
    }
);

// ============================================================================
// CONFIGURATION
// ============================================================================

const sentimentConfig = {
    positive: {
        icon: Smile,
        emoji: '😊',
        text: 'Positief',
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-700',
    },
    negative: {
        icon: Frown,
        emoji: '😟',
        text: 'Negatief',
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-700',
    },
    neutral: {
        icon: Meh,
        emoji: '😐',
        text: 'Neutraal',
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400 border-gray-300 dark:border-gray-600',
    },
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getSentimentType(label: string, score: number): 'positive' | 'negative' | 'neutral' {
    if (label === 'positive' || score >= 0.2) return 'positive';
    if (label === 'negative' || score <= -0.2) return 'negative';
    return 'neutral';
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SentimentBadge({
    sentiment,
    showScore = true,
    showConfidence = false,
    size = 'md',
    variant = 'default',
}: SentimentBadgeProps) {
    const sentimentType = getSentimentType(sentiment.label, sentiment.score);
    const config = sentimentConfig[sentimentType];

    return (
        <span
            className={cn(sentimentBadgeVariants({ size, variant }), config.color)}
            title={`Score: ${sentiment.score.toFixed(2)}${sentiment.confidence ? `, Confidence: ${(sentiment.confidence * 100).toFixed(0)}%` : ''
                }`}
        >
            <span className="text-sm" role="img" aria-label={config.text}>
                {config.emoji}
            </span>
            <span>{config.text}</span>
            {showScore && (
                <span className="opacity-75 text-[10px] font-bold">
                    {sentiment.score > 0 ? '+' : ''}
                    {sentiment.score.toFixed(2)}
                </span>
            )}
            {showConfidence && sentiment.confidence !== undefined && (
                <span className="ml-0.5 opacity-60 text-[10px]">
                    {(sentiment.confidence * 100).toFixed(0)}%
                </span>
            )}
        </span>
    );
}

// ============================================================================
// ICON VARIANT
// ============================================================================

/**
 * Icon-only variant for compact lists
 */
export function SentimentIcon({
    sentiment,
    size = 'default',
}: {
    sentiment: SentimentAnalysis;
    size?: 'sm' | 'default' | 'lg';
}) {
    const sentimentType = getSentimentType(sentiment.label, sentiment.score);
    const config = sentimentConfig[sentimentType];
    const Icon = config.icon;

    const sizeClasses = {
        sm: 'h-3 w-3',
        default: 'h-4 w-4',
        lg: 'h-5 w-5',
    };

    const colorClasses = {
        positive: 'text-green-600 dark:text-green-400',
        negative: 'text-red-600 dark:text-red-400',
        neutral: 'text-gray-600 dark:text-gray-400',
    };

    return (
        <span title={`${config.text}: ${sentiment.score.toFixed(2)}`}>
            <Icon
                className={cn(sizeClasses[size], colorClasses[sentimentType])}
                role="img"
                aria-label={config.text}
            />
        </span>
    );
}

// ============================================================================
// EMOJI VARIANT
// ============================================================================

/**
 * Emoji-only variant (legacy support)
 */
export function SentimentEmoji({ sentiment }: { sentiment: SentimentAnalysis }) {
    const sentimentType = getSentimentType(sentiment.label, sentiment.score);
    const config = sentimentConfig[sentimentType];

    const colorClasses = {
        positive: 'text-green-600',
        negative: 'text-red-600',
        neutral: 'text-gray-600',
    };

    return (
        <span
            className={cn('text-lg', colorClasses[sentimentType])}
            role="img"
            aria-label={config.text}
            title={`${config.text}: ${sentiment.score.toFixed(2)}`}
        >
            {config.emoji}
        </span>
    );
}

// ============================================================================
// EXPORTS
// ============================================================================

export { sentimentBadgeVariants, sentimentConfig, getSentimentType };
export type { SentimentBadgeProps };