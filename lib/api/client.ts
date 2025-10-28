import type {
  APIResponse,
  Article,
  ArticleFilters,
  SearchFilters,
  SourceInfo,
  CategoryInfo,
  StatsResponse,
  HealthResponse,
  LivenessResponse,
  ReadinessResponse,
  MetricsResponse,
  ScrapeRequest,
  ScrapeResponse,
  RateLimitHeaders,
  AIEnrichment,
  SentimentStats,
  TrendingTopicsResponse,
  ProcessorStats,
  ArticleWithAI,
  ChatRequest,
  ChatResponse,
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

  private async fetchWithErrorHandling<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        ...options,
        headers,
      });

      // Extract rate limit headers
      const rateLimitHeaders: RateLimitHeaders = {
        limit: parseInt(response.headers.get('X-RateLimit-Limit') || '0'),
        remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '0'),
        reset: parseInt(response.headers.get('X-RateLimit-Reset') || '0'),
      };

      const data: APIResponse<T> = await response.json();

      // Attach rate limit info to response
      (data as any).rateLimitHeaders = rateLimitHeaders;

      if (!response.ok) {
        console.error('API Error:', data.error);
      }

      return data;
    } catch (error) {
      console.error('Network Error:', error);
      throw error;
    }
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

  // Health Checks
  async healthCheck(): Promise<APIResponse<HealthResponse>> {
    return this.fetchWithErrorHandling<HealthResponse>('/health');
  }

  async livenessCheck(): Promise<APIResponse<LivenessResponse>> {
    return this.fetchWithErrorHandling<LivenessResponse>('/health/live');
  }

  async readinessCheck(): Promise<APIResponse<ReadinessResponse>> {
    return this.fetchWithErrorHandling<ReadinessResponse>('/health/ready');
  }

  async getMetrics(): Promise<APIResponse<MetricsResponse>> {
    return this.fetchWithErrorHandling<MetricsResponse>('/health/metrics');
  }

  // Articles
  async getArticles(filters?: ArticleFilters): Promise<APIResponse<Article[]>> {
    const queryString = filters ? this.buildQueryString(filters) : '';
    return this.fetchWithErrorHandling<Article[]>(`/api/v1/articles${queryString}`);
  }

  async getArticle(id: number): Promise<APIResponse<Article>> {
    return this.fetchWithErrorHandling<Article>(`/api/v1/articles/${id}`);
  }

  async searchArticles(filters: SearchFilters): Promise<APIResponse<Article[]>> {
    const queryString = this.buildQueryString(filters);
    return this.fetchWithErrorHandling<Article[]>(`/api/v1/articles/search${queryString}`);
  }

  async getArticleStats(): Promise<APIResponse<StatsResponse>> {
    return this.fetchWithErrorHandling<StatsResponse>('/api/v1/articles/stats');
  }

  // Sources
  async getSources(): Promise<APIResponse<SourceInfo[]>> {
    return this.fetchWithErrorHandling<SourceInfo[]>('/api/v1/sources');
  }

  // Categories
  async getCategories(): Promise<APIResponse<CategoryInfo[]>> {
    return this.fetchWithErrorHandling<CategoryInfo[]>('/api/v1/categories');
  }

  // Scraper (requires API key)
  async triggerScrape(request?: ScrapeRequest): Promise<APIResponse<ScrapeResponse>> {
    return this.fetchWithErrorHandling<ScrapeResponse>('/api/v1/scrape', {
      method: 'POST',
      body: request ? JSON.stringify(request) : undefined,
    });
  }

  async getScraperStats(): Promise<APIResponse<{
    content_extraction?: {
      total: number;
      extracted: number;
      pending: number;
    };
    browser_pool?: {
      enabled: boolean;
      pool_size: number;
      available: number;
      in_use: number;
      closed: boolean;
    };
  }>> {
    return this.fetchWithErrorHandling<{
      content_extraction?: {
        total: number;
        extracted: number;
        pending: number;
      };
      browser_pool?: {
        enabled: boolean;
        pool_size: number;
        available: number;
        in_use: number;
        closed: boolean;
      };
    }>('/api/v1/scraper/stats');
  }

  // AI Enrichment Methods
  async getArticleEnrichment(articleId: number): Promise<APIResponse<AIEnrichment>> {
    return this.fetchWithErrorHandling<AIEnrichment>(`/api/v1/articles/${articleId}/enrichment`);
  }

  async getSentimentStats(
    source?: string,
    startDate?: string,
    endDate?: string
  ): Promise<APIResponse<SentimentStats>> {
    const params: Record<string, any> = {};
    if (source) params.source = source;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const queryString = this.buildQueryString(params);
    return this.fetchWithErrorHandling<SentimentStats>(`/api/v1/ai/sentiment/stats${queryString}`);
  }

  async getTrendingTopics(
    hours: number = 24,
    minArticles: number = 3
  ): Promise<APIResponse<TrendingTopicsResponse>> {
    const queryString = this.buildQueryString({ hours, min_articles: minArticles });
    return this.fetchWithErrorHandling<TrendingTopicsResponse>(`/api/v1/ai/trending${queryString}`);
  }

  async getArticlesByEntity(
    entityName: string,
    entityType: 'persons' | 'organizations' | 'locations' = 'persons',
    limit: number = 50
  ): Promise<APIResponse<Article[]>> {
    const encodedEntity = encodeURIComponent(entityName);
    const queryString = this.buildQueryString({ type: entityType, limit });
    return this.fetchWithErrorHandling<Article[]>(`/api/v1/ai/entity/${encodedEntity}${queryString}`);
  }

  async getProcessorStats(): Promise<APIResponse<ProcessorStats>> {
    return this.fetchWithErrorHandling<ProcessorStats>('/api/v1/ai/processor/stats');
  }

  async processArticle(articleId: number): Promise<APIResponse<{
    message: string;
    article_id: number;
    enrichment: AIEnrichment;
  }>> {
    return this.fetchWithErrorHandling<{
      message: string;
      article_id: number;
      enrichment: AIEnrichment;
    }>(`/api/v1/articles/${articleId}/process`, {
      method: 'POST',
    });
  }

  async triggerBatchProcessing(): Promise<APIResponse<{
    message: string;
    total_processed: number;
    success_count: number;
    failure_count: number;
    duration: string;
  }>> {
    return this.fetchWithErrorHandling<{
      message: string;
      total_processed: number;
      success_count: number;
      failure_count: number;
      duration: string;
    }>('/api/v1/ai/process/trigger', {
      method: 'POST',
    });
  }

  // Content Extraction (HTML + Browser Fallback Scraping)
  async extractArticleContent(articleId: number): Promise<APIResponse<{
    message: string;
    characters: number;
    extraction_method?: 'html' | 'browser' | 'rss';
    extraction_time_ms?: number;
    article?: Article;
  }>> {
    return this.fetchWithErrorHandling<{
      message: string;
      characters: number;
      extraction_method?: 'html' | 'browser' | 'rss';
      extraction_time_ms?: number;
      article?: Article;
    }>(`/api/v1/articles/${articleId}/extract-content`, {
      method: 'POST',
    });
  }

  // AI Chat
  async sendChatMessage(request: ChatRequest): Promise<APIResponse<ChatResponse>> {
    return this.fetchWithErrorHandling<ChatResponse>('/api/v1/ai/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

// Export singleton instance
export const apiClient = new APIClient(API_BASE_URL, API_KEY);

// Export class for testing
export default APIClient;