'use client';

import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { ArticleFilters } from '@/lib/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ArticleFiltersPanelProps {
  filters: ArticleFilters;
  onFilterChange: (filters: Partial<ArticleFilters>) => void;
}

export function ArticleFiltersPanel({
  filters,
  onFilterChange,
}: ArticleFiltersPanelProps) {
  // Fetch sources
  const { data: sourcesData } = useQuery({
    queryKey: ['sources'],
    queryFn: () => apiClient.getSources(),
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <X className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Source Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Nieuwsbron</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            <Button
              variant={!filters.source ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange({ source: undefined })}
              className="justify-start"
            >
              Alle bronnen
            </Button>
            {sources?.map((source) => (
              <Button
                key={source.name}
                variant={filters.source === source.name ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFilterChange({ source: source.name })}
                className="justify-start"
                disabled={!source.is_active}
              >
                {source.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Categorie</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            <Button
              variant={!filters.category ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange({ category: undefined })}
              className="justify-start"
            >
              Alle categorieën
            </Button>
            {categories?.map((category) => (
              <Button
                key={category.name}
                variant={filters.category === category.name ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFilterChange({ category: category.name })}
                className="justify-start"
              >
                {category.name}
                <span className="ml-auto text-xs text-muted-foreground">
                  {category.article_count}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Keyword Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Keyword</label>
          <Input
            type="text"
            placeholder="Filter op keyword..."
            value={filters.keyword || ''}
            onChange={(e) => onFilterChange({ keyword: e.target.value || undefined })}
          />
        </div>

        {/* Date Range Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Van datum</label>
            <Input
              type="date"
              value={filters.start_date?.split('T')[0] || ''}
              onChange={(e) => {
                const date = e.target.value
                  ? new Date(e.target.value).toISOString()
                  : undefined;
                onFilterChange({ start_date: date });
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tot datum</label>
            <Input
              type="date"
              value={filters.end_date?.split('T')[0] || ''}
              onChange={(e) => {
                const date = e.target.value
                  ? new Date(e.target.value).toISOString()
                  : undefined;
                onFilterChange({ end_date: date });
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}