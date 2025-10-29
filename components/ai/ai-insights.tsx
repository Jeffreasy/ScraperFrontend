'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { AIEnrichment } from '@/lib/types/api';
import { SentimentBadge } from './sentiment-badge';
import { EntityChip } from './entity-chip';
import { KeywordTag } from './keyword-tag';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, AlertCircle, Clock, Users, Building, MapPin, Key } from 'lucide-react';
import { LightweightErrorBoundary } from '@/components/error-boundary';
import {
    cn,
    flexPatterns,
    spacing,
    transitions,
    bodyText,
    gap,
    cardStyles,
} from '@/lib/styles/theme';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AIInsightsProps {
    enrichment: AIEnrichment;
    onEntityClick?: (entity: string, type: 'persons' | 'organizations' | 'locations') => void;
    onKeywordClick?: (keyword: string) => void;
}

type EntityType = 'persons' | 'organizations' | 'locations';

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const stateBannerVariants = cva(
    ['border', transitions.colors],
    {
        variants: {
            state: {
                processing: 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20',
                error: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20',
                empty: '',
            },
        },
        defaultVariants: {
            state: 'empty',
        },
    }
);

const stateTextVariants = cva(
    [bodyText.small, 'font-medium'],
    {
        variants: {
            state: {
                processing: 'text-yellow-900 dark:text-yellow-100',
                error: 'text-red-900 dark:text-red-100',
                muted: 'text-muted-foreground',
            },
        },
    }
);

const sectionHeaderVariants = cva(
    [bodyText.small, 'font-semibold mb-2', flexPatterns.start, gap.sm],
    {
        variants: {
            variant: {
                default: '',
                withIcon: 'items-center',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const summaryBoxVariants = cva(
    ['p-3 rounded-lg border', transitions.colors],
    {
        variants: {
            variant: {
                default: 'bg-muted/50 border-border',
                elevated: 'bg-card border-primary/20',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AIInsights({ enrichment, onEntityClick, onKeywordClick }: AIInsightsProps) {
    // Not processed yet
    if (!enrichment.processed) {
        return <ProcessingState />;
    }

    // Processing error
    if (enrichment.error) {
        return <ErrorState error={enrichment.error} />;
    }

    const hasAnyData =
        enrichment.sentiment ||
        enrichment.categories ||
        enrichment.entities ||
        enrichment.keywords ||
        enrichment.summary;

    if (!hasAnyData) {
        return <EmptyState />;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className={cn('text-base', flexPatterns.start, gap.sm)}>
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Insights
                </CardTitle>
            </CardHeader>
            <CardContent className={spacing.md}>
                {/* Sentiment Analysis */}
                {enrichment.sentiment && (
                    <LightweightErrorBoundary componentName="Sentiment">
                        <SentimentSection sentiment={enrichment.sentiment} />
                    </LightweightErrorBoundary>
                )}

                {/* Categories */}
                {enrichment.categories && Object.keys(enrichment.categories).length > 0 && (
                    <LightweightErrorBoundary componentName="Categories">
                        <CategoriesSection categories={enrichment.categories} />
                    </LightweightErrorBoundary>
                )}

                {/* Entities */}
                {enrichment.entities && (
                    <LightweightErrorBoundary componentName="Entities">
                        <EntitiesSection entities={enrichment.entities} onEntityClick={onEntityClick} />
                    </LightweightErrorBoundary>
                )}

                {/* Keywords */}
                {enrichment.keywords && enrichment.keywords.length > 0 && (
                    <LightweightErrorBoundary componentName="Keywords">
                        <KeywordsSection keywords={enrichment.keywords} onKeywordClick={onKeywordClick} />
                    </LightweightErrorBoundary>
                )}

                {/* AI Summary */}
                {enrichment.summary && (
                    <LightweightErrorBoundary componentName="AI Summary">
                        <SummarySection summary={enrichment.summary} />
                    </LightweightErrorBoundary>
                )}

                {/* Processing Info */}
                {enrichment.processed_at && <ProcessingInfo processedAt={enrichment.processed_at} />}
            </CardContent>
        </Card>
    );
}

// ============================================================================
// STATE COMPONENTS
// ============================================================================

function ProcessingState() {
    return (
        <Card className={stateBannerVariants({ state: 'processing' })}>
            <CardContent className={cn('pt-6', flexPatterns.start, gap.sm)}>
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 animate-pulse" />
                <div>
                    <p className={stateTextVariants({ state: 'processing' })}>AI analyse wordt verwerkt...</p>
                    <p className={cn(bodyText.xs, 'text-yellow-700 dark:text-yellow-300 mt-1')}>
                        Dit artikel wordt binnenkort automatisch verrijkt met AI insights.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

function ErrorState({ error }: { error: string }) {
    return (
        <Card className={stateBannerVariants({ state: 'error' })}>
            <CardContent className={cn('pt-6', flexPatterns.start, gap.sm)}>
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <div>
                    <p className={stateTextVariants({ state: 'error' })}>AI analyse mislukt</p>
                    <p className={cn(bodyText.xs, 'text-red-700 dark:text-red-300 mt-1')}>{error}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function EmptyState() {
    return (
        <Card>
            <CardContent className="pt-6">
                <p className={cn(bodyText.small, 'text-muted-foreground text-center')}>
                    Geen AI insights beschikbaar voor dit artikel.
                </p>
            </CardContent>
        </Card>
    );
}

// ============================================================================
// SECTION COMPONENTS
// ============================================================================

function SentimentSection({ sentiment }: { sentiment: any }) {
    return (
        <div>
            <h4 className={sectionHeaderVariants()}>
                Sentiment Analyse
                {sentiment.confidence && (
                    <span className={cn(bodyText.xs, 'font-normal text-muted-foreground')}>
                        ({(sentiment.confidence * 100).toFixed(0)}% zekerheid)
                    </span>
                )}
            </h4>
            <SentimentBadge sentiment={sentiment} showConfidence />
        </div>
    );
}

function CategoriesSection({ categories }: { categories: Record<string, number> }) {
    return (
        <div>
            <h4 className={sectionHeaderVariants()}>
                AI Categorieën
                <span className={cn(bodyText.xs, 'font-normal text-muted-foreground')}>
                    Top {Math.min(3, Object.keys(categories).length)}
                </span>
            </h4>
            <div className={cn('flex flex-wrap', gap.sm)}>
                {Object.entries(categories)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([category, confidence]) => (
                        <a key={category} href={`/?category=${encodeURIComponent(category)}`} className="group">
                            <span
                                className={cn(
                                    'inline-flex items-center gap-1 rounded-full',
                                    'bg-primary/10 px-3 py-1',
                                    bodyText.xs,
                                    'font-semibold text-primary',
                                    'border border-primary/20',
                                    transitions.base,
                                    'hover:bg-primary/20 hover:scale-105 hover:shadow-md'
                                )}
                                title={`Confidence: ${(confidence * 100).toFixed(0)}%`}
                            >
                                {category}
                                <span className="opacity-75 text-[10px]">{(confidence * 100).toFixed(0)}%</span>
                            </span>
                        </a>
                    ))}
            </div>
        </div>
    );
}

function EntitiesSection({
    entities,
    onEntityClick,
}: {
    entities: any;
    onEntityClick?: (entity: string, type: EntityType) => void;
}) {
    const entityTypes: Array<{
        key: 'persons' | 'organizations' | 'locations';
        icon: React.ComponentType<{ className?: string }>;
        label: string;
        emoji: string;
    }> = [
            { key: 'persons', icon: Users, label: 'Personen', emoji: '👤' },
            { key: 'organizations', icon: Building, label: 'Organisaties', emoji: '🏢' },
            { key: 'locations', icon: MapPin, label: 'Locaties', emoji: '📍' },
        ];

    return (
        <div className={spacing.sm}>
            {entityTypes.map(({ key, icon: Icon, label, emoji }) => {
                const items = entities[key];
                if (!items || items.length === 0) return null;

                return (
                    <div key={key}>
                        <h4 className={sectionHeaderVariants({ variant: 'withIcon' })}>
                            <span className="text-base">{emoji}</span>
                            {label}
                            <span className={cn(bodyText.xs, 'font-normal text-muted-foreground')}>
                                ({items.length})
                            </span>
                        </h4>
                        <div className={cn('flex flex-wrap', gap.xs)}>
                            {items.slice(0, 5).map((item: string) => (
                                <EntityChip
                                    key={item}
                                    name={item}
                                    type={key}
                                    onClick={onEntityClick ? () => onEntityClick(item, key) : undefined}
                                />
                            ))}
                            {items.length > 5 && (
                                <span className={cn(bodyText.xs, 'text-muted-foreground self-center')}>
                                    +{items.length - 5} meer
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function KeywordsSection({
    keywords,
    onKeywordClick,
}: {
    keywords: Array<{ word: string; score: number }>;
    onKeywordClick?: (keyword: string) => void;
}) {
    return (
        <div>
            <h4 className={sectionHeaderVariants()}>
                <Key className="h-4 w-4" />
                Sleutelwoorden
                <span className={cn(bodyText.xs, 'font-normal text-muted-foreground')}>
                    Top {Math.min(8, keywords.length)} op relevantie
                </span>
            </h4>
            <div className={cn('flex flex-wrap', gap.xs)}>
                {keywords
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 8)
                    .map((kw) => (
                        <KeywordTag
                            key={kw.word}
                            keyword={kw.word}
                            score={kw.score}
                            onClick={onKeywordClick ? () => onKeywordClick(kw.word) : undefined}
                        />
                    ))}
            </div>
        </div>
    );
}

function SummarySection({ summary }: { summary: string }) {
    return (
        <div>
            <h4 className={cn(bodyText.small, 'font-semibold mb-2')}>AI Samenvatting</h4>
            <div className={summaryBoxVariants()}>
                <p className={cn(bodyText.small, 'text-muted-foreground leading-relaxed')}>{summary}</p>
            </div>
        </div>
    );
}

function ProcessingInfo({ processedAt }: { processedAt: string }) {
    return (
        <p className={cn(bodyText.xs, 'text-muted-foreground pt-2 border-t', flexPatterns.start, gap.sm)}>
            <Clock className="h-3 w-3" />
            Verwerkt op:{' '}
            {new Date(processedAt).toLocaleString('nl-NL', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })}
        </p>
    );
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
    stateBannerVariants,
    stateTextVariants,
    sectionHeaderVariants,
    summaryBoxVariants,
};
export type { AIInsightsProps, EntityType };