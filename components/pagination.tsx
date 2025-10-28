'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PaginationMeta } from '@/lib/types/api';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const { current_page, total_pages, has_next, has_prev } = meta;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

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

      pages.push(total_pages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="text-sm text-muted-foreground">
        Pagina {current_page} van {total_pages}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(current_page - 1)}
          disabled={!has_prev}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Vorige pagina</span>
        </Button>

        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <Button
              key={index}
              variant={page === current_page ? 'default' : 'outline'}
              size="sm"
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={typeof page !== 'number'}
              className="min-w-[40px]"
            >
              {page}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(current_page + 1)}
          disabled={!has_next}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Volgende pagina</span>
        </Button>
      </div>
    </div>
  );
}