import type {
  Article,
  ArticleFilter,
  ArticleListResponse,
  SearchFilters,
  SourceInfo,
  CategoryInfo,
  StatsResponse,
  HealthStatus,
  LivenessResponse,
  ReadinessResponse,
  MetricsResponse,
  ScrapeRequest,
  ScrapeResponse,
  TrendingResponse,
  SentimentTrendsResponse,
  HotEntitiesResponse,
  EntitySentimentResponse,
  AnalyticsOverview,
  ArticleStatsResponse,
  EmailStats,
  EmailFetchResponse,
  StockQuote,
  StockProfile,
  HistoricalDataResponse,
  FinancialMetrics,
  StockNewsResponse,
  EarningsCalendarResponse,
  SymbolSearchResponse,
  BatchQuotesResponse,
  MarketMoversResponse,
  SectorsResponse,
  AnalystRatingsResponse,
  PriceTarget,
  StockStatsResponse,
  CacheStats,
  CacheInvalidateRequest,
  CacheInvalidateResponse,
  ChatRequest,
  ChatResponse,
  ScraperStats,
} from '@/lib/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

class APIClient {
  private baseURL: string;
  private apiKey?: string;

  constructor(baseURL: string, apiKey?: string) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}`
      }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  // ============================================================================
  // Health Checks
  // ============================================================================

  async healthCheck(): Promise<HealthStatus> {
    return this.fetch<HealthStatus>('/health');
  }

  async livenessCheck(): Promise<LivenessResponse> {
    return this.fetch<LivenessResponse>('/health/live');
  }

  async readinessCheck(): Promise<ReadinessResponse> {
    return this.fetch<ReadinessResponse>('/health/ready');
  }

  async getMetrics(): Promise<MetricsResponse> {
    return this.fetch<MetricsResponse>('/health/metrics');
  }

  // ============================================================================
  // Articles API
  // ============================================================================

  async getArticles(filters?: ArticleFilter): Promise<ArticleListResponse> {
    const queryString = filters ? this.buildQueryString(filters) : '';
    return this.fetch<ArticleListResponse>(`/api/v1/articles${queryString}`);
  }

  async getArticle(id: number): Promise<{ article: Article }> {
    return this.fetch<{ article: Article }>(`/api/v1/articles/${id}`);
  }

  async searchArticles(filters: SearchFilters): Promise<ArticleListResponse> {
    const queryString = this.buildQueryString(filters);
    return this.fetch<ArticleListResponse>(`/api/v1/articles/search${queryString}`);
  }

  async getArticleStats(): Promise<Record<string, number>> {
    return this.fetch<Record<string, number>>('/api/v1/articles/stats');
  }

  async extractArticleContent(articleId: number): Promise<{
    message: string;
    article: Article;
  }> {
    return this.fetch<{
      message: string;
      article: Article;
    }>(`/api/v1/articles/${articleId}/extract-content`, {
      method: 'POST',
    });
  }

  async getArticlesByTicker(symbol: string, limit: number = 10): Promise<ArticleListResponse> {
    const queryString = this.buildQueryString({ limit });
    return this.fetch<ArticleListResponse>(`/api/v1/articles/by-ticker/${symbol}${queryString}`);
  }

  // ============================================================================
  // Analytics API
  // ============================================================================

  async getTrendingKeywords(
    hours: number = 24,
    minArticles: number = 3,
    limit: number = 20
  ): Promise<TrendingResponse> {
    const queryString = this.buildQueryString({
      hours,
      min_articles: minArticles,
      limit,
    });
    return this.fetch<TrendingResponse>(`/api/v1/analytics/trending${queryString}`);
  }

  async getSentimentTrends(source?: string): Promise<SentimentTrendsResponse> {
    const params = source ? { source } : {};
    const queryString = this.buildQueryString(params);
    return this.fetch<SentimentTrendsResponse>(`/api/v1/analytics/sentiment-trends${queryString}`);
  }

  async getHotEntities(
    entityType?: string,
    limit: number = 50
  ): Promise<HotEntitiesResponse> {
    const params: Record<string, any> = { limit };
    if (entityType) params.entity_type = entityType;
    const queryString = this.buildQueryString(params);
    return this.fetch<HotEntitiesResponse>(`/api/v1/analytics/hot-entities${queryString}`);
  }

  async getEntitySentiment(
    entity: string,
    days: number = 30
  ): Promise<EntitySentimentResponse> {
    const queryString = this.buildQueryString({ entity, days });
    return this.fetch<EntitySentimentResponse>(`/api/v1/analytics/entity-sentiment${queryString}`);
  }

  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    return this.fetch<AnalyticsOverview>('/api/v1/analytics/overview');
  }

  async getArticleStatsBySource(): Promise<ArticleStatsResponse> {
    return this.fetch<ArticleStatsResponse>('/api/v1/analytics/article-stats');
  }

  async refreshAnalytics(): Promise<{
    message: string;
    results: Array<{
      view_name: string;
      refresh_time_ms: number;
      rows_affected: number;
    }>;
    summary: {
      total_views: number;
      total_rows: number;
      total_time_ms: number;
      concurrent_mode: boolean;
    };
  }> {
    return this.fetch<{
      message: string;
      results: Array<{
        view_name: string;
        refresh_time_ms: number;
        rows_affected: number;
      }>;
      summary: {
        total_views: number;
        total_rows: number;
        total_time_ms: number;
        concurrent_mode: boolean;
      };
    }>('/api/v1/analytics/refresh', {
      method: 'POST',
    });
  }

  // ============================================================================
  // Email API
  // ============================================================================

  async getEmailStats(): Promise<EmailStats> {
    return this.fetch<EmailStats>('/api/v1/email/stats');
  }

  async fetchExistingEmails(): Promise<EmailFetchResponse> {
    return this.fetch<EmailFetchResponse>('/api/v1/email/fetch-existing', {
      method: 'POST',
    });
  }

  // ============================================================================
  // Scraper API
  // ============================================================================

  async triggerScrape(request?: ScrapeRequest): Promise<ScrapeResponse> {
    return this.fetch<ScrapeResponse>('/api/v1/scrape', {
      method: 'POST',
      body: request ? JSON.stringify(request) : undefined,
    });
  }

  async getScraperStats(): Promise<ScraperStats> {
    return this.fetch<ScraperStats>('/api/v1/scraper/stats');
  }

  async getSources(): Promise<{ sources: SourceInfo[] }> {
    return this.fetch<{ sources: SourceInfo[] }>('/api/v1/sources');
  }

  async getCategories(): Promise<{ categories: CategoryInfo[] }> {
    return this.fetch<{ categories: CategoryInfo[] }>('/api/v1/categories');
  }

  // ============================================================================
  // AI API
  // ============================================================================

  async getArticleEnrichment(articleId: number): Promise<{
    ai_summary?: string;
    ai_sentiment?: string;
    ai_sentiment_score?: number;
    ai_keywords?: string[];
    ai_entities?: any[];
    ai_category?: string;
    stock_tickers?: string[];
  }> {
    return this.fetch<{
      ai_summary?: string;
      ai_sentiment?: string;
      ai_sentiment_score?: number;
      ai_keywords?: string[];
      ai_entities?: any[];
      ai_category?: string;
      stock_tickers?: string[];
    }>(`/api/v1/articles/${articleId}/enrichment`);
  }

  async processArticle(articleId: number): Promise<{
    message: string;
    article: Article;
  }> {
    return this.fetch<{
      message: string;
      article: Article;
    }>(`/api/v1/articles/${articleId}/process`, {
      method: 'POST',
    });
  }

  async getSentimentStats(): Promise<{
    total_processed: number;
    by_sentiment: {
      positive: number;
      neutral: number;
      negative: number;
    };
    avg_sentiment_score: number;
  }> {
    return this.fetch<{
      total_processed: number;
      by_sentiment: {
        positive: number;
        neutral: number;
        negative: number;
      };
      avg_sentiment_score: number;
    }>('/api/v1/ai/sentiment/stats');
  }

  async getAITrending(): Promise<{
    topics: Array<{
      keyword: string;
      count: number;
      sentiment: number;
    }>;
  }> {
    return this.fetch<{
      topics: Array<{
        keyword: string;
        count: number;
        sentiment: number;
      }>;
    }>('/api/v1/ai/trending');
  }

  async getArticlesByEntity(entityName: string): Promise<ArticleListResponse> {
    const encodedEntity = encodeURIComponent(entityName);
    return this.fetch<ArticleListResponse>(`/api/v1/ai/entity/${encodedEntity}`);
  }

  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    return this.fetch<ChatResponse>('/api/v1/ai/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // ============================================================================
  // Stocks API
  // ============================================================================

  async getStockQuote(symbol: string): Promise<StockQuote> {
    return this.fetch<StockQuote>(`/api/v1/stocks/quote/${symbol}`);
  }

  async getStockProfile(symbol: string): Promise<StockProfile> {
    return this.fetch<StockProfile>(`/api/v1/stocks/profile/${symbol}`);
  }

  async searchSymbols(query: string): Promise<SymbolSearchResponse> {
    const queryString = this.buildQueryString({ q: query });
    return this.fetch<SymbolSearchResponse>(`/api/v1/stocks/search${queryString}`);
  }

  async getEarningsCalendar(): Promise<EarningsCalendarResponse> {
    return this.fetch<EarningsCalendarResponse>('/api/v1/stocks/earnings');
  }

  async getHistoricalData(
    symbol: string,
    from?: string,
    to?: string
  ): Promise<HistoricalDataResponse> {
    const params: Record<string, any> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const queryString = this.buildQueryString(params);
    return this.fetch<HistoricalDataResponse>(`/api/v1/stocks/historical/${symbol}${queryString}`);
  }

  async getFinancialMetrics(symbol: string): Promise<FinancialMetrics> {
    return this.fetch<FinancialMetrics>(`/api/v1/stocks/metrics/${symbol}`);
  }

  async getStockNews(symbol: string, limit: number = 10): Promise<StockNewsResponse> {
    const queryString = this.buildQueryString({ limit });
    return this.fetch<StockNewsResponse>(`/api/v1/stocks/news/${symbol}${queryString}`);
  }

  async getMultipleQuotes(symbols: string[]): Promise<Record<string, StockQuote>> {
    return this.fetch<Record<string, StockQuote>>('/api/v1/stocks/quotes', {
      method: 'POST',
      body: JSON.stringify({ symbols }),
    });
  }

  async getMarketGainers(): Promise<MarketMoversResponse> {
    return this.fetch<MarketMoversResponse>('/api/v1/stocks/market/gainers');
  }

  async getMarketLosers(): Promise<MarketMoversResponse> {
    return this.fetch<MarketMoversResponse>('/api/v1/stocks/market/losers');
  }

  async getMarketActives(): Promise<MarketMoversResponse> {
    return this.fetch<MarketMoversResponse>('/api/v1/stocks/market/actives');
  }

  async getSectors(): Promise<SectorsResponse> {
    return this.fetch<SectorsResponse>('/api/v1/stocks/sectors');
  }

  async getAnalystRatings(symbol: string, limit: number = 20): Promise<AnalystRatingsResponse> {
    const queryString = this.buildQueryString({ limit });
    return this.fetch<AnalystRatingsResponse>(`/api/v1/stocks/ratings/${symbol}${queryString}`);
  }

  async getPriceTarget(symbol: string): Promise<PriceTarget> {
    return this.fetch<PriceTarget>(`/api/v1/stocks/target/${symbol}`);
  }

  async getStockStats(): Promise<StockStatsResponse> {
    return this.fetch<StockStatsResponse>('/api/v1/stocks/stats');
  }

  // ============================================================================
  // Cache API
  // ============================================================================

  async getCacheStats(): Promise<CacheStats> {
    return this.fetch<CacheStats>('/api/v1/cache/stats');
  }

  async invalidateCache(request?: CacheInvalidateRequest): Promise<CacheInvalidateResponse> {
    return this.fetch<CacheInvalidateResponse>('/api/v1/cache/invalidate', {
      method: 'POST',
      body: request ? JSON.stringify(request) : undefined,
    });
  }
}

// Export singleton instance
export const apiClient = new APIClient(API_BASE_URL, API_KEY);

// Export class for testing
export default APIClient;