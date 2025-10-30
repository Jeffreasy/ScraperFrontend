// ============================================================================
// Base Types
// ============================================================================

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginationResponse {
  total: number;
  limit: number;
  offset: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
  code: number;
}

// ============================================================================
// Article Types
// ============================================================================

export interface Article {
  id: number;
  title: string;
  summary: string;
  url: string;
  published: string; // ISO 8601 date
  source: string;
  keywords: string[];
  image_url: string;
  author: string;
  category: string;
  created_at: string;
  updated_at: string;
  content?: string; // Full content if extracted
  content_extracted: boolean;
  content_extracted_at?: string;
  // AI fields - direct on Article now
  ai_summary?: string;
  ai_sentiment?: 'positive' | 'negative' | 'neutral';
  ai_sentiment_score?: number;
  ai_keywords?: string[];
  ai_entities?: AIEntity[];
  ai_category?: string;
  stock_tickers?: string[];
  ai_processed: boolean;
  ai_processed_at?: string;
  ai_error?: string;
}

export interface ArticleCreate {
  title: string;
  summary: string;
  url: string;
  published: string;
  source: string;
  keywords?: string[];
  image_url?: string;
  author?: string;
  category?: string;
}

export interface ArticleFilter {
  source?: string;
  category?: string;
  keyword?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: 'published' | 'created_at';
  sort_order?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}

export interface ArticleListResponse {
  articles: Article[];
  pagination: PaginationResponse;
}

export interface AIEntity {
  entity: string;
  entity_type: string;
  relevance: number;
  sentiment: number;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface TrendingKeyword {
  keyword: string;
  article_count: number;
  source_count: number;
  sources: string[];
  avg_sentiment: number;
  avg_relevance: number;
  most_recent: string;
  trending_score: number;
}

export interface TrendingResponse {
  trending: TrendingKeyword[];
  meta: {
    hours: number;
    min_articles: number;
    limit: number;
    count: number;
  };
}

export interface SentimentTrend {
  day: string;
  source: string;
  total_articles: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  avg_sentiment: number;
  positive_percentage: number;
  negative_percentage: number;
}

export interface SentimentTrendsResponse {
  trends: SentimentTrend[];
  meta: {
    source?: string;
    count: number;
  };
}

export interface HotEntity {
  entity: string;
  entity_type: string;
  total_mentions: number;
  days_mentioned: number;
  sources: string[];
  overall_sentiment: number;
  most_recent_mention: string;
}

export interface HotEntitiesResponse {
  entities: HotEntity[];
  meta: {
    entity_type?: string;
    limit: number;
    count: number;
  };
}

export interface EntitySentimentDay {
  day: string;
  mention_count: number;
  avg_sentiment: number;
  sources: string[];
  categories: string[];
}

export interface EntitySentimentResponse {
  entity: string;
  timeline: EntitySentimentDay[];
  meta: {
    days: number;
    count: number;
  };
}

export interface AnalyticsOverview {
  trending_keywords: TrendingKeyword[];
  hot_entities: HotEntity[];
  materialized_views: Array<{
    name: string;
    size: string;
  }>;
  meta: {
    trending_count: number;
    entities_count: number;
    views_count: number;
  };
}

export interface ArticleSourceStats {
  source: string;
  source_name: string;
  total_articles: number;
  articles_today: number;
  articles_week: number;
  ai_processed_count: number;
  content_extracted_count: number;
  latest_article_date: string;
  oldest_article_date: string;
  avg_sentiment?: number;
}

export interface ArticleStatsResponse {
  sources: ArticleSourceStats[];
  meta: {
    count: number;
  };
}

// ============================================================================
// Email Types
// ============================================================================

export interface Email {
  id: number;
  message_id: string;
  message_uid?: string;
  thread_id?: string;
  sender: string;
  sender_name?: string;
  recipient?: string;
  subject: string;
  body_text: string;
  body_html: string;
  snippet?: string;
  received_date: string;
  sent_date?: string;
  status: 'pending' | 'processing' | 'processed' | 'failed' | 'ignored' | 'spam';
  processed_at?: string;
  article_id?: number;
  article_created: boolean;
  error?: string;
  error_code?: string;
  retry_count: number;
  max_retries: number;
  last_retry_at?: string;
  has_attachments: boolean;
  attachment_count: number;
  is_read: boolean;
  is_flagged: boolean;
  is_spam: boolean;
  importance?: 'low' | 'normal' | 'high';
  headers?: Record<string, any>;
  labels?: string[];
  size_bytes?: number;
  spam_score?: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface EmailStats {
  total_emails: number;
  processed_emails: number;
  pending_emails: number;
  failed_emails: number;
  articles_created: number;
}

// ============================================================================
// Scraping Types
// ============================================================================

export interface ScrapingJob {
  id: number;
  job_uuid?: string;
  source: string;
  scraping_method?: 'rss' | 'dynamic' | 'hybrid';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  started_at?: string;
  completed_at?: string;
  execution_time_ms?: number;
  articles_found: number;
  articles_new: number;
  articles_updated: number;
  articles_skipped: number;
  error?: string;
  error_code?: string;
  retry_count: number;
  max_retries: number;
  created_at: string;
  created_by?: string;
}

export interface ScraperStats {
  articles_by_source: Record<string, number>;
  rate_limit_delay: number;
  sources_configured: string[];
  circuit_breakers: Array<{
    name: string;
    state: 'closed' | 'open' | 'half-open';
    failure_count: number;
    success_count: number;
  }>;
  content_extraction?: {
    total: number;
    extracted: number;
    pending: number;
  };
  browser_pool?: BrowserPoolStats;
}

// ============================================================================
// Stock Types
// ============================================================================

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  market_cap: number;
  timestamp: string;
  exchange: string;
  currency: string;
  previous_close?: number;
  day_high?: number;
  day_low?: number;
  year_high?: number;
  year_low?: number;
  price_avg_50?: number;
  price_avg_200?: number;
  eps?: number;
  pe?: number;
  shares_outstanding?: number;
}

export interface StockProfile {
  symbol: string;
  company_name: string;
  industry: string;
  sector: string;
  description: string;
  ceo: string;
  employees: number;
  website: string;
  country: string;
}

export interface HistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose: number;
  volume: number;
  change: number;
  changePercent: number;
}

export interface HistoricalDataResponse {
  symbol: string;
  from: string;
  to: string;
  dataPoints: number;
  prices: HistoricalPrice[];
}

export interface FinancialMetrics {
  symbol: string;
  marketCap: number;
  peRatio: number;
  pegRatio?: number;
  priceToBook?: number;
  priceToSales?: number;
  roe?: number;
  roa?: number;
  debtToEquity?: number;
  currentRatio?: number;
  dividendYield?: number;
  eps: number;
  revenuePerShare?: number;
  freeCashFlowYield?: number;
}

export interface StockNewsItem {
  symbol: string;
  publishedDate: string;
  title: string;
  image?: string;
  site: string;
  text: string;
  url: string;
}

export interface StockNewsResponse {
  symbol: string;
  total: number;
  news: StockNewsItem[];
}

export interface EarningsEvent {
  symbol: string;
  date: string;
  eps: number;
  epsEstimated: number;
  time: 'bmo' | 'amc' | 'tbd';
  revenue: number;
  revenueEstimated: number;
}

export interface EarningsCalendarResponse {
  from: string;
  to: string;
  total: number;
  earnings: EarningsEvent[];
}

export interface SymbolSearchResult {
  symbol: string;
  name: string;
  exchange: string;
}

export interface SymbolSearchResponse {
  query: string;
  total: number;
  results: SymbolSearchResult[];
}

export interface MarketMover {
  symbol: string;
  name: string;
  change: number;
  changePercent: number;
  price: number;
  volume: number;
}

export interface MarketMoversResponse {
  gainers?: MarketMover[];
  losers?: MarketMover[];
  actives?: MarketMover[];
  total: number;
}

export interface SectorPerformance {
  sector: string;
  changePercent: number;
}

export interface SectorsResponse {
  sectors: SectorPerformance[];
  total: number;
}

export interface AnalystRating {
  date: string;
  analystName?: string;
  analystCompany?: string;
  gradeNew: string;
  gradePrevious?: string;
  action: string;
  priceTarget?: number;
  priceWhenPosted?: number;
}

export interface AnalystRatingsResponse {
  symbol: string;
  ratings: AnalystRating[];
  total: number;
}

export interface PriceTarget {
  symbol: string;
  targetConsensus?: number;
  targetHigh?: number;
  targetLow?: number;
  targetMean?: number;
  targetMedian?: number;
  numberOfAnalysts?: number;
}

// ============================================================================
// Health Types
// ============================================================================

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
    scraper: 'up' | 'down';
    ai_processor: 'up' | 'down';
  };
  metrics?: {
    cpu_usage?: number;
    memory_usage?: number;
    goroutines?: number;
  };
}

// ============================================================================
// Cache Types
// ============================================================================

export interface CacheStats {
  hits: number;
  misses: number;
  hit_rate: number;
  keys_count: number;
  memory_usage: string;
}

export interface CacheInvalidateRequest {
  pattern?: string;
}

export interface CacheInvalidateResponse {
  message: string;
  keys_deleted: number;
}

// ============================================================================
// AI Types (Legacy support & Chat)
// ============================================================================

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
  tokens_used: number;
}

// ============================================================================
// Legacy Types (for backward compatibility)
// ============================================================================

// Keep old API wrapper for backward compatibility during migration
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  request_id: string;
  timestamp: string;
  rateLimitHeaders?: RateLimitHeaders;
}

export interface APIError {
  code: string;
  message: string;
  details?: string;
}

export interface RateLimitHeaders {
  limit: number;
  remaining: number;
  reset: number;
}

// ============================================================================
// Source & Category Types
// ============================================================================

export interface SourceInfo {
  name: string;
  url: string;
  active: boolean;
}

export interface CategoryInfo {
  name: string;
  article_count: number;
}

// ============================================================================
// Search Types
// ============================================================================

export interface SearchFilters extends ArticleFilter {
  q: string;
}

// ============================================================================
// Stats Types
// ============================================================================

export interface StatsResponse {
  total_articles: number;
  articles_by_source: Record<string, number>;
  recent_articles_24h: number;
  oldest_article?: string;
  newest_article?: string;
  categories: Record<string, CategoryInfo>;
}

// ============================================================================
// Scraper Request/Response
// ============================================================================

export interface ScrapeRequest {
  sources?: string[];
}

export interface ScrapeResponse {
  message: string;
  results: Record<string, {
    source: string;
    articles_stored: number;
    articles_skipped: number;
    duration: string;
    status: string;
    error?: string;
  }>;
}

// ============================================================================
// Error Codes
// ============================================================================

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

// ============================================================================
// Alias types for compatibility
// ============================================================================

export type ArticleFilters = ArticleFilter;
export type SortBy = 'published' | 'created_at' | 'title';
export type SortOrder = 'asc' | 'desc' | 'ASC' | 'DESC';

// Legacy AI types
export interface AIEnrichment {
  processed: boolean;
  processed_at?: string;
  sentiment?: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
    confidence?: number;
  };
  categories?: Record<string, number>;
  entities?: {
    persons?: string[];
    organizations?: string[];
    locations?: string[];
    stock_tickers?: string[];
  };
  keywords?: Array<{
    word: string;
    score: number;
  }>;
  summary?: string;
  error?: string;
}

export interface SentimentStats {
  total_articles: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  average_sentiment: number;
  most_positive_title?: string;
  most_negative_title?: string;
}

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

export interface ProcessorStats {
  is_running: boolean;
  process_count: number;
  last_run: string;
}

// Response types for specific endpoints
export interface LivenessResponse {
  status: 'alive' | 'ok';
  time?: string;
}

export interface ReadinessResponse {
  status: 'ready' | 'not_ready';
  components?: {
    database: boolean;
    redis: boolean;
  };
  time?: string;
}

export interface MetricsResponse {
  timestamp?: number;
  uptime: number;
  requests_total?: number;
  requests_per_second?: number;
  avg_response_time_ms?: number;
  error_rate?: number;
  db_total_conns?: number;
  db_idle_conns?: number;
  db_acquired_conns?: number;
  db_max_conns?: number;
  db_acquire_duration_ms?: number;
  ai_is_running?: boolean;
  ai_process_count?: number;
  ai_last_run?: number;
  ai_current_interval_seconds?: number;
  scraper?: {
    total_scrapes: number;
    successful_scrapes: number;
    failed_scrapes?: number;
  };
}

export interface EmailFetchResponse {
  message: string;
  count: number;
}

export interface StockStatsResponse {
  cache: {
    enabled: boolean;
    ttl: string;
    cached_quotes: number;
    cached_profiles: number;
  };
}

export interface BatchQuotesResponse {
  quotes: Record<string, StockQuote>;
  meta: {
    total: number;
    requested: number;
    duration_ms: number;
    using_batch: boolean;
    cost_saving?: string;
  };
}

// Content Extraction
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

// Health check types
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
  metrics?: {
    uptime_seconds: number;
    timestamp?: number;
    db_total_conns?: number;
    db_idle_conns?: number;
    db_acquired_conns?: number;
    ai_process_count?: number;
    ai_is_running?: boolean;
  };
}

// Stock ticker type (legacy)
export interface StockTicker {
  symbol: string;
  name?: string;
  exchange?: string;
  mentions?: number;
  context?: string;
}