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
    ChatRequest,
    ChatResponse,
} from '@/lib/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

// ============================================
// Circuit Breaker Pattern
// ============================================

class CircuitBreaker {
    private failures = 0;
    private successCount = 0;
    private lastFailureTime?: Date;
    private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

    constructor(
        private readonly threshold: number = 5,
        private readonly timeout: number = 60000,
        private readonly monitoringPeriod: number = 10000
    ) { }

    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === 'OPEN') {
            if (this.shouldAttemptReset()) {
                this.state = 'HALF_OPEN';
            } else {
                throw new Error('Circuit breaker is OPEN');
            }
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private onSuccess() {
        this.failures = 0;

        if (this.state === 'HALF_OPEN') {
            this.successCount++;
            if (this.successCount >= 2) {
                this.state = 'CLOSED';
                this.successCount = 0;
                console.log('[Circuit Breaker] Reset to CLOSED state');
            }
        }
    }

    private onFailure() {
        this.failures++;
        this.lastFailureTime = new Date();
        this.successCount = 0;

        if (this.failures >= this.threshold) {
            this.state = 'OPEN';
            console.error(`[Circuit Breaker] OPEN after ${this.failures} failures`);
        }
    }

    private shouldAttemptReset(): boolean {
        return (
            this.lastFailureTime !== undefined &&
            Date.now() - this.lastFailureTime.getTime() >= this.timeout
        );
    }

    public getState() {
        return {
            state: this.state,
            failures: this.failures,
            successCount: this.successCount,
            lastFailureTime: this.lastFailureTime,
        };
    }
}

// ============================================
// Request Deduplication
// ============================================

class RequestDeduplicator {
    private pendingRequests = new Map<string, Promise<any>>();

    async execute<T>(key: string, fn: () => Promise<T>): Promise<T> {
        // Check if request is already pending
        if (this.pendingRequests.has(key)) {
            console.log(`[Dedup] Reusing pending request: ${key}`);
            return this.pendingRequests.get(key) as Promise<T>;
        }

        // Execute new request
        const promise = fn().finally(() => {
            // Clean up after request completes
            this.pendingRequests.delete(key);
        });

        this.pendingRequests.set(key, promise);
        return promise;
    }

    clear() {
        this.pendingRequests.clear();
    }

    getPendingCount() {
        return this.pendingRequests.size;
    }
}

// ============================================
// Advanced API Client
// ============================================

interface RequestConfig extends RequestInit {
    _retryCount?: number;
    skipRetry?: boolean;
    skipCircuitBreaker?: boolean;
    skipDedup?: boolean;
}

class AdvancedAPIClient {
    private baseURL: string;
    private apiKey?: string;
    private readonly maxRetries = 3;
    private readonly retryDelay = 1000;
    private circuitBreaker = new CircuitBreaker(5, 60000);
    private deduplicator = new RequestDeduplicator();

    constructor(baseURL: string, apiKey?: string) {
        this.baseURL = baseURL;
        this.apiKey = apiKey;
    }

    private generateRequestID(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private isRetryableError(response?: Response, error?: any): boolean {
        // Network errors (no response)
        if (!response && error) {
            return true;
        }

        // Retry on specific status codes
        if (response) {
            const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
            return retryableStatusCodes.includes(response.status);
        }

        return false;
    }

    private async handleRetry<T>(
        url: string,
        config: RequestConfig,
        response?: Response,
        error?: any
    ): Promise<APIResponse<T>> {
        // Initialize retry count
        config._retryCount = config._retryCount || 0;

        // Check if we should retry
        const shouldRetry =
            !config.skipRetry &&
            config._retryCount < this.maxRetries &&
            this.isRetryableError(response, error);

        if (!shouldRetry) {
            if (error) throw error;
            if (response) return response.json();
            throw new Error('Unknown error');
        }

        // Increment retry count
        config._retryCount++;

        // Calculate delay with exponential backoff
        const delay = this.retryDelay * Math.pow(2, config._retryCount - 1);

        console.log(`[API] Retrying request (${config._retryCount}/${this.maxRetries}) after ${delay}ms`);

        // Wait before retry
        await this.sleep(delay);

        // Retry request
        return this.fetchWithErrorHandling<T>(url, config);
    }

    private async fetchWithErrorHandling<T>(
        url: string,
        config: RequestConfig = {}
    ): Promise<APIResponse<T>> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-Request-ID': this.generateRequestID(),
            ...(config.headers as Record<string, string>),
        };

        if (this.apiKey) {
            headers['X-API-Key'] = this.apiKey;
        }

        const fullUrl = `${this.baseURL}${url}`;

        try {
            // Execute with circuit breaker
            const executeRequest = async () => {
                const response = await fetch(fullUrl, {
                    ...config,
                    headers,
                });

                // Log request
                console.log(`[API] ${config.method || 'GET'} ${url} - ${response.status}`);

                // Extract rate limit headers
                const rateLimitHeaders: RateLimitHeaders = {
                    limit: parseInt(response.headers.get('X-RateLimit-Limit') || '0'),
                    remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '0'),
                    reset: parseInt(response.headers.get('X-RateLimit-Reset') || '0'),
                };

                // Handle non-OK responses
                if (!response.ok) {
                    // Try to parse error response
                    try {
                        const errorData = await response.json();
                        console.error('[API] Error Response:', errorData);

                        // Retry if appropriate
                        return this.handleRetry<T>(url, config, response);
                    } catch {
                        // If can't parse error, retry
                        return this.handleRetry<T>(url, config, response);
                    }
                }

                const data: APIResponse<T> = await response.json();

                // Attach rate limit info to response
                (data as any).rateLimitHeaders = rateLimitHeaders;

                return data;
            };

            // Use circuit breaker unless explicitly skipped
            if (config.skipCircuitBreaker) {
                return await executeRequest();
            } else {
                return await this.circuitBreaker.execute(executeRequest);
            }
        } catch (error) {
            console.error('[API] Network Error:', error);

            // Retry on network errors
            return this.handleRetry<T>(url, config, undefined, error);
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

    // Create deduplication key
    private createDedupKey(method: string, url: string, params?: any): string {
        const paramStr = params ? JSON.stringify(params) : '';
        return `${method}:${url}:${paramStr}`;
    }

    // Public method to get with deduplication
    private async getWithDedup<T>(
        url: string,
        params?: Record<string, any>,
        config?: RequestConfig
    ): Promise<APIResponse<T>> {
        const queryString = params ? this.buildQueryString(params) : '';
        const fullPath = `${url}${queryString}`;

        if (config?.skipDedup) {
            return this.fetchWithErrorHandling<T>(fullPath, config);
        }

        const key = this.createDedupKey('GET', fullPath, params);
        return this.deduplicator.execute(key, () =>
            this.fetchWithErrorHandling<T>(fullPath, config)
        );
    }

    // ============================================
    // Health Checks
    // ============================================

    async healthCheck(): Promise<APIResponse<HealthResponse>> {
        return this.getWithDedup<HealthResponse>('/health', undefined, {
            skipCircuitBreaker: true // Always check health even if circuit is open
        });
    }

    async livenessCheck(): Promise<APIResponse<LivenessResponse>> {
        return this.fetchWithErrorHandling<LivenessResponse>('/health/live', {
            skipCircuitBreaker: true,
            skipRetry: true,
        });
    }

    async readinessCheck(): Promise<APIResponse<ReadinessResponse>> {
        return this.fetchWithErrorHandling<ReadinessResponse>('/health/ready', {
            skipCircuitBreaker: true,
        });
    }

    async getMetrics(): Promise<APIResponse<MetricsResponse>> {
        return this.getWithDedup<MetricsResponse>('/health/metrics');
    }

    // ============================================
    // Articles
    // ============================================

    async getArticles(filters?: ArticleFilters): Promise<APIResponse<Article[]>> {
        return this.getWithDedup<Article[]>('/api/v1/articles', filters);
    }

    async getArticle(id: number): Promise<APIResponse<Article>> {
        return this.getWithDedup<Article>(`/api/v1/articles/${id}`);
    }

    async searchArticles(filters: SearchFilters): Promise<APIResponse<Article[]>> {
        return this.getWithDedup<Article[]>('/api/v1/articles/search', filters);
    }

    async getArticleStats(): Promise<APIResponse<StatsResponse>> {
        return this.getWithDedup<StatsResponse>('/api/v1/articles/stats');
    }

    // ============================================
    // Sources
    // ============================================

    async getSources(): Promise<APIResponse<SourceInfo[]>> {
        return this.getWithDedup<SourceInfo[]>('/api/v1/sources');
    }

    // ============================================
    // Categories
    // ============================================

    async getCategories(): Promise<APIResponse<CategoryInfo[]>> {
        return this.getWithDedup<CategoryInfo[]>('/api/v1/categories');
    }

    // ============================================
    // Scraper
    // ============================================

    async triggerScrape(request?: ScrapeRequest): Promise<APIResponse<ScrapeResponse>> {
        return this.fetchWithErrorHandling<ScrapeResponse>('/api/v1/scrape', {
            method: 'POST',
            body: request ? JSON.stringify(request) : undefined,
        });
    }

    async getScraperStats(): Promise<APIResponse<any>> {
        return this.getWithDedup<any>('/api/v1/scraper/stats');
    }

    // ============================================
    // AI Enrichment
    // ============================================

    async getArticleEnrichment(articleId: number): Promise<APIResponse<AIEnrichment>> {
        return this.getWithDedup<AIEnrichment>(`/api/v1/articles/${articleId}/enrichment`);
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

        return this.getWithDedup<SentimentStats>('/api/v1/ai/sentiment/stats', params);
    }

    async getTrendingTopics(
        hours: number = 24,
        minArticles: number = 3
    ): Promise<APIResponse<TrendingTopicsResponse>> {
        return this.getWithDedup<TrendingTopicsResponse>('/api/v1/ai/trending', {
            hours,
            min_articles: minArticles,
        });
    }

    async getArticlesByEntity(
        entityName: string,
        entityType: 'persons' | 'organizations' | 'locations' = 'persons',
        limit: number = 50
    ): Promise<APIResponse<Article[]>> {
        const encodedEntity = encodeURIComponent(entityName);
        return this.getWithDedup<Article[]>(`/api/v1/ai/entity/${encodedEntity}`, {
            type: entityType,
            limit,
        });
    }

    async getProcessorStats(): Promise<APIResponse<ProcessorStats>> {
        return this.getWithDedup<ProcessorStats>('/api/v1/ai/processor/stats');
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

    // ============================================
    // AI Chat
    // ============================================

    async sendChatMessage(request: ChatRequest): Promise<APIResponse<ChatResponse>> {
        return this.fetchWithErrorHandling<ChatResponse>('/api/v1/ai/chat', {
            method: 'POST',
            body: JSON.stringify(request),
            skipDedup: true, // Don't deduplicate chat messages
        });
    }

    // ============================================
    // Utilities
    // ============================================

    public getCircuitBreakerState() {
        return this.circuitBreaker.getState();
    }

    public getPendingRequestCount() {
        return this.deduplicator.getPendingCount();
    }

    public clearPendingRequests() {
        this.deduplicator.clear();
    }
}

// Export singleton instance
export const advancedApiClient = new AdvancedAPIClient(API_BASE_URL, API_KEY);

// Export class for testing
export default AdvancedAPIClient;