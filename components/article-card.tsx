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
import { ArticleStockTickers, ArticleStockTickersEnhanced } from '@/components/stock';
import { useArticleStockTickers } from '@/lib/hooks/use-article-stock-tickers';
import { useArticleAI } from '@/lib/hooks/use-article-ai';
import { useBatchStockQuotes } from '@/lib/hooks/use-batch-stock-quotes';
import { SentimentBadge } from '@/components/ai/sentiment-badge';
import { EntityChip } from '@/components/ai/entity-chip';
import { KeywordTag } from '@/components/ai/keyword-tag';
import { TrendingBadge, TrendingIndicator } from '@/components/article';
import { EnhancedSourceBadge } from '@/components/article';
import { CompactRelatedArticles } from '@/components/article';
import { CompactSentimentTimeline } from '@/components/article';
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
  size?: 'compact' | 'default' | 'large';
  showAI?: boolean;
  showScraping?: boolean;
  showEnhancedStocks?: boolean; // NEW: Enable enhanced stock features
  onEntityClick?: (entity: string, type: 'persons' | 'organizations' | 'locations') => void;
}

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const articleCardVariants = cva(
  ['overflow-hidden'],
  {
    variants: {
      size: {
        compact: '',
        default: '',
        large: '',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const articleImageVariants = cva(
  ['relative w-full overflow-hidden bg-muted'],
  {
    variants: {
      size: {
        compact: 'h-32',
        default: 'h-48',
        large: 'h-64',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const articleTitleVariants = cva(
  ['font-semibold leading-tight group-hover:text-primary transition-colors'],
  {
    variants: {
      size: {
        compact: 'text-base line-clamp-2',
        default: 'text-xl line-clamp-2',
        large: 'text-2xl line-clamp-3',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const articleSummaryVariants = cva(
  ['text-muted-foreground'],
  {
    variants: {
      size: {
        compact: 'text-xs line-clamp-2',
        default: 'text-sm line-clamp-3',
        large: 'text-base line-clamp-4',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const articlePaddingVariants = cva(
  [],
  {
    variants: {
      size: {
        compact: 'p-3',
        default: 'p-6',
        large: 'p-8',
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
  size = 'default',
  showAI = false,
  showScraping = true,
  showEnhancedStocks = false,
  onEntityClick,
}: ArticleCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(false);
  const { tickers, hasTickers } = useArticleStockTickers(article);
  const { data: ai, isLoading: aiLoading } = useArticleAI(article.id, showAI && aiExpanded);

  // NEW: Gebruik batch stock quotes voor betere performance
  const tickerSymbols = tickers.map(t => typeof t === 'string' ? t : t.symbol);
  const { data: stockQuotes } = useBatchStockQuotes(tickerSymbols);

  return (
    <Card variant="default" hover="lift" className={articleCardVariants({ size })}>
      {/* NEW: Trending indicator */}
      {size !== 'compact' && (
        <div className="absolute top-2 right-2 z-10">
          <TrendingBadge keywords={article.keywords} variant="icon" />
        </div>
      )}
      {/* Article Image */}
      {article.image_url && (
        <div className={articleImageVariants({ size })}>
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
      <CardHeader className={cn(articlePaddingVariants({ size }), size === 'compact' ? 'pb-2' : 'pb-3')}>
        <div className={cn(flexPatterns.between, size === 'compact' ? 'mb-1.5' : 'mb-2', gap.sm)}>
          {/* ENHANCED: Source Badge with stats tooltip */}
          <EnhancedSourceBadge source={article.source} />

          {/* Category & Sentiment */}
          <div className={cn(flexPatterns.start, gap.xs)}>
            {article.category && (
              <span className={cn(bodyText.xs, 'text-muted-foreground')}>
                {article.category}
              </span>
            )}
            {showAI && ai?.ai_sentiment && (
              <SentimentBadge sentiment={ai.ai_sentiment} showScore={false} />
            )}
            {/* NEW: Trending indicator in header */}
            {size !== 'compact' && (
              <TrendingIndicator keywords={article.keywords} />
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className={articleTitleVariants({ size })}>
          {article.title}
        </h3>
      </CardHeader>

      {/* Content */}
      <CardContent className={cn(articlePaddingVariants({ size }), size === 'compact' ? 'pb-2' : 'pb-3')}>
        {/* Summary */}
        <p className={articleSummaryVariants({ size })}>
          {showAI && ai?.ai_summary ? ai.ai_summary : article.summary}
        </p>

        {/* ENHANCED: Stock Tickers with batch quotes */}
        {hasTickers && size !== 'compact' && (
          <div className={cn(size === 'large' ? 'mt-4 pt-4' : 'mt-3 pt-3', 'border-t')}>
            {showEnhancedStocks && size === 'large' ? (
              <ArticleStockTickersEnhanced
                tickers={tickers}
                showCharts={true}
                showMetrics={aiExpanded}
                variant="enhanced"
              />
            ) : (
              <ArticleStockTickers tickers={tickers} />
            )}
            {/* NEW: Show related articles for first ticker */}
            {tickerSymbols.length > 0 && size === 'large' && !showEnhancedStocks && (
              <div className="mt-2">
                <CompactRelatedArticles
                  entityName={tickerSymbols[0]}
                  entityType="ticker"
                />
              </div>
            )}
          </div>
        )}

        {/* AI Categories */}
        {showAI && ai?.ai_category && size !== 'compact' && (
          <div className={cn('flex flex-wrap', gap.xs, size === 'large' ? 'mt-4' : 'mt-3')}>
            {[ai.ai_category].map((category) => (
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
              >
                {category}
              </span>
            ))}
          </div>
        )}

        {/* Keywords Section */}
        {size !== 'compact' && <KeywordsSection article={article} ai={ai} showAI={showAI} />}

        {/* AI Insights Toggle */}
        {showAI && size !== 'compact' && (
          <AIInsightsSection
            aiExpanded={aiExpanded}
            setAiExpanded={setAiExpanded}
            aiLoading={aiLoading}
            ai={ai}
            onEntityClick={onEntityClick}
          />
        )}

        {/* NEW: Related articles for first entity */}
        {size === 'large' && ai?.ai_entities && ai.ai_entities.length > 0 && (
          <div className="mt-3">
            <CompactRelatedArticles
              entityName={ai.ai_entities[0].entity}
              entityType="entity"
            />
          </div>
        )}
      </CardContent>

      {/* Footer */}
      <CardFooter className={cn(
        articlePaddingVariants({ size }),
        flexPatterns.between,
        size === 'compact' ? 'pt-2' : 'pt-3',
        'border-t',
        gap.md
      )}>
        {/* Meta Information */}
        <div className={cn(
          flexPatterns.start,
          size === 'compact' ? gap.xs : gap.md,
          size === 'compact' ? 'text-[10px]' : bodyText.xs,
          'text-muted-foreground'
        )}>
          <div className={cn(flexPatterns.start, gap.xs)}>
            <Calendar className="h-3 w-3" />
            <span>{formatRelativeTime(article.published)}</span>
          </div>
          {article.author && size !== 'compact' && (
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
        {ai.keywords.slice(0, 4).map((kw: any) => (
          <KeywordTag key={kw.word} keyword={kw.word} score={kw.score} />
        ))}
      </div>
    );
  }

  if (article.keywords && article.keywords.length > 0) {
    return (
      <div className={cn('flex flex-wrap', gap.xs, 'mt-3')}>
        {article.keywords.slice(0, 3).map((keyword, index) => (
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
        {article.keywords.length > 3 && (
          <span
            className={cn(
              'inline-flex items-center rounded-md',
              'bg-secondary px-2 py-1',
              bodyText.xs,
              'font-medium text-secondary-foreground'
            )}
          >
            +{article.keywords.length - 3}
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
          <div className={cn(flexPatterns.between, 'mb-1.5')}>
            <h4 className={cn(bodyText.xs, 'font-semibold')}>People</h4>
            {entities.persons[0] && (
              <CompactSentimentTimeline entityName={entities.persons[0]} days={7} />
            )}
          </div>
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
export {
  articleCardVariants,
  articleImageVariants,
  articleTitleVariants,
  articleSummaryVariants,
  articlePaddingVariants,
  contentBadgeVariants,
  entitySectionVariants
};