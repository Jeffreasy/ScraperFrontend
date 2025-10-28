import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Calendar, User } from 'lucide-react';
import { Article } from '@/lib/types/api';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { formatRelativeTime, getSourceColor, truncateText } from '@/lib/utils';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
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