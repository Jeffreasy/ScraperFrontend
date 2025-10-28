import type {
  APIResponse,
  Article,
  ArticleFilters,
  SearchFilters,
  SourceInfo,
  CategoryInfo,
  StatsResponse,
  HealthCheckResponse,
  ScrapeRequest,
  ScrapeResponse,
  RateLimitHeaders,
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

  // Health Check
  async healthCheck(): Promise<APIResponse<HealthCheckResponse>> {
    return this.fetchWithErrorHandling<HealthCheckResponse>('/health');
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

  async getScraperStats(): Promise<APIResponse<any>> {
    return this.fetchWithErrorHandling<any>('/api/v1/scraper/stats');
  }
}

// Export singleton instance
export const apiClient = new APIClient(API_BASE_URL, API_KEY);

// Export class for testing
export default APIClient;