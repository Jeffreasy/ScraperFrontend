# Advanced Frontend API Integration

Complete gids voor geavanceerde frontend integratie met de NieuwsScraper API.

## 📋 Inhoudsopgave

1. [Health Monitoring & Observability](#health-monitoring--observability)
2. [Advanced TypeScript Types](#advanced-typescript-types)
3. [Production-Ready Patterns](#production-ready-patterns)
4. [Performance Optimalisatie](#performance-optimalisatie)
5. [Real-time Updates & Polling](#real-time-updates--polling)
6. [Error Recovery Strategieën](#error-recovery-strategieën)
7. [Testing Strategieën](#testing-strategieën)
8. [Deployment Checklist](#deployment-checklist)

---

## Health Monitoring & Observability

### Health Check Endpoints

De API biedt meerdere health check endpoints voor verschillende use cases:

#### 1. Comprehensive Health Check
**Endpoint:** `GET /health`

Geeft gedetailleerde status van alle componenten:

```typescript
interface HealthResponse {
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

interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'disabled';
  message?: string;
  latency_ms?: number;
  details?: Record<string, any>;
}
```

**Gebruik:**
```typescript
const checkHealth = async (): Promise<HealthResponse> => {
  const response = await fetch('http://localhost:8080/health');
  const data = await response.json();
  return data.data;
};

// Implementeer status dashboard
const HealthDashboard = () => {
  const { data: health, isLoading } = useQuery({
    queryKey: ['health'],
    queryFn: checkHealth,
    refetchInterval: 30000, // Check elke 30 seconden
  });

  if (isLoading) return <Spinner />;

  return (
    <div className="health-dashboard">
      <StatusIndicator status={health.status} />
      <Uptime seconds={health.uptime_seconds} />
      
      <div className="components">
        {Object.entries(health.components).map(([name, component]) => (
          <ComponentCard 
            key={name}
            name={name}
            health={component}
          />
        ))}
      </div>
    </div>
  );
};
```

#### 2. Liveness Probe
**Endpoint:** `GET /health/live`

Simpele check of de applicatie draait (voor Kubernetes/Docker):

```json
{
  "status": "alive",
  "time": "2025-01-28T16:30:00Z"
}
```

#### 3. Readiness Probe
**Endpoint:** `GET /health/ready`

Check of de applicatie klaar is om traffic te ontvangen.

#### 4. Detailed Metrics
**Endpoint:** `GET /health/metrics`

Prometheus-compatibele metrics met database, AI en scraper statistieken.

---

## Advanced TypeScript Types

Complete type definities voor alle API responses zijn beschikbaar in [`lib/types/api.ts`](../../lib/types/api.ts).

Belangrijkste types:
- `APIResponse<T>` - Wrapper voor alle API responses
- `HealthResponse` - Health check data
- `Article` - Artikel data met AI enrichment
- `SentimentStats` - Sentiment analyse statistieken
- `TrendingTopicsResponse` - Trending topics data

---

## Production-Ready Patterns

### 1. API Client met Retry Logic

De advanced API client in [`lib/api/advanced-client.ts`](../../lib/api/advanced-client.ts) implementeert:

- ✨ **Retry Logic met Exponential Backoff** - Automatisch herproberen bij fouten
- 🔌 **Circuit Breaker Pattern** - Voorkomt cascade failures
- 🔄 **Request Deduplication** - Voorkomt duplicate API calls
- 📊 **Request ID Tracking** - Voor debugging

**Gebruik:**
```typescript
import { advancedApiClient } from '@/lib/api/advanced-client';

// Alle requests hebben automatisch retry + circuit breaker
const articles = await advancedApiClient.getArticles({ limit: 20 });
const health = await advancedApiClient.healthCheck();

// Check circuit breaker status
const state = advancedApiClient.getCircuitBreakerState();
console.log('Circuit breaker:', state.state); // CLOSED, OPEN, or HALF_OPEN
```

### 2. Circuit Breaker Pattern

Automatische bescherming tegen cascade failures:
- Opent na 5 opeenvolgende fouten
- Blijft open voor 60 seconden
- Half-open state voor recovery testing

### 3. Request Deduplication

Voorkomt duplicate requests wanneer dezelfde data al wordt opgehaald:

```typescript
// Beide calls gebruiken hetzelfde request
const data1 = advancedApiClient.getArticles({ limit: 20 });
const data2 = advancedApiClient.getArticles({ limit: 20 });
// Slechts 1 netwerkverzoek!
```

---

## Performance Optimalisatie

### 1. Intelligent Caching Strategy

Verschillende cache times per data type in [`components/providers.tsx`](../../components/providers.tsx):

```typescript
const STALE_TIMES = {
  articles: 5 * 60 * 1000,      // 5 min
  stats: 2 * 60 * 1000,          // 2 min
  trending: 1 * 60 * 1000,       // 1 min
  sentiment: 5 * 60 * 1000,      // 5 min
  health: 30 * 1000,             // 30 sec
  sources: 60 * 60 * 1000,       // 1 uur
  categories: 10 * 60 * 1000,    // 10 min
};
```

### 2. Optimistic Updates

Voor mutations zoals scraper triggers:

```typescript
const { mutate } = useMutation({
  mutationFn: () => advancedApiClient.triggerScrape(),
  onMutate: () => {
    // Update UI direct
    setStatus('running');
  },
  onSuccess: () => {
    // Invalidate en refetch
    queryClient.invalidateQueries({ queryKey: ['articles'] });
  },
});
```

### 3. Prefetch Strategies

Prefetch volgende pagina en static data via [`lib/hooks/use-prefetch.ts`](../../lib/hooks/use-prefetch.ts).

---

## Real-time Updates & Polling

### Adaptive Polling Strategy

Via [`lib/hooks/use-adaptive-polling.ts`](../../lib/hooks/use-adaptive-polling.ts):

```typescript
const { data } = useAdaptivePolling(
  ['trending'],
  () => advancedApiClient.getTrendingTopics(),
  {
    minInterval: 30000,  // 30 sec when active
    maxInterval: 300000, // 5 min when inactive
  }
);
```

Past polling frequentie aan op basis van gebruikersactiviteit.

---

## Error Recovery Strategieën

### 1. Graceful Degradation

Components degraderen gracefully wanneer delen van de data niet beschikbaar zijn:

```typescript
const ArticleDetailWithAI = ({ articleId }) => {
  const { data: article, error: articleError } = useQuery({
    queryKey: ['article', articleId],
    queryFn: () => api.getArticle(articleId),
  });

  const { data: aiEnrichment } = useQuery({
    queryKey: ['enrichment', articleId],
    queryFn: () => api.getArticleEnrichment(articleId),
    retry: 1,
    enabled: !!article,
  });

  // Core content always renders, AI features degrade gracefully
  return (
    <div>
      <ArticleContent article={article} />
      {aiEnrichment?.data && <AIInsights data={aiEnrichment.data} />}
    </div>
  );
};
```

### 2. Offline Support

Via [`lib/hooks/use-online-status.ts`](../../lib/hooks/use-online-status.ts):

- Detecteert online/offline status
- Automatisch retry bij reconnection
- Pauseert API calls wanneer offline

---

## Testing Strategieën

### Mock API voor Development

Gebruik MSW (Mock Service Worker) voor development testing:

```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/v1/articles', (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      data: mockArticles,
    }));
  })
);
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] **Environment Variables**
  ```bash
  NEXT_PUBLIC_API_URL=https://api.example.com
  NEXT_PUBLIC_API_KEY=your-production-key
  ```

- [ ] **API Configuration**
  - Update base URL naar productie API
  - Configureer API keys
  - Test alle endpoints
  - Verificeer CORS settings

- [ ] **Performance**
  - Enable production build
  - Configure code splitting
  - Enable compression (gzip/brotli)
  - Optimize bundle size

- [ ] **Monitoring**
  - Setup error tracking (Sentry)
  - Configure analytics
  - Setup performance monitoring

- [ ] **Security**
  - Review API key handling
  - Configure CSP headers
  - Enable HTTPS only
  - Review CORS settings

### Post-Deployment

- [ ] Test health endpoints
- [ ] Verify API connectivity
- [ ] Test core functionality
- [ ] Monitor error rates
- [ ] Track performance metrics

---

## Best Practices Samenvatting

### DO ✅

1. **Use TypeScript** voor type safety
2. **Implement retry logic** voor netwerk fouten
3. **Cache intelligently** met verschillende TTLs
4. **Handle errors gracefully** met fallbacks
5. **Monitor health** van de API
6. **Use pagination** voor grote datasets
7. **Track request IDs** voor debugging
8. **Respect rate limits** via headers

### DON'T ❌

1. **Don't ignore error responses**
2. **Don't poll too aggressively**
3. **Don't cache everything**
4. **Don't expose API keys** in client code
5. **Don't ignore health check failures**
6. **Don't retry non-retryable errors** (4xx)
7. **Don't block UI** tijdens API calls
8. **Don't forget to cleanup** subscriptions

---

## Resources

- **API Client**: [`lib/api/advanced-client.ts`](../../lib/api/advanced-client.ts)
- **Type Definitions**: [`lib/types/api.ts`](../../lib/types/api.ts)
- **Hooks**: [`lib/hooks/`](../../lib/hooks/)
- **Components**: [`components/health/`](../../components/health/)

---

**Status**: ✅ Complete geavanceerde frontend guide  
**Versie**: 1.0.0  
**Laatste Update**: 2025-01-28