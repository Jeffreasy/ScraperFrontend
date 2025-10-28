'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Calendar, User, FileText } from 'lucide-react';
import { Article } from '@/lib/types/api';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatRelativeTime, getSourceColor, truncateText } from '@/lib/utils';
import { ContentScrapingModal } from '@/components/content-scraping-modal';
import { ArticleStockTickers } from '@/components/stock';
import { useArticleStockTickers } from '@/lib/hooks/use-article-stock-tickers';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
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
          {article.category && (
            <span className="text-xs text-muted-foreground">
              {article.category}
            </span>
          )}
        </div>

        <h3 className="text-xl font-semibold leading-tight line-clamp-2">
          {article.title}
        </h3>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {article.summary}
        </p>

        {/* Stock Tickers */}
        {hasTickers && (
          <div className="mt-3 pt-3 border-t">
            <ArticleStockTickers tickers={tickers} />
          </div>
        )}

        {article.keywords && article.keywords.length > 0 && (
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

        <div className="flex items-center gap-2">
          {article.content_extracted ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(true)}
                className="h-7 px-2 text-xs border-green-500/50 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
              >
                <FileText className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Content ✓</span>
                <span className="sm:hidden">✓</span>
              </Button>
              {article.content && article.content.length > 2000 && (
                <span
                  className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                  title="Waarschijnlijk via browser scraping (JavaScript content)"
                >
                  🌐
                </span>
              )}
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(true)}
              className="h-7 px-2 text-xs"
            >
              <FileText className="h-3 w-3 mr-1" />
              Scrape
            </Button>
          )}

          <Link
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Lees meer
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </CardFooter>

      <ContentScrapingModal
        article={article}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </Card>
  );
}