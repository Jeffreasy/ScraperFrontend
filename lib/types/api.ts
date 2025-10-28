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
  content?: string;
  content_extracted: boolean;
  content_extracted_at?: string;
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

export interface ArticleListResponse extends APIResponse<Article[]> { }

export interface ArticleDetailResponse extends APIResponse<Article> { }

// Source Types

export interface SourceInfo {
  name: string;
  feed_url: string;
  is_active: boolean;
}

export interface SourceListResponse extends APIResponse<SourceInfo[]> { }

// Category Types

export interface CategoryInfo {
  name: string;
  article_count: number;
}

export interface CategoryListResponse extends APIResponse<CategoryInfo[]> { }

// Statistics Types

export interface StatsResponse {
  total_articles: number;
  articles_by_source: Record<string, number>;
  recent_articles_24h: number;
  oldest_article?: string;
  newest_article?: string;
  categories: Record<string, CategoryInfo>;
}

export interface StatsAPIResponse extends APIResponse<StatsResponse> { }

// Health Check Types

export interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'disabled';
  message?: string;
  latency_ms?: number;
  details?: Record<string, any>;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime_seconds: number;
  components: {
    database: ComponentHealth;
    redis: ComponentHealth;
    scraper: ComponentHealth;
    ai_processor?: ComponentHealth;
  };
  metrics: {
    uptime_seconds: number;
    timestamp: number;
    db_total_conns?: number;
    db_idle_conns?: number;
    db_acquired_conns?: number;
    ai_process_count?: number;
    ai_is_running?: boolean;
  };
}

export interface LivenessResponse {
  status: 'alive';
  time: string;
}

export interface ReadinessResponse {
  status: 'ready' | 'not_ready';
  components: Record<string, boolean>;
  time: string;
}

export interface MetricsResponse {
  timestamp: number;
  uptime: number;
  db_total_conns?: number;
  db_idle_conns?: number;
  db_acquired_conns?: number;
  db_max_conns?: number;
  db_acquire_count?: number;
  db_acquire_duration_ms?: number;
  ai_is_running?: boolean;
  ai_process_count?: number;
  ai_last_run?: number;
  ai_current_interval_seconds?: number;
  scraper?: {
    total_scrapes: number;
    successful_scrapes: number;
    failed_scrapes: number;
  };
}

export interface HealthAPIResponse extends APIResponse<HealthResponse> { }
export interface LivenessAPIResponse extends APIResponse<LivenessResponse> { }
export interface ReadinessAPIResponse extends APIResponse<ReadinessResponse> { }
export interface MetricsAPIResponse extends APIResponse<MetricsResponse> { }

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

export interface ScrapeAPIResponse extends APIResponse<ScrapeResponse> { }

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

// AI Enrichment Types

export interface AIEnrichment {
  processed: boolean;
  processed_at?: string;
  sentiment?: SentimentAnalysis;
  categories?: Record<string, number>;
  entities?: EntityExtraction;
  keywords?: Keyword[];
  summary?: string;
  error?: string;
}

export interface SentimentAnalysis {
  score: number;        // -1.0 (very negative) to 1.0 (very positive)
  label: 'positive' | 'negative' | 'neutral';
  confidence?: number;  // 0.0 to 1.0
}

export interface EntityExtraction {
  persons?: string[];
  organizations?: string[];
  locations?: string[];
}

export interface Keyword {
  word: string;
  score: number;  // 0.0 to 1.0 (relevance)
}

// Sentiment Statistics
export interface SentimentStats {
  total_articles: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  average_sentiment: number;
  most_positive_title?: string;
  most_negative_title?: string;
}

export interface SentimentStatsResponse extends APIResponse<SentimentStats> { }

// Trending Topics
export interface TrendingTopic {
  keyword: string;
  article_count: number;
  average_sentiment: number;
  sources: string[];
}

export interface TrendingTopicsResponse {
  topics: TrendingTopic[];
  hours_back: number;
  min_articles: number;
  count: number;
}

export interface TrendingTopicsAPIResponse extends APIResponse<TrendingTopicsResponse> { }

// Processor Status
export interface ProcessorStats {
  is_running: boolean;
  process_count: number;
  last_run: string;
}

export interface ProcessorStatsResponse extends APIResponse<ProcessorStats> { }

// Extended Article with AI data
export interface ArticleWithAI extends Article {
  ai_enrichment?: AIEnrichment;
}

// AI API Response Types
export interface ArticleEnrichmentResponse extends APIResponse<AIEnrichment> { }

export interface ArticlesByEntityResponse extends APIResponse<Article[]> { }

export interface ProcessArticleResponse extends APIResponse<{
  message: string;
  article_id: number;
  enrichment: AIEnrichment;
}> { }

export interface BatchProcessResponse extends APIResponse<{
  message: string;
  total_processed: number;
  success_count: number;
  failure_count: number;
  duration: string;
}> { }

// Rate Limiting

export interface RateLimitHeaders {
  limit: number;
  remaining: number;
  reset: number;
}

// Content Extraction Types (for Browser Scraping Integration)

export interface ContentExtractionResponse {
  message: string;
  characters: number;
  extraction_method?: 'html' | 'browser' | 'rss';
  extraction_time_ms?: number;
  article?: Article;
}

export interface BrowserPoolStats {
  enabled: boolean;
  pool_size: number;
  available: number;
  in_use: number;
  closed: boolean;
}

export interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half_open';
  failures: number;
}

export interface ScraperStatsResponse {
  articles_by_source: Record<string, number>;
  rate_limit_delay: number;
  sources_configured: string[];
  circuit_breakers: Record<string, CircuitBreakerState>;
  content_extraction?: {
    total: number;
    extracted: number;
    pending: number;
  };
  browser_pool?: BrowserPoolStats;
}

export interface ArticleStatsExtended extends StatsResponse {
  total_articles: number;
  recent_articles: number;
  articles_by_source: Record<string, number>;
  categories: Record<string, CategoryInfo>;
  oldest_article?: string;
  newest_article?: string;
}

// AI Chat Types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ChatRequest {
  message: string;
  article_id?: number;
  article_content?: string;  // Volledige artikel content als string
  context?: string;  // Conversatie context
}

export interface ChatResponse {
  message: string;
  articles?: Article[];
  stats?: {
    total_articles?: number;
    sentiment_breakdown?: {
      positive: number;
      neutral: number;
      negative: number;
    };
    sources?: string[];
  };
  function_used?: string;
  tokens_used?: number;
}

export interface ChatAPIResponse extends APIResponse<ChatResponse> { }