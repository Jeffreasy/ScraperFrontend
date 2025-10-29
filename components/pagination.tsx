'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PaginationMeta } from '@/lib/types/api';
import {
  cn,
  flexPatterns,
  transitions,
  bodyText,
  gap,
  responsiveDisplay,
} from '@/lib/styles/theme';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  maxVisible?: number;
  size?: 'sm' | 'default' | 'lg';
}

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const paginationContainerVariants = cva(
  [flexPatterns.between, transitions.colors],
  {
    variants: {
      spacing: {
        compact: gap.xs,
        default: gap.sm,
        relaxed: gap.md,
      },
    },
    defaultVariants: {
      spacing: 'default',
    },
  }
);

const pageInfoVariants = cva(
  ['font-medium text-muted-foreground'],
  {
    variants: {
      size: {
        sm: bodyText.xs,
        default: bodyText.small,
        lg: bodyText.base,
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const pageButtonVariants = cva(
  ['min-w-[40px] transition-all duration-200'],
  {
    variants: {
      active: {
        true: 'ring-2 ring-primary ring-offset-2',
        false: '',
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

const ellipsisVariants = cva(
  ['inline-flex items-center justify-center min-w-[40px] px-3 py-2', bodyText.small],
  {
    variants: {
      variant: {
        default: 'text-muted-foreground',
        subtle: 'text-muted-foreground/50',
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

export function Pagination({
  meta,
  onPageChange,
  showFirstLast = false,
  maxVisible = 7,
  size = 'default',
}: PaginationProps) {
  const { current_page, total_pages, has_next, has_prev } = meta;

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];

    if (total_pages <= maxVisible) {
      for (let i = 1; i <= total_pages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (current_page > 3) {
        pages.push('...');
      }

      const start = Math.max(2, current_page - 1);
      const end = Math.min(total_pages - 1, current_page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current_page < total_pages - 2) {
        pages.push('...');
      }

      if (total_pages > 1) {
        pages.push(total_pages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={paginationContainerVariants()}>
      {/* Page Info */}
      <div className={pageInfoVariants({ size })}>
        <span className="hidden sm:inline">Pagina </span>
        <span className="font-semibold text-foreground">{current_page}</span>
        <span className="mx-1">/</span>
        <span className="font-semibold text-foreground">{total_pages}</span>
      </div>

      {/* Navigation Controls */}
      <nav
        className={cn(flexPatterns.start, gap.xs)}
        aria-label="Pagination"
        role="navigation"
      >
        {/* First Page Button */}
        {showFirstLast && (
          <Button
            variant="outline"
            size={size}
            onClick={() => onPageChange(1)}
            disabled={!has_prev}
            className={transitions.colors}
            aria-label="Eerste pagina"
            title="Ga naar eerste pagina"
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">Eerste pagina</span>
          </Button>
        )}

        {/* Previous Page Button */}
        <Button
          variant="outline"
          size={size}
          onClick={() => onPageChange(current_page - 1)}
          disabled={!has_prev}
          className={transitions.colors}
          aria-label="Vorige pagina"
          title="Ga naar vorige pagina"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">Vorige</span>
          <span className="sr-only sm:hidden">Vorige pagina</span>
        </Button>

        {/* Page Numbers */}
        <div className={cn('hidden sm:flex items-center', gap.xs)}>
          {pageNumbers.map((page, index) => (
            <PageButton
              key={index}
              page={page}
              currentPage={current_page}
              onPageChange={onPageChange}
              size={size}
            />
          ))}
        </div>

        {/* Next Page Button */}
        <Button
          variant="outline"
          size={size}
          onClick={() => onPageChange(current_page + 1)}
          disabled={!has_next}
          className={transitions.colors}
          aria-label="Volgende pagina"
          title="Ga naar volgende pagina"
        >
          <span className="hidden sm:inline mr-1">Volgende</span>
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only sm:hidden">Volgende pagina</span>
        </Button>

        {/* Last Page Button */}
        {showFirstLast && (
          <Button
            variant="outline"
            size={size}
            onClick={() => onPageChange(total_pages)}
            disabled={!has_next}
            className={transitions.colors}
            aria-label="Laatste pagina"
            title="Ga naar laatste pagina"
          >
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Laatste pagina</span>
          </Button>
        )}
      </nav>
    </div>
  );
}

// ============================================================================
// SUB COMPONENTS
// ============================================================================

interface PageButtonProps {
  page: number | string;
  currentPage: number;
  onPageChange: (page: number) => void;
  size?: 'sm' | 'default' | 'lg';
}

function PageButton({ page, currentPage, onPageChange, size = 'default' }: PageButtonProps) {
  // Ellipsis
  if (typeof page === 'string') {
    return (
      <span className={ellipsisVariants()} aria-hidden="true">
        {page}
      </span>
    );
  }

  // Page Number Button
  const isActive = page === currentPage;

  return (
    <Button
      variant={isActive ? 'default' : 'outline'}
      size={size}
      onClick={() => onPageChange(page)}
      className={pageButtonVariants({ active: isActive })}
      aria-label={`Ga naar pagina ${page}`}
      aria-current={isActive ? 'page' : undefined}
      title={`Pagina ${page}`}
    >
      {page}
    </Button>
  );
}

// ============================================================================
// COMPACT PAGINATION VARIANT
// ============================================================================

/**
 * Compact pagination voor mobiel of kleinere ruimtes
 */
export function PaginationCompact({ meta, onPageChange }: Pick<PaginationProps, 'meta' | 'onPageChange'>) {
  const { current_page, total_pages, has_next, has_prev } = meta;

  return (
    <div className={cn(flexPatterns.between, 'w-full')}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(current_page - 1)}
        disabled={!has_prev}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Vorige
      </Button>

      <span className={cn(bodyText.small, 'font-medium')}>
        {current_page} / {total_pages}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(current_page + 1)}
        disabled={!has_next}
      >
        Volgende
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { PaginationProps, PageButtonProps };
export {
  paginationContainerVariants,
  pageInfoVariants,
  pageButtonVariants,
  ellipsisVariants,
};