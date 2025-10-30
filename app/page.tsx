'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { cva, type VariantProps } from 'class-variance-authority';
import { Search, Filter, SortAsc, X, AlertCircle, Inbox } from 'lucide-react';
import { ArticleFilters, SortBy, SortOrder } from '@/lib/types/api';
import { ArticleCard } from '@/components/article-card';
import { ArticleListSkeleton } from '@/components/article-skeleton';
import { Pagination } from '@/components/pagination';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArticleFiltersPanel } from '@/components/article-filters';
import { EarningsCalendar } from '@/components/stock';
import { NewArticlesNotification } from '@/components/new-articles-notification';
import { useArticleLiveUpdates, useNewArticlesNotification } from '@/lib/hooks/use-article-live-updates';
import {
    cn,
    flexPatterns,
    spacing,
    transitions,
    bodyText,
    gap,
    gridLayouts,
    responsiveHeadings,
    containers,
} from '@/lib/styles/theme';

// ============================================================================
// CONSTANTS
// ============================================================================

const ITEMS_PER_PAGE = 20;

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const activeFilterBadgeVariants = cva(
    [
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5',
        'bg-primary/10 text-primary',
        bodyText.small,
        'font-medium',
        transitions.colors,
    ],
    {
        variants: {
            variant: {
                default: 'hover:bg-primary/20',
                removable: 'hover:bg-primary/20',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const emptyStateVariants = cva(
    ['text-center py-12 rounded-lg border border-dashed'],
    {
        variants: {
            variant: {
                default: 'bg-muted/30',
                error: 'bg-destructive/5 border-destructive/20',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const errorBannerVariants = cva(
    ['rounded-lg border p-4', transitions.colors],
    {
        variants: {
            severity: {
                error: 'border-destructive/50 bg-destructive/10',
                warning: 'border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20',
            },
        },
        defaultVariants: {
            severity: 'error',
        },
    }
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

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
    }, [searchParams, searchQuery]);

    // Debounced search handler
    const handleSearchChange = debounce((value: string) => {
        setDebouncedSearch(value);
        setPage(1);
    }, 300);

    // Live article updates with notification
    const {
        newCount,
        showNotification,
        handleNewArticles,
        clearNotification,
    } = useNewArticlesNotification();

    // Fetch articles with live updates
    const { data, isLoading, error, refresh } = useArticleLiveUpdates(
        ['articles', page, debouncedSearch, filters],
        {
            filters: {
                ...filters,
                offset: (page - 1) * ITEMS_PER_PAGE,
            },
            searchQuery: debouncedSearch,
            onNewArticles: handleNewArticles,
            pollingInterval: {
                min: 10000,  // 10 seconden wanneer actief
                max: 60000,  // 1 minuut wanneer inactief
            },
        }
    );

    // Handle refresh when notification is clicked
    const handleRefreshClick = () => {
        clearNotification();
        setPage(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        refresh();
    };

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

    const hasActiveFilters = Boolean(
        filters.source || filters.category || filters.start_date || filters.end_date
    );

    return (
        <div className={spacing.lg}>
            {/* New Articles Notification */}
            {showNotification && newCount > 0 && (
                <NewArticlesNotification
                    count={newCount}
                    onRefresh={handleRefreshClick}
                    onDismiss={clearNotification}
                />
            )}

            {/* Page Header */}
            <PageHeader />

            {/* Search and Controls */}
            <SearchControls
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleSearchChange={handleSearchChange}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                filters={filters}
                handleSortChange={handleSortChange}
            />

            {/* Filters Panel */}
            {showFilters && (
                <div className="animate-in slide-in-from-top duration-300">
                    <ArticleFiltersPanel filters={filters} onFilterChange={handleFilterChange} />
                </div>
            )}

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <ActiveFilters filters={filters} onFilterChange={handleFilterChange} />
            )}

            {/* Earnings Calendar Widget */}
            {!debouncedSearch && !hasActiveFilters && (
                <div className="my-8 animate-in fade-in duration-500">
                    <EarningsCalendar daysAhead={7} limit={5} variant="compact" />
                </div>
            )}

            {/* Results Info */}
            {data?.meta?.pagination && (
                <ResultsInfo
                    total={data.meta.pagination.total}
                    searchQuery={debouncedSearch}
                />
            )}

            {/* Error State */}
            {error && <ErrorState />}

            {/* Loading State */}
            {isLoading && <ArticleListSkeleton count={6} columns="three" />}

            {/* Articles Grid */}
            {!isLoading && data?.success && data.data && (
                <ArticlesContent
                    articles={data.data}
                    pagination={data.meta?.pagination}
                    onPageChange={handlePageChange}
                />
            )}

            {/* API Error Response */}
            {!isLoading && data && !data.success && (
                <ErrorState message={data.error?.message} />
            )}
        </div>
    );
}

// ============================================================================
// SUB COMPONENTS
// ============================================================================

function PageHeader() {
    return (
        <div className={spacing.xs}>
            <h1 className={responsiveHeadings.h1}>Laatste Nieuws</h1>
            <p className={cn('text-lg text-muted-foreground')}>
                Blijf op de hoogte van het laatste nieuws uit Nederland
            </p>
        </div>
    );
}

interface SearchControlsProps {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    handleSearchChange: (value: string) => void;
    showFilters: boolean;
    setShowFilters: (value: boolean) => void;
    filters: ArticleFilters;
    handleSortChange: (sortBy: SortBy) => void;
}

function SearchControls({
    searchQuery,
    setSearchQuery,
    handleSearchChange,
    showFilters,
    setShowFilters,
    filters,
    handleSortChange,
}: SearchControlsProps) {
    const getSortLabel = () => {
        const labels = {
            published: 'Datum',
            title: 'Titel',
            created_at: 'Toegevoegd',
        };
        return labels[filters.sort_by || 'published'] || 'Sorteer';
    };

    return (
        <div className={cn('flex flex-col sm:flex-row', gap.md)}>
            <div className="relative flex-1">
                <Input
                    type="search"
                    placeholder="Zoek artikelen..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        handleSearchChange(e.target.value);
                    }}
                    leftIcon={<Search className="h-4 w-4" />}
                />
            </div>

            <div className={cn('flex', gap.sm)}>
                <Button
                    variant={showFilters ? 'default' : 'outline'}
                    onClick={() => setShowFilters(!showFilters)}
                    leftIcon={<Filter className="h-4 w-4" />}
                >
                    Filters
                </Button>

                <Button
                    variant="outline"
                    onClick={() => handleSortChange(filters.sort_by || 'published')}
                    leftIcon={<SortAsc className="h-4 w-4" />}
                >
                    <span className="hidden sm:inline">
                        {getSortLabel()} {filters.sort_order === 'asc' ? '↑' : '↓'}
                    </span>
                    <span className="sm:hidden">
                        {filters.sort_order === 'asc' ? '↑' : '↓'}
                    </span>
                </Button>
            </div>
        </div>
    );
}

interface ActiveFiltersProps {
    filters: ArticleFilters;
    onFilterChange: (newFilters: Partial<ArticleFilters>) => void;
}

function ActiveFilters({ filters, onFilterChange }: ActiveFiltersProps) {
    return (
        <div className={cn('flex flex-wrap', gap.sm, 'animate-in fade-in duration-300')}>
            {filters.source && (
                <Badge
                    variant="secondary"
                    onRemove={() => onFilterChange({ source: undefined })}
                >
                    Bron: {filters.source}
                </Badge>
            )}
            {filters.category && (
                <Badge
                    variant="secondary"
                    onRemove={() => onFilterChange({ category: undefined })}
                >
                    Categorie: {filters.category}
                </Badge>
            )}
            {(filters.start_date || filters.end_date) && (
                <Badge
                    variant="secondary"
                    onRemove={() => onFilterChange({ start_date: undefined, end_date: undefined })}
                >
                    Datum filter actief
                </Badge>
            )}
        </div>
    );
}

interface ResultsInfoProps {
    total: number;
    searchQuery?: string;
}

function ResultsInfo({ total, searchQuery }: ResultsInfoProps) {
    return (
        <div className={cn(bodyText.small, 'text-muted-foreground')}>
            {searchQuery ? (
                <>
                    <strong className="text-foreground">{total}</strong> resultaten voor &ldquo;{searchQuery}&rdquo;
                </>
            ) : (
                <>
                    <strong className="text-foreground">{total}</strong> artikelen gevonden
                </>
            )}
        </div>
    );
}

function ErrorState({ message }: { message?: string } = {}) {
    return (
        <div className={errorBannerVariants({ severity: 'error' })}>
            <div className={cn(flexPatterns.start, gap.sm)}>
                <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                <div>
                    <p className={cn(bodyText.small, 'text-destructive font-medium')}>
                        {message || 'Er is een fout opgetreden bij het ophalen van artikelen.'}
                    </p>
                    <p className={cn(bodyText.xs, 'text-destructive/80 mt-1')}>
                        Probeer de pagina te vernieuwen of probeer het later opnieuw.
                    </p>
                </div>
            </div>
        </div>
    );
}

interface ArticlesContentProps {
    articles: any[];
    pagination?: any;
    onPageChange: (page: number) => void;
}

function ArticlesContent({ articles, pagination, onPageChange }: ArticlesContentProps) {
    if (articles.length === 0) {
        return (
            <div className={emptyStateVariants()}>
                <Inbox className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-1">Geen artikelen gevonden</p>
                <p className={cn(bodyText.small, 'text-muted-foreground')}>
                    Probeer andere filters of zoektermen
                </p>
            </div>
        );
    }

    return (
        <>
            <div className={cn(gridLayouts.threeColumn, gap.lg, 'animate-in fade-in duration-500')}>
                {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
                <div className="mt-8">
                    <Pagination
                        meta={pagination}
                        onPageChange={onPageChange}
                        showFirstLast
                    />
                </div>
            )}
        </>
    );
}

// ============================================================================
// EXPORTS
// ============================================================================

// Note: CVA variants are not exported from page components to avoid Next.js type conflicts
// Use these variants only within this component file