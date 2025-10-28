'use client';

import { SentimentAnalysis } from '@/lib/types/api';

interface SentimentBadgeProps {
    sentiment: SentimentAnalysis;
    showScore?: boolean;
    showConfidence?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function SentimentBadge({
    sentiment,
    showScore = true,
    showConfidence = false,
    size = 'md'
}: SentimentBadgeProps) {
    const getSentimentConfig = (label: string, score: number) => {
        if (label === 'positive' || score >= 0.2) {
            return {
                color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-700',
                icon: '😊',
                text: 'Positief'
            };
        }
        if (label === 'negative' || score <= -0.2) {
            return {
                color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-700',
                icon: '😟',
                text: 'Negatief'
            };
        }
        return {
            color: 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400 border-gray-300 dark:border-gray-600',
            icon: '😐',
            text: 'Neutraal'
        };
    };

    const config = getSentimentConfig(sentiment.label, sentiment.score);

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-0.5',
        lg: 'text-base px-3 py-1',
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full font-semibold border transition-all hover:scale-105 ${config.color} ${sizeClasses[size]}`}
            title={`Score: ${sentiment.score.toFixed(2)}${sentiment.confidence ? `, Confidence: ${(sentiment.confidence * 100).toFixed(0)}%` : ''}`}
        >
            <span className="text-sm" role="img" aria-label={config.text}>
                {config.icon}
            </span>
            <span>{config.text}</span>
            {showScore && (
                <span className="opacity-75 text-[10px] font-bold">
                    {sentiment.score > 0 ? '+' : ''}{sentiment.score.toFixed(2)}
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

// Compact variant for lists
export function SentimentIcon({ sentiment }: { sentiment: SentimentAnalysis }) {
    const config = sentiment.score >= 0.2 ? '😊' : sentiment.score <= -0.2 ? '😟' : '😐';
    const color = sentiment.score >= 0.2 ? 'text-green-600' : sentiment.score <= -0.2 ? 'text-red-600' : 'text-gray-600';

    return (
        <span
            className={`text-lg ${color}`}
            role="img"
            aria-label={sentiment.label}
            title={`${sentiment.label}: ${sentiment.score.toFixed(2)}`}
        >
            {config}
        </span>
    );
}