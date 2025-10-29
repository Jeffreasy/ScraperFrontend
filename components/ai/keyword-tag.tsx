'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Star } from 'lucide-react';
import {
    cn,
    transitions,
    bodyText,
    focusEffects,
} from '@/lib/styles/theme';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface KeywordTagProps {
    keyword: string;
    score: number;
    onClick?: () => void;
    showStar?: boolean;
}

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const keywordTagVariants = cva(
    [
        'inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-medium',
        transitions.base,
    ],
    {
        variants: {
            relevance: {
                high: 'bg-primary text-primary-foreground',
                medium: 'bg-primary/70 text-primary-foreground',
                low: 'bg-secondary text-secondary-foreground',
            },
            interactive: {
                true: 'cursor-pointer hover:scale-110 hover:shadow-md active:scale-95',
                false: 'hover:opacity-100',
            },
        },
        defaultVariants: {
            relevance: 'medium',
            interactive: false,
        },
    }
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getRelevanceLevel(score: number): 'high' | 'medium' | 'low' {
    if (score >= 0.7) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
}

function calculateFontSize(score: number): string {
    const minSize = 0.75;
    const maxSize = 1.1;
    return `${minSize + score * (maxSize - minSize)}rem`;
}

function calculateOpacity(score: number, interactive: boolean): number {
    if (interactive) return 1;
    const minOpacity = 0.6;
    const maxOpacity = 1.0;
    return minOpacity + score * (maxOpacity - minOpacity);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function KeywordTag({ keyword, score, onClick, showStar = true }: KeywordTagProps) {
    const relevance = getRelevanceLevel(score);
    const fontSize = calculateFontSize(score);
    const opacity = calculateOpacity(score, !!onClick);
    const Component = onClick ? 'button' : 'span';

    return (
        <Component
            className={cn(
                keywordTagVariants({ relevance, interactive: !!onClick }),
                onClick && focusEffects.ring
            )}
            style={{
                fontSize,
                opacity,
            }}
            onClick={onClick}
            title={`Relevance: ${(score * 100).toFixed(0)}%${onClick ? ' (Click to search)' : ''}`}
            aria-label={`Keyword: ${keyword}, relevance ${(score * 100).toFixed(0)}%`}
            {...(onClick && { type: 'button' })}
        >
            <span>{keyword}</span>
            {showStar && score >= 0.7 && (
                <Star className="h-3 w-3 fill-current" aria-hidden="true" />
            )}
        </Component>
    );
}

// ============================================================================
// COMPACT VARIANT
// ============================================================================

/**
 * Compact keyword tag without dynamic sizing
 */
export function KeywordTagCompact({
    keyword,
    onClick,
}: {
    keyword: string;
    onClick?: () => void;
}) {
    const Component = onClick ? 'button' : 'span';

    return (
        <Component
            className={cn(
                'inline-flex items-center rounded-md px-2 py-0.5',
                bodyText.xs,
                'font-medium bg-secondary text-secondary-foreground',
                onClick && 'cursor-pointer hover:bg-secondary/80',
                transitions.colors
            )}
            onClick={onClick}
            {...(onClick && { type: 'button' })}
        >
            {keyword}
        </Component>
    );
}

// ============================================================================
// EXPORTS
// ============================================================================

export { keywordTagVariants };
export type { KeywordTagProps };