'use client';

import { useQuery } from '@tanstack/react-query';
import { cva, type VariantProps } from 'class-variance-authority';
import { X, Calendar, Tag, Filter as FilterIcon } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { ArticleFilters } from '@/lib/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  cn,
  flexPatterns,
  spacing,
  transitions,
  bodyText,
  gap,
  gridLayouts,
} from '@/lib/styles/theme';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ArticleFiltersPanelProps {
  filters: ArticleFilters;
  onFilterChange: (filters: Partial<ArticleFilters>) => void;
}

interface FilterButtonProps {
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  count?: number;
}

interface FilterSectionProps {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const filterSectionVariants = cva(
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

const filterGridVariants = cva(
  ['grid gap-2'],
  {
    variants: {
      columns: {
        auto: 'grid-cols-[repeat(auto-fit,minmax(120px,1fr))]',
        two: 'grid-cols-2',
        responsive: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
        full: 'grid-cols-1',
      },
    },
    defaultVariants: {
      columns: 'responsive',
    },
  }
);

const filterLabelVariants = cva(
  ['font-medium flex items-center gap-1.5'],
  {
    variants: {
      size: {
        sm: 'text-xs',
        default: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ArticleFiltersPanel({
  filters,
  onFilterChange,
}: ArticleFiltersPanelProps) {
  // Fetch sources
  const { data: sourcesData, isLoading: sourcesLoading } = useQuery({
    queryKey: ['sources'],
    queryFn: () => apiClient.getSources(),
  });

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
  });

  const sources = sourcesData?.success ? sourcesData.data : [];
  const categories = categoriesData?.success ? categoriesData.data : [];

  const handleReset = () => {
    onFilterChange({
      source: undefined,
      category: undefined,
      keyword: undefined,
      start_date: undefined,
      end_date: undefined,
    });
  };

  const hasActiveFilters =
    filters.source ||
    filters.category ||
    filters.keyword ||
    filters.start_date ||
    filters.end_date;

  const activeFilterCount = [
    filters.source,
    filters.category,
    filters.keyword,
    filters.start_date,
    filters.end_date,
  ].filter(Boolean).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className={flexPatterns.between}>
          <div className={cn(flexPatterns.start, gap.sm)}>
            <CardTitle className="text-lg">Filters</CardTitle>
            {activeFilterCount > 0 && (
              <span
                className={cn(
                  'inline-flex items-center justify-center',
                  'h-5 w-5 rounded-full',
                  'bg-primary text-primary-foreground',
                  bodyText.xs,
                  'font-semibold'
                )}
              >
                {activeFilterCount}
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className={cn(transitions.colors, 'hover:text-destructive')}
            >
              <X className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className={spacing.md}>
        {/* Source Filter */}
        <FilterSection label="Nieuwsbron" icon={<Tag className="h-3.5 w-3.5" />}>
          <div className={filterGridVariants({ columns: 'responsive' })}>
            <FilterButton
              isActive={!filters.source}
              onClick={() => onFilterChange({ source: undefined })}
            >
              Alle bronnen
            </FilterButton>
            {sources?.map((source) => (
              <FilterButton
                key={source.name}
                isActive={filters.source === source.name}
                onClick={() => onFilterChange({ source: source.name })}
                disabled={!source.is_active}
              >
                {source.name}
              </FilterButton>
            ))}
          </div>
        </FilterSection>

        {/* Category Filter */}
        <FilterSection label="Categorie" icon={<FilterIcon className="h-3.5 w-3.5" />}>
          <div className={filterGridVariants({ columns: 'responsive' })}>
            <FilterButton
              isActive={!filters.category}
              onClick={() => onFilterChange({ category: undefined })}
            >
              Alle categorieën
            </FilterButton>
            {categories?.map((category) => (
              <FilterButton
                key={category.name}
                isActive={filters.category === category.name}
                onClick={() => onFilterChange({ category: category.name })}
                count={category.article_count}
              >
                {category.name}
              </FilterButton>
            ))}
          </div>
        </FilterSection>

        {/* Keyword Filter */}
        <FilterSection label="Keyword">
          <Input
            type="text"
            placeholder="Zoek op keyword..."
            value={filters.keyword || ''}
            onChange={(e) => onFilterChange({ keyword: e.target.value || undefined })}
            className={transitions.colors}
          />
        </FilterSection>

        {/* Date Range Filter */}
        <FilterSection label="Datum periode" icon={<Calendar className="h-3.5 w-3.5" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DateInput
              label="Van datum"
              value={filters.start_date}
              onChange={(date) => onFilterChange({ start_date: date })}
            />
            <DateInput
              label="Tot datum"
              value={filters.end_date}
              onChange={(date) => onFilterChange({ end_date: date })}
            />
          </div>
        </FilterSection>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// SUB COMPONENTS
// ============================================================================

function FilterSection({ label, icon, children }: FilterSectionProps) {
  return (
    <div className={filterSectionVariants()}>
      <label className={filterLabelVariants()}>
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}

function FilterButton({
  isActive,
  onClick,
  disabled,
  children,
  count,
}: FilterButtonProps) {
  return (
    <Button
      variant={isActive ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'justify-start',
        transitions.colors,
        'relative',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span className={cn('flex-1 text-left', count && 'mr-2')}>
        {children}
      </span>
      {count !== undefined && (
        <span
          className={cn(
            'ml-auto',
            bodyText.xs,
            isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}
        >
          {count}
        </span>
      )}
    </Button>
  );
}

interface DateInputProps {
  label: string;
  value?: string;
  onChange: (date: string | undefined) => void;
}

function DateInput({ label, value, onChange }: DateInputProps) {
  return (
    <div className={filterSectionVariants({ spacing: 'compact' })}>
      <label className={cn(filterLabelVariants({ size: 'sm' }), 'text-muted-foreground')}>
        {label}
      </label>
      <Input
        type="date"
        value={value?.split('T')[0] || ''}
        onChange={(e) => {
          const date = e.target.value
            ? new Date(e.target.value).toISOString()
            : undefined;
          onChange(date);
        }}
        className={transitions.colors}
      />
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { ArticleFiltersPanelProps, FilterButtonProps, FilterSectionProps };
export {
  filterSectionVariants,
  filterGridVariants,
  filterLabelVariants,
};