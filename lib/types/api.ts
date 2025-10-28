// API Response Types based on Backend API Documentation

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
  meta?: Meta;
  request_id: string;
  timestamp: string;
}

export interface APIError {
  code: string;
  message: string;
  details?: string;
}

export interface Meta {
  pagination?: PaginationMeta;
  sorting?: SortingMeta;
  filtering?: FilteringMeta;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  current_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface SortingMeta {
  sort_by: string;
  sort_order: 'asc' | 'desc';
}

export interface FilteringMeta {
  source?: string;
  category?: string;
  keyword?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
}

// Article Types

export interface Article {
  id: number;
  title: string;
  summary: string;
  url: string;
  published: string;
  source: string;
  keywords: string[];
  image_url: string;
  author: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface ArticleListResponse extends APIResponse<Article[]> {}

export interface ArticleDetailResponse extends APIResponse<Article> {}

// Source Types

export interface SourceInfo {
  name: string;
  feed_url: string;
  is_active: boolean;
}

export interface SourceListResponse extends APIResponse<SourceInfo[]> {}

// Category Types

export interface CategoryInfo {
  name: string;
  article_count: number;
}

export interface CategoryListResponse extends APIResponse<CategoryInfo[]> {}

// Statistics Types

export interface StatsResponse {
  total_articles: number;
  articles_by_source: Record<string, number>;
  recent_articles_24h: number;
  oldest_article?: string;
  newest_article?: string;
  categories: Record<string, CategoryInfo>;
}

export interface StatsAPIResponse extends APIResponse<StatsResponse> {}

// Health Check Types

export interface HealthCheck {
  status: string;
}

export interface HealthCheckResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  checks: {
    database: HealthCheck;
    redis: HealthCheck;
  };
}

export interface HealthAPIResponse extends APIResponse<HealthCheckResponse> {}

// Scraper Types

export interface ScrapeRequest {
  source?: string;
}

export interface ScrapeResponse {
  status: string;
  source: string;
  articles_found: number;
  articles_stored: number;
  articles_skipped: number;
  duration_seconds: number;
}

export interface ScrapeAPIResponse extends APIResponse<ScrapeResponse> {}

// Filter & Query Types

export type SortBy = 'published' | 'created_at' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface ArticleFilters {
  limit?: number;
  offset?: number;
  source?: string;
  category?: string;
  keyword?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: SortBy;
  sort_order?: SortOrder;
}

export interface SearchFilters extends ArticleFilters {
  q: string;
}

// Error Codes

export enum ErrorCode {
  INVALID_ID = 'INVALID_ID',
  INVALID_DATE = 'INVALID_DATE',
  INVALID_REQUEST = 'INVALID_REQUEST',
  INVALID_SOURCE = 'INVALID_SOURCE',
  NOT_FOUND = 'NOT_FOUND',
  MISSING_QUERY = 'MISSING_QUERY',
  DATABASE_ERROR = 'DATABASE_ERROR',
  SEARCH_ERROR = 'SEARCH_ERROR',
  SCRAPING_FAILED = 'SCRAPING_FAILED',
}

// Rate Limiting

export interface RateLimitHeaders {
  limit: number;
  remaining: number;
  reset: number;
}