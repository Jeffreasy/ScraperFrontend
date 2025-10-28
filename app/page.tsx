'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, SortAsc } from 'lucide-react';
import { advancedApiClient } from '@/lib/api/advanced-client';
import { ArticleFilters, SortBy, SortOrder } from '@/lib/types/api';
import { STALE_TIMES } from '@/components/providers';
import { ArticleCard } from '@/components/article-card';
import { ArticleListSkeleton } from '@/components/article-skeleton';
import { Pagination } from '@/components/pagination';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { debounce } from '@/lib/utils';
import { ArticleFiltersPanel } from '@/components/article-filters';

const ITEMS_PER_PAGE = 20;

export default function HomePage() {
    const searchParams = useSearchParams();
    const urlSearch = searchParams.get('search') || '';

    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState(urlSearch);
    const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<ArticleFilters>({
        limit: ITEMS_PER_PAGE,
        offset: 0,
        sort_by: 'published' as SortBy,
        sort_order: 'desc' as SortOrder,
    });

    // Update search when URL parameter changes
    useEffect(() => {
        const urlSearch = searchParams.get('search') || '';
        if (urlSearch && urlSearch !== searchQuery) {
            setSearchQuery(urlSearch);
            setDebouncedSearch(urlSearch);
            setPage(1);
        }
    }, [searchParams]);

    // Debounced search handler
    const handleSearchChange = debounce((value: string) => {
        setDebouncedSearch(value);
        setPage(1);
    }, 300);

    // Fetch articles
    const { data, isLoading, error } = useQuery({
        queryKey: ['articles', page, debouncedSearch, filters],
        queryFn: async () => {
            const currentFilters: ArticleFilters = {
                ...filters,
                offset: (page - 1) * ITEMS_PER_PAGE,
            };

            if (debouncedSearch) {
                return advancedApiClient.searchArticles({
                    q: debouncedSearch,
                    ...currentFilters,
                });
            }

            return advancedApiClient.getArticles(currentFilters);
        },
        staleTime: STALE_TIMES.articles,
    });

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFilterChange = (newFilters: Partial<ArticleFilters>) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
        setPage(1);
    };

    const handleSortChange = (sortBy: SortBy) => {
        const newSortOrder: SortOrder =
            filters.sort_by === sortBy && filters.sort_order === 'desc' ? 'asc' : 'desc';

        setFilters((prev) => ({
            ...prev,
            sort_by: sortBy,
            sort_order: newSortOrder,
        }));
        setPage(1);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-4xl font-bold">Laatste Nieuws</h1>
                <p className="text-lg text-muted-foreground">
                    Blijf op de hoogte van het laatste nieuws uit Nederland
                </p>
            </div>

            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Zoek artikelen..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            handleSearchChange(e.target.value);
                        }}
                    />
                </div>

                <div className="flex gap-2">
                    <Button
                        variant={showFilters ? 'default' : 'outline'}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => handleSortChange(filters.sort_by || 'published')}
                    >
                        <SortAsc className="h-4 w-4 mr-2" />
                        {filters.sort_by === 'published' && 'Datum'}
                        {filters.sort_by === 'title' && 'Titel'}
                        {filters.sort_by === 'created_at' && 'Toegevoegd'}
                        {filters.sort_order === 'asc' ? ' ↑' : ' ↓'}
                    </Button>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <ArticleFiltersPanel
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />
            )}

            {/* Active Filters Display */}
            {(filters.source || filters.category || filters.start_date || filters.end_date) && (
                <div className="flex flex-wrap gap-2">
                    {filters.source && (
                        <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm">
                            Bron: {filters.source}
                            <button
                                onClick={() => handleFilterChange({ source: undefined })}
                                className="ml-1 hover:text-destructive"
                            >
                                ×
                            </button>
                        </div>
                    )}
                    {filters.category && (
                        <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm">
                            Categorie: {filters.category}
                            <button
                                onClick={() => handleFilterChange({ category: undefined })}
                                className="ml-1 hover:text-destructive"
                            >
                                ×
                            </button>
                        </div>
                    )}
                    {(filters.start_date || filters.end_date) && (
                        <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm">
                            Datum filter actief
                            <button
                                onClick={() =>
                                    handleFilterChange({ start_date: undefined, end_date: undefined })
                                }
                                className="ml-1 hover:text-destructive"
                            >
                                ×
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Results Info */}
            {data?.meta?.pagination && (
                <div className="text-sm text-muted-foreground">
                    {data.meta.pagination.total} artikelen gevonden
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                    <p className="text-sm text-destructive">
                        Er is een fout opgetreden bij het ophalen van artikelen.
                    </p>
                </div>
            )}

            {/* Loading State */}
            {isLoading && <ArticleListSkeleton count={6} />}

            {/* Articles Grid */}
            {!isLoading && data?.success && data.data && (
                <>
                    {data.data.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-lg text-muted-foreground">
                                Geen artikelen gevonden
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {data.data.map((article) => (
                                <ArticleCard key={article.id} article={article} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {data.meta?.pagination && data.meta.pagination.total_pages > 1 && (
                        <div className="mt-8">
                            <Pagination
                                meta={data.meta.pagination}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </>
            )}

            {/* Error Response */}
            {!isLoading && data && !data.success && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                    <p className="text-sm text-destructive">
                        {data.error?.message || 'Er is een fout opgetreden'}
                    </p>
                </div>
            )}
        </div>
    );
}