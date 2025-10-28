'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Calendar, User, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Article } from '@/lib/types/api';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { formatRelativeTime, getSourceColor, truncateText } from '@/lib/utils';
import { useArticleAI } from '@/lib/hooks/use-article-ai';
import { SentimentBadge } from './ai/sentiment-badge';
import { EntityChip } from './ai/entity-chip';
import { KeywordTag } from './ai/keyword-tag';
import { Button } from './ui/button';
import { useState } from 'react';
import { Skeleton } from './ui/skeleton';
import { ArticleStockTickers } from './stock';
import { useArticleStockTickers } from '@/lib/hooks/use-article-stock-tickers';

interface ArticleCardEnhancedProps {
    article: Article;
    showAI?: boolean;
    onEntityClick?: (entity: string, type: 'persons' | 'organizations' | 'locations') => void;
}

export function ArticleCardEnhanced({ article, showAI = true, onEntityClick }: ArticleCardEnhancedProps) {
    const [aiExpanded, setAiExpanded] = useState(false);
    const { data: ai, isLoading: aiLoading } = useArticleAI(article.id, showAI && aiExpanded);
    const { tickers, hasTickers } = useArticleStockTickers(article);

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            {article.image_url && (
                <div className="relative h-48 w-full overflow-hidden">
                    <Image
                        src={article.image_url}
                        alt={article.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                        }}
                    />
                </div>
            )}

            <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getSourceColor(
                            article.source
                        )}`}
                    >
                        {article.source}
                    </span>
                    <div className="flex items-center gap-2">
                        {article.category && (
                            <span className="text-xs text-muted-foreground">
                                {article.category}
                            </span>
                        )}
                        {ai?.sentiment && (
                            <SentimentBadge sentiment={ai.sentiment} showScore={false} />
                        )}
                    </div>
                </div>

                <h3 className="text-xl font-semibold leading-tight line-clamp-2">
                    {article.title}
                </h3>
            </CardHeader>

            <CardContent className="pb-3">
                <p className="text-sm text-muted-foreground line-clamp-3">
                    {ai?.summary || article.summary}
                </p>

                {/* Stock Tickers */}
                {hasTickers && (
                    <div className="mt-3 pt-3 border-t">
                        <ArticleStockTickers tickers={tickers} />
                    </div>
                )}

                {/* AI Categories */}
                {ai?.categories && Object.keys(ai.categories).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {Object.entries(ai.categories)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 2)
                            .map(([category, confidence]) => (
                                <span
                                    key={category}
                                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"
                                    title={`Confidence: ${(confidence * 100).toFixed(0)}%`}
                                >
                                    {category}
                                </span>
                            ))}
                    </div>
                )}

                {/* Original Keywords or AI Keywords */}
                {ai?.keywords && ai.keywords.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {ai.keywords.slice(0, 5).map((kw) => (
                            <KeywordTag key={kw.word} keyword={kw.word} score={kw.score} />
                        ))}
                    </div>
                ) : article.keywords && article.keywords.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {article.keywords.slice(0, 4).map((keyword, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground"
                            >
                                {keyword}
                            </span>
                        ))}
                        {article.keywords.length > 4 && (
                            <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                                +{article.keywords.length - 4}
                            </span>
                        )}
                    </div>
                ) : null}

                {/* AI Insights Toggle */}
                {showAI && (
                    <div className="mt-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => setAiExpanded(!aiExpanded)}
                        >
                            <Sparkles className="h-3 w-3 mr-1" />
                            {aiExpanded ? 'Hide' : 'Show'} AI Insights
                            {aiExpanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                        </Button>

                        {aiExpanded && (
                            <div className="mt-3 space-y-3 pt-3 border-t">
                                {aiLoading ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                ) : ai?.entities ? (
                                    <>
                                        {/* Entities */}
                                        {ai.entities.persons && ai.entities.persons.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-semibold mb-1.5">People</h4>
                                                <div className="flex flex-wrap gap-1">
                                                    {ai.entities.persons.slice(0, 3).map((person) => (
                                                        <EntityChip
                                                            key={person}
                                                            name={person}
                                                            type="persons"
                                                            onClick={onEntityClick ? () => onEntityClick(person, 'persons') : undefined}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {ai.entities.organizations && ai.entities.organizations.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-semibold mb-1.5">Organizations</h4>
                                                <div className="flex flex-wrap gap-1">
                                                    {ai.entities.organizations.slice(0, 3).map((org) => (
                                                        <EntityChip
                                                            key={org}
                                                            name={org}
                                                            type="organizations"
                                                            onClick={onEntityClick ? () => onEntityClick(org, 'organizations') : undefined}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {ai.entities.locations && ai.entities.locations.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-semibold mb-1.5">Locations</h4>
                                                <div className="flex flex-wrap gap-1">
                                                    {ai.entities.locations.slice(0, 3).map((location) => (
                                                        <EntityChip
                                                            key={location}
                                                            name={location}
                                                            type="locations"
                                                            onClick={onEntityClick ? () => onEntityClick(location, 'locations') : undefined}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        AI analysis not yet available
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatRelativeTime(article.published)}</span>
                    </div>
                    {article.author && (
                        <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{truncateText(article.author, 20)}</span>
                        </div>
                    )}
                </div>

                <Link
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                    Lees meer
                    <ExternalLink className="h-3 w-3" />
                </Link>
            </CardFooter>
        </Card>
    );
}