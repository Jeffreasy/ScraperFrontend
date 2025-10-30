'use client';

import { useState } from 'react';
import { ExternalLink, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useRelatedArticlesByEntity, useRelatedArticlesByTicker } from '@/lib/hooks/use-related-articles';
import { cn, bodyText, gap } from '@/lib/styles/theme';
import type { Article } from '@/lib/types/api';

interface RelatedArticlesSectionProps {
    entityName?: string;
    entityType?: 'entity' | 'ticker';
    label?: string;
    className?: string;
}

export function RelatedArticlesSection({
    entityName,
    entityType = 'entity',
    label,
    className,
}: RelatedArticlesSectionProps) {
    const [open, setOpen] = useState(false);

    if (!entityName) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <RelatedArticlesTrigger
                    entityName={entityName}
                    entityType={entityType}
                    label={label}
                    className={className}
                />
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        Gerelateerde artikelen: {entityName}
                    </DialogTitle>
                    <DialogDescription>
                        Artikelen die {entityName} vermelden
                    </DialogDescription>
                </DialogHeader>
                <RelatedArticlesList
                    entityName={entityName}
                    entityType={entityType}
                    onArticleClick={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}

interface RelatedArticlesTriggerProps {
    entityName: string;
    entityType: 'entity' | 'ticker';
    label?: string;
    className?: string;
}

function RelatedArticlesTrigger({
    entityName,
    entityType,
    label,
    className,
}: RelatedArticlesTriggerProps) {
    // Gebruik de juiste hook op basis van type
    const entityQuery = useRelatedArticlesByEntity(entityName, {
        enabled: entityType === 'entity',
        limit: 1,
    });

    const tickerQuery = useRelatedArticlesByTicker(entityName, {
        enabled: entityType === 'ticker',
        limit: 1,
    });

    const query = entityType === 'entity' ? entityQuery : tickerQuery;
    const count = query.data?.pagination?.total || 0;

    if (query.isLoading) {
        return <Skeleton className="h-8 w-32" />;
    }

    if (count === 0) {
        return null;
    }

    return (
        <Button
            variant="outline"
            size="sm"
            className={cn('gap-1.5', className)}
        >
            <span className={bodyText.xs}>
                {label || `${count} gerelateerd${count !== 1 ? 'e' : ''} artikel${count !== 1 ? 'en' : ''}`}
            </span>
            <ChevronRight className="h-3 w-3" />
        </Button>
    );
}

interface RelatedArticlesListProps {
    entityName: string;
    entityType: 'entity' | 'ticker';
    onArticleClick?: () => void;
}

function RelatedArticlesList({
    entityName,
    entityType,
    onArticleClick,
}: RelatedArticlesListProps) {
    const entityQuery = useRelatedArticlesByEntity(entityName, {
        enabled: entityType === 'entity',
        limit: 20,
    });

    const tickerQuery = useRelatedArticlesByTicker(entityName, {
        enabled: entityType === 'ticker',
        limit: 20,
    });

    const query = entityType === 'entity' ? entityQuery : tickerQuery;

    if (query.isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                ))}
            </div>
        );
    }

    if (query.error) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <p>Kon gerelateerde artikelen niet laden</p>
            </div>
        );
    }

    const articles = query.data?.articles || [];

    if (articles.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <p>Geen gerelateerde artikelen gevonden</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {articles.map((article) => (
                <RelatedArticleCard
                    key={article.id}
                    article={article}
                    onClick={onArticleClick}
                />
            ))}
        </div>
    );
}

interface RelatedArticleCardProps {
    article: Article;
    onClick?: () => void;
}

function RelatedArticleCard({ article, onClick }: RelatedArticleCardProps) {
    const handleClick = () => {
        window.open(article.url, '_blank', 'noopener,noreferrer');
        onClick?.();
    };

    return (
        <button
            onClick={handleClick}
            className={cn(
                'w-full text-left p-3 rounded-lg border',
                'hover:bg-accent hover:border-primary/50',
                'transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-ring'
            )}
        >
            <div className="space-y-2">
                {/* Title */}
                <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary">
                    {article.title}
                </h4>

                {/* Meta info */}
                <div className={cn('flex items-center justify-between', bodyText.xs, 'text-muted-foreground')}>
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{article.source}</span>
                        <span>•</span>
                        <time>{new Date(article.published).toLocaleDateString('nl-NL')}</time>
                    </div>
                    <ExternalLink className="h-3 w-3 opacity-50" />
                </div>

                {/* Summary */}
                {article.summary && (
                    <p className={cn(bodyText.xs, 'text-muted-foreground line-clamp-2')}>
                        {article.summary}
                    </p>
                )}

                {/* AI Sentiment if available */}
                {article.ai_sentiment && (
                    <div className="flex items-center gap-2">
                        <span
                            className={cn(
                                'px-2 py-0.5 rounded text-[10px] font-medium',
                                article.ai_sentiment === 'positive' && 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
                                article.ai_sentiment === 'negative' && 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
                                article.ai_sentiment === 'neutral' && 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                            )}
                        >
                            {article.ai_sentiment === 'positive' ? '😊 Positief' :
                                article.ai_sentiment === 'negative' ? '😟 Negatief' :
                                    '😐 Neutraal'}
                        </span>
                    </div>
                )}
            </div>
        </button>
    );
}

/**
 * Compact variant voor in article cards
 */
interface CompactRelatedArticlesProps {
    entityName?: string;
    entityType?: 'entity' | 'ticker';
    className?: string;
}

export function CompactRelatedArticles({
    entityName,
    entityType = 'entity',
    className,
}: CompactRelatedArticlesProps) {
    if (!entityName) {
        return null;
    }

    return (
        <RelatedArticlesSection
            entityName={entityName}
            entityType={entityType}
            className={className}
        />
    );
}