'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  cn,
  flexPatterns,
  spacing,
  gap,
  gridLayouts,
} from '@/lib/styles/theme';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ArticleSkeletonProps {
  showImage?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

interface ArticleListSkeletonProps {
  count?: number;
  columns?: 'auto' | 'two' | 'three' | 'four';
}

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const skeletonCardVariants = cva(
  ['overflow-hidden'],
  {
    variants: {
      variant: {
        default: '',
        compact: 'max-h-[400px]',
        detailed: 'min-h-[500px]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const skeletonGridVariants = cva(
  ['grid gap-6'],
  {
    variants: {
      columns: {
        auto: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        two: 'grid-cols-1 md:grid-cols-2',
        three: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        four: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      },
    },
    defaultVariants: {
      columns: 'auto',
    },
  }
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ArticleSkeleton({
  showImage = true,
  variant = 'default',
}: ArticleSkeletonProps = {}) {
  return (
    <Card className={skeletonCardVariants({ variant })}>
      {/* Image Skeleton */}
      {showImage && (
        <Skeleton className="h-48 w-full rounded-none" />
      )}

      {/* Header */}
      <CardHeader className="pb-3">
        <div className={cn(flexPatterns.between, 'mb-2', gap.sm)}>
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className={spacing.xs}>
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="pb-3">
        {/* Summary Lines */}
        <div className={spacing.xs}>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Keyword Tags */}
        <div className={cn('flex flex-wrap', gap.xs, 'mt-3')}>
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-6 w-14 rounded-md" />
        </div>

        {/* Optional: Stock Tickers (for detailed variant) */}
        {variant === 'detailed' && (
          <div className="mt-3 pt-3 border-t">
            <div className={cn('flex flex-wrap', gap.xs)}>
              <Skeleton className="h-7 w-16 rounded-md" />
              <Skeleton className="h-7 w-20 rounded-md" />
            </div>
          </div>
        )}
      </CardContent>

      {/* Footer */}
      <CardFooter className={cn(flexPatterns.between, 'pt-3 border-t')}>
        <div className={cn(flexPatterns.start, gap.md)}>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-16" />
      </CardFooter>
    </Card>
  );
}

// ============================================================================
// LIST SKELETON COMPONENT
// ============================================================================

export function ArticleListSkeleton({
  count = 6,
  columns = 'auto',
}: ArticleListSkeletonProps = {}) {
  return (
    <div className={skeletonGridVariants({ columns })}>
      {Array.from({ length: count }).map((_, i) => (
        <ArticleSkeleton key={i} />
      ))}
    </div>
  );
}

// ============================================================================
// COMPACT SKELETON VARIANTS
// ============================================================================

/**
 * Compact skeleton for list views or sidebars
 */
export function ArticleSkeletonCompact() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className={cn(flexPatterns.between, 'mb-1')}>
          <Skeleton className="h-4 w-14 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
      </CardHeader>
      <CardContent className="pt-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </CardContent>
    </Card>
  );
}

/**
 * Grid skeleton for compact list views
 */
export function ArticleCompactListSkeleton({
  count = 4,
}: { count?: number } = {}) {
  return (
    <div className={cn('flex flex-col', spacing.md)}>
      {Array.from({ length: count }).map((_, i) => (
        <ArticleSkeletonCompact key={i} />
      ))}
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  ArticleSkeletonProps,
  ArticleListSkeletonProps,
};

export {
  skeletonCardVariants,
  skeletonGridVariants,
};