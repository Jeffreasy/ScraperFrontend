# 📊 Monitoring Dashboard Documentatie

Complete gids voor het gebruik van de monitoring en metrics dashboards in de Nieuwscraper Frontend.

## 📋 Inhoudsopgave

- [Overzicht](#overzicht)
- [Beschikbare Dashboards](#beschikbare-dashboards)
- [API Endpoints](#api-endpoints)
- [Components](#components)
- [Hooks](#hooks)
- [Auto-Refresh](#auto-refresh)

## 🎯 Overzicht

De Nieuwscraper Frontend heeft nu complete monitoring capabilities met real-time dashboards voor:

- **System Health**: Database, Redis, Scraper en AI Processor status
- **Scraper Statistics**: Articles per bron, circuit breakers, content extraction
- **AI Analytics**: Sentiment analyse en trending topics
- **Article Statistics**: Totaal artikelen, bronnen en categorieën

## 📱 Beschikbare Dashboards

### 1. Admin Dashboard (`/admin`)

**Het complete monitoring overzicht met alle metrics in één view.**

**Features:**
- System health overview met alle componenten
- Quick stats cards (totaal artikelen, 24u activiteit, bronnen, categorieën)
- Complete scraper statistieken met circuit breakers
- Browser pool status (als enabled)
- Content extraction progress
- AI sentiment dashboard
- Trending topics
- Auto-refresh elke 30 seconden

**Navigatie:**
```typescript
// Toegankelijk via navbar: Admin (Shield icon)
<Link href="/admin">Admin Dashboard</Link>
```

### 2. Health Dashboard (`/health`)

**Gedetailleerde component health monitoring.**

**Features:**
- Overall system status (healthy/degraded/unhealthy)
- Uptime tracking
- Component-by-component status
- Database connection pool metrics
- Browser pool statistics
- Content extraction progress
- System metrics display

**API Endpoints:**
- `GET /health` - Basic health
- `GET /health/metrics` - Detailed metrics
- `GET /api/v1/scraper/stats` - Scraper stats

### 3. Stats Dashboard (`/stats`)

**Article en database statistieken.**

**Features:**
- Totaal artikelen count
- Artikelen laatste 24 uur
- Bronnen overzicht met percentages
- Categorieën grid met icons
- Datum bereik (oudste/nieuwste)
- AI processor status

### 4. AI Insights (`/ai`)

**AI-powered analytics en insights.**

**Features:**
- Sentiment dashboard met percentages
- Trending topics (laatste 24 uur)
- Average sentiment meter
- Meest positieve/negatieve artikelen
- Entity extraction info

## 🔌 API Endpoints

### Health & Monitoring

```typescript
// Public endpoints (geen API key)
GET /health                    // Basic health check
GET /health/live              // Liveness probe
GET /health/ready             // Readiness probe
GET /health/metrics           // Detailed metrics

// Response voorbeeld:
{
  "status": "healthy",
  "timestamp": "2025-10-28T19:00:00Z",
  "version": "1.0.0",
  "uptime_seconds": 3600,
  "components": {
    "database": { "status": "healthy", "latency_ms": 2 },
    "redis": { "status": "unavailable" },
    "scraper": { "status": "healthy" },
    "ai_processor": { "status": "healthy" }
  },
  "metrics": {
    "db_total_conns": 8,
    "db_idle_conns": 5,
    "ai_process_count": 150
  }
}
```

### Scraper Statistics

```typescript
// Protected endpoint (X-API-Key required)
GET /api/v1/scraper/stats

// Response:
{
  "articles_by_source": {
    "nu.nl": 450,
    "ad.nl": 380,
    "nos.nl": 320
  },
  "rate_limit_delay": 5.0,
  "sources_configured": ["nu.nl", "ad.nl", "nos.nl"],
  "circuit_breakers": {
    "nu.nl": { "state": "closed", "failures": 0 },
    "ad.nl": { "state": "closed", "failures": 0 }
  },
  "content_extraction": {
    "total": 150,
    "extracted": 95,
    "pending": 55
  },
  "browser_pool": {
    "enabled": true,
    "pool_size": 3,
    "available": 2,
    "in_use": 1,
    "closed": false
  }
}
```

### Article Statistics

```typescript
// Public endpoint
GET /api/v1/articles/stats

// Response:
{
  "total_articles": 1150,
  "recent_articles_24h": 75,
  "articles_by_source": {
    "nu.nl": 450,
    "ad.nl": 380,
    "nos.nl": 320
  },
  "categories": {
    "Politics": { "name": "Politics", "article_count": 250 },
    "Sports": { "name": "Sports", "article_count": 180 }
  },
  "oldest_article": "2025-10-21T10:00:00Z",
  "newest_article": "2025-10-28T18:55:00Z"
}
```

### AI Analytics

```typescript
// Sentiment Statistics (public)
GET /api/v1/ai/sentiment/stats

// Response:
{
  "total_articles": 1150,
  "positive_count": 450,
  "neutral_count": 520,
  "negative_count": 180,
  "average_sentiment": 0.15,
  "most_positive_title": "Geweldig nieuws...",
  "most_negative_title": "Tragische gebeurtenis..."
}

// Trending Topics (public)
GET /api/v1/ai/trending?hours=24&min_articles=3

// Response:
{
  "topics": [
    {
      "keyword": "Zelensky",
      "article_count": 45,
      "average_sentiment": -0.3,
      "sources": ["nos.nl", "nu.nl"]
    }
  ],
  "hours_back": 24,
  "min_articles": 3,
  "count": 10
}

// AI Processor Stats (public)
GET /api/v1/ai/processor/stats

// Response:
{
  "is_running": true,
  "process_count": 1150,
  "last_run": "2025-10-28T18:55:00Z"
}
```

## 🧩 Components

### ScraperStatsCard

**Complete scraper monitoring component.**

```typescript
import { ScraperStatsCard } from '@/components/scraper';

<ScraperStatsCard />
```

**Toont:**
- Artikelen per bron met percentages
- Circuit breaker states (closed/open/half_open)
- Content extraction progress
- Browser pool status
- Geconfigureerde bronnen

### HealthDashboard

**System health monitoring.**

```typescript
import { HealthDashboard } from '@/components/health';

<HealthDashboard />
```

**Toont:**
- Overall system status
- Component health cards
- Browser pool stats
- Content extraction progress
- System metrics

### SentimentDashboard

**AI sentiment analysis visualization.**

```typescript
import { SentimentDashboard } from '@/components/ai/sentiment-dashboard';

<SentimentDashboard 
  source="nu.nl"        // Optional: filter by source
  startDate="2025-01-01" // Optional: date range
  endDate="2025-12-31"
/>
```

**Toont:**
- Positive/Neutral/Negative counts met percentages
- Average sentiment meter
- Meest positieve/negatieve artikelen
- Dominant sentiment highlighting

### TrendingTopics

**Real-time trending topics.**

```typescript
import { TrendingTopics } from '@/components/ai/trending-topics';

<TrendingTopics 
  hours={24}          // Time window
  minArticles={3}     // Minimum articles per topic
  maxTopics={10}      // Max topics to show
/>
```

**Toont:**
- Top trending keywords
- Article counts
- Average sentiment per topic
- Source distribution

## 🪝 Hooks

### useHealth

```typescript
import { useHealth } from '@/lib/hooks/use-health';

const { data, isLoading, isError } = useHealth();

// Auto-refresh: 30 seconds
// Returns: APIResponse<HealthResponse>
```

### useMetrics

```typescript
import { useMetrics } from '@/lib/hooks/use-health';

const { data, isLoading } = useMetrics();

// Auto-refresh: 30 seconds
// Returns: APIResponse<MetricsResponse>
```

### useScraperStats

```typescript
import { useScraperStats } from '@/lib/hooks/use-scraper-stats';

const { data, isLoading } = useScraperStats();

// Auto-refresh: 5 seconds (real-time)
// Returns: APIResponse<ScraperStatsResponse>
```

### useSentimentStats

```typescript
import { useSentimentStats } from '@/lib/hooks/use-article-ai';

const { data, isLoading } = useSentimentStats(source?, startDate?, endDate?);

// Auto-refresh: 30 seconds
// Returns: SentimentStats
```

### useTrendingTopics

```typescript
import { useTrendingTopics } from '@/lib/hooks/use-article-ai';

const { data, isLoading } = useTrendingTopics(hours, minArticles);

// Auto-refresh: 30 seconds
// Returns: TrendingTopicsResponse
```

## 🔄 Auto-Refresh

Alle monitoring hooks hebben ingebouwde auto-refresh:

| Hook | Interval | Stale Time |
|------|----------|------------|
| `useHealth` | 30s | 30s |
| `useMetrics` | 30s | 30s |
| `useScraperStats` | 5s | 5s |
| `useSentimentStats` | 30s | 30s |
| `useTrendingTopics` | 30s | 30s |
| `useProcessorStats` | 30s | 30s |

**Configuratie aanpassen:**

```typescript
// In components/providers.tsx
export const STALE_TIMES = {
  health: 30 * 1000,      // 30 seconds
  stats: 60 * 1000,       // 1 minute
  processor: 30 * 1000,   // 30 seconds
  articles: 5 * 60 * 1000, // 5 minutes
};
```

## 🎨 Styling & Theming

Alle components gebruiken het design system uit [`lib/styles/theme.ts`](lib/styles/theme.ts):

```typescript
// Status colors
status: {
  healthy: 'text-green-600 bg-green-50 border-green-200',
  degraded: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  unhealthy: 'text-red-600 bg-red-50 border-red-200',
}

// Sentiment colors
sentiment: {
  positive: 'text-green-600 bg-green-50',
  neutral: 'text-gray-600 bg-gray-50',
  negative: 'text-red-600 bg-red-50',
}
```

## 🚀 Gebruik in Productie

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_API_KEY=your-api-key-here
```

### Health Checks voor Monitoring Tools

```bash
# Kubernetes liveness probe
curl http://localhost:3000/api/health/live

# Kubernetes readiness probe  
curl http://localhost:3000/api/health/ready

# Metrics voor monitoring
curl http://localhost:3000/api/health/metrics
```

### Performance

- **Real-time updates**: Scraper stats refresh elke 5 seconden
- **Optimized queries**: React Query met stale times
- **Request deduplication**: Automatic via advancedApiClient
- **Circuit breaker**: Prevents cascade failures
- **Skeleton loading**: Smooth UX tijdens laden

## 📈 Monitoring Best Practices

1. **Dashboard Hierarchy**
   - Admin Dashboard voor overall view
   - Health Dashboard voor troubleshooting
   - Stats Dashboard voor data analysis
   - AI Dashboard voor content insights

2. **Alert Thresholds**
   - System status: Unhealthy → immediate alert
   - Circuit breaker: Open → investigate source
   - Database connections: > 80% usage → scale up
   - Content extraction: < 50% success rate → check browser pool

3. **Regular Checks**
   - System uptime en versie
   - Article growth rate (24h comparison)
   - AI processor activity
   - Browser pool availability

## 🐛 Troubleshooting

### Dashboard niet laden?

```typescript
// Check console voor errors
// Verify API_URL en API_KEY in .env.local

// Test endpoints direct:
curl http://localhost:8080/health
curl http://localhost:8080/api/v1/scraper/stats \
  -H "X-API-Key: your-key"
```

### Auto-refresh werkt niet?

```typescript
// Check React Query DevTools
// Verify refetchInterval settings
// Check browser console voor errors
```

### Scraper stats niet beschikbaar?

```typescript
// Requires API key voor protected endpoint
// Check headers in network tab
// Verify backend scraper is running
```

## 📚 Gerelateerde Documentatie

- [API Integration](./AI_INTEGRATION.md)
- [Browser Scraping](./BROWSER_SCRAPING_INTEGRATION.md)
- [Component Styling](./styling/COMPONENT-STYLING.md)
- [Design System](./styling/DESIGN-SYSTEM.md)

## ✅ Feature Checklist

- [x] Health endpoints (4 types)
- [x] Article statistics
- [x] Scraper statistics met circuit breakers
- [x] Browser pool monitoring
- [x] Content extraction tracking
- [x] AI sentiment dashboard
- [x] Trending topics
- [x] Processor stats
- [x] Auto-refresh hooks
- [x] Admin dashboard
- [x] Navigation integration
- [x] Error boundaries
- [x] Loading skeletons
- [x] TypeScript types
- [x] Real-time updates

## 🎊 Klaar voor Gebruik!

Alle monitoring endpoints zijn nu beschikbaar in de frontend. Start de backend met browser scraping enabled en bekijk de complete metrics in real-time!

```bash
# Backend starten
cd ../backend
go run cmd/main.go

# Frontend starten  
npm run dev

# Navigate naar:
http://localhost:3000/admin  # Complete dashboard