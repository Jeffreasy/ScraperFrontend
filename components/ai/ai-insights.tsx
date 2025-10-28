'use client';

import { AIEnrichment } from '@/lib/types/api';
import { SentimentBadge } from './sentiment-badge';
import { EntityChip } from './entity-chip';
import { KeywordTag } from './keyword-tag';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, AlertCircle, Clock } from 'lucide-react';
import { LightweightErrorBoundary } from '@/components/error-boundary';

interface AIInsightsProps {
    enrichment: AIEnrichment;
    onEntityClick?: (entity: string, type: 'persons' | 'organizations' | 'locations') => void;
    onKeywordClick?: (keyword: string) => void;
}

export function AIInsights({ enrichment, onEntityClick, onKeywordClick }: AIInsightsProps) {
    // Not processed yet
    if (!enrichment.processed) {
        return (
            <Card className="border-yellow-200 bg-yellow-50/50">
                <CardContent className="pt-6 flex items-center gap-3">
                    <Clock className="h-5 w-5 text-yellow-600 animate-pulse" />
                    <div>
                        <p className="text-sm font-medium text-yellow-900">
                            AI analyse wordt verwerkt...
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                            Dit artikel wordt binnenkort automatisch verrijkt met AI insights.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Processing error
    if (enrichment.error) {
        return (
            <Card className="border-red-200 bg-red-50/50">
                <CardContent className="pt-6 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                        <p className="text-sm font-medium text-red-900">
                            AI analyse mislukt
                        </p>
                        <p className="text-xs text-red-700 mt-1">
                            {enrichment.error}
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const hasAnyData = enrichment.sentiment ||
        enrichment.categories ||
        enrichment.entities ||
        enrichment.keywords ||
        enrichment.summary;

    if (!hasAnyData) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground text-center">
                        Geen AI insights beschikbaar voor dit artikel.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Insights
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Sentiment Analysis */}
                <LightweightErrorBoundary componentName="Sentiment">
                    {enrichment.sentiment && (
                        <div>
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                Sentiment Analyse
                                {enrichment.sentiment.confidence && (
                                    <span className="text-xs font-normal text-muted-foreground">
                                        ({(enrichment.sentiment.confidence * 100).toFixed(0)}% zekerheid)
                                    </span>
                                )}
                            </h4>
                            <SentimentBadge sentiment={enrichment.sentiment} showConfidence />
                        </div>
                    )}
                </LightweightErrorBoundary>

                {/* Categories */}
                <LightweightErrorBoundary componentName="Categories">
                    {enrichment.categories && Object.keys(enrichment.categories).length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold mb-2">
                                AI Categorieën
                                <span className="ml-2 text-xs font-normal text-muted-foreground">
                                    Top {Math.min(3, Object.keys(enrichment.categories).length)}
                                </span>
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(enrichment.categories)
                                    .sort(([, a], [, b]) => b - a)
                                    .slice(0, 3)
                                    .map(([category, confidence]) => (
                                        <a
                                            key={category}
                                            href={`/?category=${encodeURIComponent(category)}`}
                                            className="group"
                                        >
                                            <span
                                                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20 transition-all hover:bg-primary/20 hover:scale-105 hover:shadow-md"
                                                title={`Confidence: ${(confidence * 100).toFixed(0)}%`}
                                            >
                                                {category}
                                                <span className="opacity-75 text-[10px]">
                                                    {(confidence * 100).toFixed(0)}%
                                                </span>
                                            </span>
                                        </a>
                                    ))}
                            </div>
                        </div>
                    )}
                </LightweightErrorBoundary>

                {/* Entities */}
                <LightweightErrorBoundary componentName="Entities">
                    {enrichment.entities && (
                        <div className="space-y-3">
                            {enrichment.entities.persons && enrichment.entities.persons.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                        👤 Personen
                                        <span className="text-xs font-normal text-muted-foreground">
                                            ({enrichment.entities.persons.length})
                                        </span>
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {enrichment.entities.persons.slice(0, 5).map((person) => (
                                            <EntityChip
                                                key={person}
                                                name={person}
                                                type="persons"
                                                onClick={onEntityClick ? () => onEntityClick(person, 'persons') : undefined}
                                            />
                                        ))}
                                        {enrichment.entities.persons.length > 5 && (
                                            <span className="text-xs text-muted-foreground self-center">
                                                +{enrichment.entities.persons.length - 5} meer
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {enrichment.entities.organizations && enrichment.entities.organizations.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                        🏢 Organisaties
                                        <span className="text-xs font-normal text-muted-foreground">
                                            ({enrichment.entities.organizations.length})
                                        </span>
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {enrichment.entities.organizations.slice(0, 5).map((org) => (
                                            <EntityChip
                                                key={org}
                                                name={org}
                                                type="organizations"
                                                onClick={onEntityClick ? () => onEntityClick(org, 'organizations') : undefined}
                                            />
                                        ))}
                                        {enrichment.entities.organizations.length > 5 && (
                                            <span className="text-xs text-muted-foreground self-center">
                                                +{enrichment.entities.organizations.length - 5} meer
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {enrichment.entities.locations && enrichment.entities.locations.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                        📍 Locaties
                                        <span className="text-xs font-normal text-muted-foreground">
                                            ({enrichment.entities.locations.length})
                                        </span>
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {enrichment.entities.locations.slice(0, 5).map((location) => (
                                            <EntityChip
                                                key={location}
                                                name={location}
                                                type="locations"
                                                onClick={onEntityClick ? () => onEntityClick(location, 'locations') : undefined}
                                            />
                                        ))}
                                        {enrichment.entities.locations.length > 5 && (
                                            <span className="text-xs text-muted-foreground self-center">
                                                +{enrichment.entities.locations.length - 5} meer
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </LightweightErrorBoundary>

                {/* Keywords */}
                <LightweightErrorBoundary componentName="Keywords">
                    {enrichment.keywords && enrichment.keywords.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold mb-2">
                                Sleutelwoorden
                                <span className="ml-2 text-xs font-normal text-muted-foreground">
                                    Top {Math.min(8, enrichment.keywords.length)} op relevantie
                                </span>
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {enrichment.keywords
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
                    )}
                </LightweightErrorBoundary>

                {/* AI Summary */}
                <LightweightErrorBoundary componentName="AI Summary">
                    {enrichment.summary && (
                        <div>
                            <h4 className="text-sm font-semibold mb-2">AI Samenvatting</h4>
                            <div className="p-3 rounded-lg bg-muted/50 border border-border">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {enrichment.summary}
                                </p>
                            </div>
                        </div>
                    )}
                </LightweightErrorBoundary>

                {/* Processing Info */}
                {enrichment.processed_at && (
                    <p className="text-xs text-muted-foreground pt-2 border-t flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        Verwerkt op: {new Date(enrichment.processed_at).toLocaleString('nl-NL', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}