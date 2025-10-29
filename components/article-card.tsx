'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  ExternalLink,
  Calendar,
  User,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Globe,
} from 'lucide-react';
import { Article } from '@/lib/types/api';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ContentScrapingModal } from '@/components/content-scraping-modal';
import { ArticleStockTickers } from '@/components/stock';
import { useArticleStockTickers } from '@/lib/hooks/use-article-stock-tickers';
import { useArticleAI } from '@/lib/hooks/use-article-ai';
import { SentimentBadge } from '@/components/ai/sentiment-badge';
import { EntityChip } from '@/components/ai/entity-chip';
import { KeywordTag } from '@/components/ai/keyword-tag';
import {
  cn,
  getSourceColor,
  flexPatterns,
  spacing,
  transitions,
  badgeStyles,
  gap,
  bodyText,
} from '@/lib/styles/theme';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ArticleCardProps {
  article: Article;
  showAI?: boolean;
  showScraping?: boolean;
  onEntityClick?: (entity: string, type: 'persons' | 'organizations' | 'locations') => void;
}

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const articleImageVariants = cva(
  ['relative w-full overflow-hidden bg-muted'],
  {
    variants: {
      size: {
        default: 'h-48',
        sm: 'h-40',
        lg: 'h-56',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const contentBadgeVariants = cva(
  ['inline-flex items-center gap-1', bodyText.xs, 'font-medium rounded-md px-2 py-1'],
  {
    variants: {
      variant: {
        extracted: [
          'border border-green-500/50',
          'text-green-700 dark:text-green-400',
          'bg-green-50 dark:bg-green-950/30',
          'hover:bg-green-100 dark:hover:bg-green-950/50',
        ],
        pending: [
          'border border-border',
          'text-muted-foreground',
          'hover:bg-accent',
        ],
      },
    },
    defaultVariants: {
      variant: 'pending',
    },
  }
);

const entitySectionVariants = cva(
  ['space-y-2'],
  {
    variants: {
      spacing: {
        compact: 'space-y-1.5',
        default: 'space-y-2',
        relaxed: 'space-y-3',
      },
    },
    defaultVariants: {
      spacing: 'default',
    },
  }
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Zojuist';
  if (diffMins < 60) return `${diffMins} min geleden`;
  if (diffHours < 24) return `${diffHours} uur geleden`;
  if (diffDays < 7) return `${diffDays} dag${diffDays > 1 ? 'en' : ''} geleden`;

  return date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: diffDays > 365 ? 'numeric' : undefined
  });
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ArticleCard({
  article,
  showAI = false,
  showScraping = true,
  onEntityClick,
}: ArticleCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(false);
  const { tickers, hasTickers } = useArticleStockTickers(article);
  const { data: ai, isLoading: aiLoading } = useArticleAI(article.id, showAI && aiExpanded);

  return (
    <Card variant="default" hover="lift" className="overflow-hidden">
      {/* Article Image */}
      {article.image_url && (
        <div className={articleImageVariants()}>
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            className={cn('object-cover', transitions.transform, 'hover:scale-105')}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Header */}
      <CardHeader className="pb-3">
        <div className={cn(flexPatterns.between, 'mb-2', gap.sm)}>
          {/* Source Badge */}
          <span className={cn(badgeStyles.base, getSourceColor(article.source))}>
            {article.source}
          </span>

          {/* Category & Sentiment */}
          <div className={cn(flexPatterns.start, gap.xs)}>
            {article.category && (
              <span className={cn(bodyText.xs, 'text-muted-foreground')}>
                {article.category}
              </span>
            )}
            {showAI && ai?.sentiment && (
              <SentimentBadge sentiment={ai.sentiment} showScore={false} />
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
      </CardHeader>

      {/* Content */}
      <CardContent className="pb-3">
        {/* Summary */}
        <p className={cn(bodyText.small, 'text-muted-foreground line-clamp-3')}>
          {showAI && ai?.summary ? ai.summary : article.summary}
        </p>

        {/* Stock Tickers */}
        {hasTickers && (
          <div className="mt-3 pt-3 border-t">
            <ArticleStockTickers tickers={tickers} />
          </div>
        )}

        {/* AI Categories */}
        {showAI && ai?.categories && Object.keys(ai.categories).length > 0 && (
          <div className={cn('flex flex-wrap', gap.xs, 'mt-3')}>
            {Object.entries(ai.categories)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 2)
              .map(([category, confidence]) => (
                <span
                  key={category}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full',
                    'bg-primary/10 px-2 py-0.5',
                    bodyText.xs,
                    'font-semibold text-primary',
                    transitions.colors,
                    'hover:bg-primary/20'
                  )}
                  title={`Confidence: ${(confidence * 100).toFixed(0)}%`}
                >
                  {category}
                </span>
              ))}
          </div>
        )}

        {/* Keywords Section */}
        <KeywordsSection article={article} ai={ai} showAI={showAI} />

        {/* AI Insights Toggle */}
        {showAI && (
          <AIInsightsSection
            aiExpanded={aiExpanded}
            setAiExpanded={setAiExpanded}
            aiLoading={aiLoading}
            ai={ai}
            onEntityClick={onEntityClick}
          />
        )}
      </CardContent>

      {/* Footer */}
      <CardFooter className={cn(flexPatterns.between, 'pt-3 border-t', gap.md)}>
        {/* Meta Information */}
        <div className={cn(flexPatterns.start, gap.md, bodyText.xs, 'text-muted-foreground')}>
          <div className={cn(flexPatterns.start, gap.xs)}>
            <Calendar className="h-3 w-3" />
            <span>{formatRelativeTime(article.published)}</span>
          </div>
          {article.author && (
            <div className={cn(flexPatterns.start, gap.xs)}>
              <User className="h-3 w-3" />
              <span className="hidden sm:inline">{truncateText(article.author, 20)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={cn(flexPatterns.start, gap.xs)}>
          {showScraping && (
            <ScrapingControls
              article={article}
              setModalOpen={setModalOpen}
            />
          )}

          <Link
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-1',
              bodyText.xs,
              'font-medium text-primary',
              transitions.colors,
              'hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm'
            )}
          >
            Lees meer
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </CardFooter>

      {/* Scraping Modal */}
      {showScraping && (
        <ContentScrapingModal
          article={article}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </Card>
  );
}

// ============================================================================
// SUB COMPONENTS
// ============================================================================

interface KeywordsSectionProps {
  article: Article;
  ai: any;
  showAI: boolean;
}

function KeywordsSection({ article, ai, showAI }: KeywordsSectionProps) {
  if (showAI && ai?.keywords && ai.keywords.length > 0) {
    return (
      <div className={cn('flex flex-wrap', gap.xs, 'mt-3')}>
        {ai.keywords.slice(0, 5).map((kw: any) => (
          <KeywordTag key={kw.word} keyword={kw.word} score={kw.score} />
        ))}
      </div>
    );
  }

  if (article.keywords && article.keywords.length > 0) {
    return (
      <div className={cn('flex flex-wrap', gap.xs, 'mt-3')}>
        {article.keywords.slice(0, 4).map((keyword, index) => (
          <span
            key={index}
            className={cn(
              'inline-flex items-center rounded-md',
              'bg-secondary px-2 py-1',
              bodyText.xs,
              'font-medium text-secondary-foreground',
              transitions.colors,
              'hover:bg-secondary/80'
            )}
          >
            {keyword}
          </span>
        ))}
        {article.keywords.length > 4 && (
          <span
            className={cn(
              'inline-flex items-center rounded-md',
              'bg-secondary px-2 py-1',
              bodyText.xs,
              'font-medium text-secondary-foreground'
            )}
          >
            +{article.keywords.length - 4}
          </span>
        )}
      </div>
    );
  }

  return null;
}

interface AIInsightsSectionProps {
  aiExpanded: boolean;
  setAiExpanded: (value: boolean) => void;
  aiLoading: boolean;
  ai: any;
  onEntityClick?: (entity: string, type: 'persons' | 'organizations' | 'locations') => void;
}

function AIInsightsSection({
  aiExpanded,
  setAiExpanded,
  aiLoading,
  ai,
  onEntityClick,
}: AIInsightsSectionProps) {
  return (
    <div className="mt-3">
      <Button
        variant="ghost"
        size="sm"
        className={cn('w-full', bodyText.xs)}
        onClick={() => setAiExpanded(!aiExpanded)}
      >
        <Sparkles className="h-3 w-3 mr-1" />
        {aiExpanded ? 'Hide' : 'Show'} AI Insights
        {aiExpanded ? (
          <ChevronUp className="h-3 w-3 ml-1" />
        ) : (
          <ChevronDown className="h-3 w-3 ml-1" />
        )}
      </Button>

      {aiExpanded && (
        <div className={cn('mt-3 pt-3 border-t', entitySectionVariants())}>
          {aiLoading ? (
            <div className={spacing.xs}>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : ai?.entities ? (
            <EntitiesDisplay entities={ai.entities} onEntityClick={onEntityClick} />
          ) : (
            <p className={cn(bodyText.xs, 'text-muted-foreground')}>
              AI analysis not yet available
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface EntitiesDisplayProps {
  entities: {
    persons?: string[];
    organizations?: string[];
    locations?: string[];
  };
  onEntityClick?: (entity: string, type: 'persons' | 'organizations' | 'locations') => void;
}

function EntitiesDisplay({ entities, onEntityClick }: EntitiesDisplayProps) {
  return (
    <>
      {entities.persons && entities.persons.length > 0 && (
        <div>
          <h4 className={cn(bodyText.xs, 'font-semibold mb-1.5')}>People</h4>
          <div className={cn('flex flex-wrap', gap.xs)}>
            {entities.persons.slice(0, 3).map((person) => (
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

      {entities.organizations && entities.organizations.length > 0 && (
        <div>
          <h4 className={cn(bodyText.xs, 'font-semibold mb-1.5')}>Organizations</h4>
          <div className={cn('flex flex-wrap', gap.xs)}>
            {entities.organizations.slice(0, 3).map((org) => (
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

      {entities.locations && entities.locations.length > 0 && (
        <div>
          <h4 className={cn(bodyText.xs, 'font-semibold mb-1.5')}>Locations</h4>
          <div className={cn('flex flex-wrap', gap.xs)}>
            {entities.locations.slice(0, 3).map((location) => (
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
  );
}

interface ScrapingControlsProps {
  article: Article;
  setModalOpen: (value: boolean) => void;
}

function ScrapingControls({ article, setModalOpen }: ScrapingControlsProps) {
  if (article.content_extracted) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setModalOpen(true)}
          className={cn(contentBadgeVariants({ variant: 'extracted' }), 'h-7')}
        >
          <FileText className="h-3 w-3 mr-1" />
          <span className="hidden sm:inline">Content ✓</span>
          <span className="sm:hidden">✓</span>
        </Button>
        {article.content && article.content.length > 2000 && (
          <span
            className={cn(
              'hidden md:inline-flex items-center px-1.5 py-0.5 rounded',
              'text-[10px] font-medium',
              'bg-purple-100 dark:bg-purple-950/30',
              'text-purple-700 dark:text-purple-300',
              'border border-purple-200 dark:border-purple-800'
            )}
            title="Waarschijnlijk via browser scraping (JavaScript content)"
          >
            <Globe className="h-3 w-3" />
          </span>
        )}
      </>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setModalOpen(true)}
      className={cn(contentBadgeVariants({ variant: 'pending' }), 'h-7')}
    >
      <FileText className="h-3 w-3 mr-1" />
      Scrape
    </Button>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { ArticleCardProps };
export { articleImageVariants, contentBadgeVariants, entitySectionVariants };