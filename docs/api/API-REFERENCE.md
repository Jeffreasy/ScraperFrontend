# Complete API Reference for Frontend

**Base URL**: `http://localhost:8080` (development)  
**API Version**: v1  
**Last Updated**: 2025-10-30

---

## Table of Contents

1. [Health Endpoints](#health-endpoints) (No Auth)
2. [Analytics Endpoints](#analytics-endpoints) (Public)
3. [Article Endpoints](#article-endpoints) (Public)
4. [AI Endpoints](#ai-endpoints) (Public)
5. [Stock Endpoints](#stock-endpoints) (Public - FMP Free Tier)
6. [Source & Category Endpoints](#source--category-endpoints) (Public)
7. [Protected Endpoints](#protected-endpoints) (Require Auth)
8. [Response Format](#response-format)
9. [Error Handling](#error-handling)
10. [Rate Limiting](#rate-limiting)

---

## Health Endpoints

### GET `/health`
**Comprehensive health check with all components**

**Auth**: None required

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-10-30T14:00:00Z",
    "version": "1.0.0",
    "uptime_seconds": 3600.5,
    "components": {
      "database": {
        "status": "healthy",
        "message": "Database connection healthy",
        "latency_ms": 2.5,
        "details": {
          "total_conns": 10,
          "idle_conns": 8,
          "acquired_conns": 2,
          "max_conns": 20
        }
      },
      "redis": {
        "status": "healthy",
        "message": "Redis connection healthy",
        "latency_ms": 1.2,
        "details": {
          "cache_available": true
        }
      },
      "scraper": {
        "status": "healthy",
        "message": "Scraper service operational"
      },
      "ai_processor": {
        "status": "healthy",
        "message": "AI processor operational",
        "details": {
          "is_running": true,
          "process_count": 150,
          "last_run": "2025-10-30T13:55:00Z"
        }
      }
    },
    "metrics": {
      "uptime_seconds": 3600.5,
      "db_total_conns": 10,
      "ai_process_count": 150
    }
  },
  "request_id": "abc123",
  "timestamp": "2025-10-30T14:00:00Z"
}
```

### GET `/health/live`
**Simple liveness probe (Kubernetes-style)**

**Auth**: None required

**Response**:
```json
{
  "status": "alive",
  "time": "2025-10-30T14:00:00Z"
}
```

### GET `/health/ready`
**Readiness probe checking critical dependencies**

**Auth**: None required

**Response**:
```json
{
  "status": "ready",
  "components": {
    "database": true,
    "redis": true
  },
  "time": "2025-10-30T14:00:00Z"
}
```

### GET `/health/metrics`
**Detailed system metrics (Prometheus-compatible)**

**Auth**: None required

**Response**:
```json
{
  "success": true,
  "data": {
    "timestamp": 1698674400,
    "uptime": 3600.5,
    "db_total_conns": 10,
    "db_idle_conns": 8,
    "db_acquired_conns": 2,
    "ai_is_running": true,
    "ai_process_count": 150,
    "scraper": {
      "total_scrapes": 100,
      "successful_scrapes": 98
    }
  },
  "request_id": "abc123"
}
```

---

## Analytics Endpoints

### GET `/api/v1/analytics/trending`
**Get trending keywords from recent articles**

**Auth**: None required

**Query Parameters**:
- `hours` (int, default: 24) - Hours to look back
- `min_articles` (int, default: 3) - Minimum article count
- `limit` (int, default: 20, max: 100) - Number of results

**Example Request**:
```
GET /api/v1/analytics/trending?hours=24&min_articles=3&limit=20
```

**Response**:
```json
{
  "trending": [
    {
      "keyword": "AI",
      "article_count": 15,
      "source_count": 3,
      "sources": ["nu.nl", "nos.nl", "ad.nl"],
      "avg_sentiment": 0.65,
      "avg_relevance": 0.85,
      "most_recent": "2025-10-30T13:45:00Z",
      "trending_score": 12.5
    }
  ],
  "meta": {
    "hours": 24,
    "min_articles": 3,
    "limit": 20,
    "count": 15
  }
}
```

### GET `/api/v1/analytics/sentiment-trends`
**Get sentiment trends over the last 7 days**

**Auth**: None required

**Query Parameters**:
- `source` (string, optional) - Filter by news source

**Example Request**:
```
GET /api/v1/analytics/sentiment-trends?source=nu.nl
```

**Response**:
```json
{
  "trends": [
    {
      "day": "2025-10-30",
      "source": "nu.nl",
      "total_articles": 50,
      "positive_count": 20,
      "neutral_count": 25,
      "negative_count": 5,
      "avg_sentiment": 0.45,
      "positive_percentage": 40.0,
      "negative_percentage": 10.0
    }
  ],
  "meta": {
    "source": "nu.nl",
    "count": 7
  }
}
```

### GET `/api/v1/analytics/hot-entities`
**Get most mentioned entities from the last 7 days**

**Auth**: None required

**Query Parameters**:
- `entity_type` (string, optional) - Filter by type (person, organization, location)
- `limit` (int, default: 50, max: 100) - Number of results

**Example Request**:
```
GET /api/v1/analytics/hot-entities?entity_type=person&limit=20
```

**Response**:
```json
{
  "entities": [
    {
      "entity": "Elon Musk",
      "entity_type": "person",
      "total_mentions": 45,
      "days_mentioned": 6,
      "sources": ["nu.nl", "nos.nl"],
      "overall_sentiment": 0.35,
      "most_recent_mention": "2025-10-30T13:45:00Z"
    }
  ],
  "meta": {
    "entity_type": "person",
    "limit": 20,
    "count": 18
  }
}
```

### GET `/api/v1/analytics/entity-sentiment`
**Get sentiment analysis for a specific entity**

**Auth**: None required

**Query Parameters**:
- `entity` (string, required) - Entity name
- `days` (int, default: 30, max: 365) - Days to look back

**Example Request**:
```
GET /api/v1/analytics/entity-sentiment?entity=Apple&days=30
```

**Response**:
```json
{
  "entity": "Apple",
  "timeline": [
    {
      "day": "2025-10-30",
      "mention_count": 12,
      "avg_sentiment": 0.65,
      "sources": ["nu.nl", "nos.nl"],
      "categories": ["technology", "business"]
    }
  ],
  "meta": {
    "days": 30,
    "count": 25
  }
}
```

### GET `/api/v1/analytics/overview`
**Get comprehensive analytics overview**

**Auth**: None required

**Response**:
```json
{
  "trending_keywords": [...],
  "hot_entities": [...],
  "materialized_views": [
    {
      "name": "v_trending_keywords_24h",
      "size": "128 kB"
    }
  ],
  "meta": {
    "trending_count": 10,
    "entities_count": 10,
    "views_count": 5
  }
}
```

### GET `/api/v1/analytics/article-stats`
**Get comprehensive article statistics by source**

**Auth**: None required

**Response**:
```json
{
  "sources": [
    {
      "source": "nu.nl",
      "source_name": "NU.nl",
      "total_articles": 1500,
      "articles_today": 45,
      "articles_week": 320,
      "ai_processed_count": 1200,
      "content_extracted_count": 800,
      "latest_article_date": "2025-10-30T13:45:00Z",
      "oldest_article_date": "2025-09-01T08:00:00Z",
      "avg_sentiment": 0.35
    }
  ],
  "meta": {
    "count": 3
  }
}
```

### GET `/api/v1/analytics/maintenance-schedule`
**Get recommended maintenance schedule**

**Auth**: None required

**Response**:
```json
{
  "tasks": [
    {
      "task": "Refresh trending keywords view",
      "frequency": "every 5 minutes",
      "last_run": "2025-10-30T13:55:00Z",
      "next_recommended": "2025-10-30T14:00:00Z",
      "status": "ok"
    }
  ],
  "meta": {
    "count": 5
  }
}
```

### GET `/api/v1/analytics/database-health`
**Get database health metrics**

**Auth**: None required

**Response**:
```json
{
  "table_sizes": [
    {
      "table": "articles",
      "size": "45 MB",
      "bytes": 47185920
    }
  ],
  "cache_hit_ratio": 98.5,
  "connection_count": 10,
  "status": "healthy"
}
```

### POST `/api/v1/analytics/refresh`
**Refresh all materialized views**

**Auth**: None required

**Query Parameters**:
- `concurrent` (boolean, default: true) - Use concurrent refresh

**Example Request**:
```
POST /api/v1/analytics/refresh?concurrent=true
```

**Response**:
```json
{
  "message": "Analytics refreshed successfully",
  "results": [
    {
      "view_name": "v_trending_keywords_24h",
      "refresh_time_ms": 250,
      "rows_affected": 150
    }
  ],
  "summary": {
    "total_views": 5,
    "total_rows": 750,
    "total_time_ms": 1200,
    "concurrent_mode": true
  }
}
```

---

## Article Endpoints

### GET `/api/v1/articles`
**List articles with filtering and pagination**

**Auth**: Optional

**Query Parameters**:
- `source` (string) - Filter by source
- `category` (string) - Filter by category
- `keyword` (string) - Filter by keyword
- `start_date` (RFC3339) - Filter from date
- `end_date` (RFC3339) - Filter to date
- `sort_by` (string, default: "published") - Sort field (published, created_at, title)
- `sort_order` (string, default: "desc") - Sort order (asc, desc)
- `limit` (int, default: 50, max: 100) - Results per page
- `offset` (int, default: 0) - Pagination offset

**Example Request**:
```
GET /api/v1/articles?source=nu.nl&limit=20&sort_by=published&sort_order=desc
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "title": "Breaking News Article",
      "url": "https://example.com/article",
      "source": "nu.nl",
      "source_name": "NU.nl",
      "category": "technology",
      "published": "2025-10-30T13:45:00Z",
      "created_at": "2025-10-30T13:46:00Z",
      "summary": "Article summary...",
      "content": "Full article content...",
      "image_url": "https://example.com/image.jpg",
      "ai_processed": true,
      "sentiment_score": 0.65,
      "sentiment_label": "positive",
      "ai_summary": "AI-generated summary...",
      "keywords": ["AI", "technology"],
      "entities": {
        "persons": ["John Doe"],
        "organizations": ["OpenAI"],
        "locations": ["San Francisco"]
      },
      "stock_tickers": ["AAPL", "MSFT"]
    }
  ],
  "meta": {
    "pagination": {
      "total": 1500,
      "limit": 20,
      "offset": 0,
      "current_page": 1,
      "total_pages": 75,
      "has_next": true,
      "has_prev": false
    },
    "sorting": {
      "sort_by": "published",
      "sort_order": "desc"
    },
    "filtering": {
      "source": "nu.nl"
    }
  },
  "request_id": "abc123",
  "timestamp": "2025-10-30T14:00:00Z"
}
```

### GET `/api/v1/articles/:id`
**Get a single article by ID**

**Auth**: Optional

**Example Request**:
```
GET /api/v1/articles/123
```

**Response**: Same structure as individual article in list response

### GET `/api/v1/articles/search`
**Full-text search for articles**

**Auth**: Optional

**Query Parameters**:
- `q` (string, required) - Search query
- `source` (string) - Filter by source
- `category` (string) - Filter by category
- `sort_by` (string, default: "published") - Sort field
- `sort_order` (string, default: "desc") - Sort order
- `limit` (int, default: 50, max: 100) - Results per page
- `offset` (int, default: 0) - Pagination offset

**Example Request**:
```
GET /api/v1/articles/search?q=artificial+intelligence&limit=20
```

**Response**: Same structure as GET `/api/v1/articles`

### GET `/api/v1/articles/stats`
**Get comprehensive article statistics**

**Auth**: Optional

**Response**:
```json
{
  "success": true,
  "data": {
    "total_articles": 5000,
    "articles_by_source": {
      "nu.nl": 2000,
      "nos.nl": 1800,
      "ad.nl": 1200
    },
    "recent_articles_24h": 150,
    "oldest_article": "2025-09-01T00:00:00Z",
    "newest_article": "2025-10-30T13:45:00Z",
    "categories": {
      "technology": {
        "name": "technology",
        "article_count": 800
      }
    }
  },
  "request_id": "abc123"
}
```

### POST `/api/v1/articles/:id/extract-content`
**Extract full content from article URL (Protected)**

**Auth**: Required (API Key)

**Example Request**:
```
POST /api/v1/articles/123/extract-content
Headers:
  X-API-Key: your-api-key
```

**Response**:
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Content extracted successfully",
    "characters": 5420,
    "article": {
      "id": 123,
      "content": "Full extracted content..."
    }
  },
  "request_id": "abc123"
}
```

### GET `/api/v1/articles/:id/enrichment`
**Get AI enrichment for an article**

**Auth**: Optional

**Example Request**:
```
GET /api/v1/articles/123/enrichment
```

**Response**:
```json
{
  "success": true,
  "data": {
    "article_id": 123,
    "sentiment_score": 0.65,
    "sentiment_label": "positive",
    "ai_summary": "AI-generated summary...",
    "keywords": ["AI", "technology", "innovation"],
    "entities": {
      "persons": ["Elon Musk", "Sam Altman"],
      "organizations": ["OpenAI", "Tesla"],
      "locations": ["San Francisco", "California"]
    },
    "stock_tickers": ["TSLA", "MSFT"],
    "categories": ["technology", "business"],
    "processed_at": "2025-10-30T13:50:00Z"
  },
  "request_id": "abc123"
}
```

### GET `/api/v1/articles/by-ticker/:symbol`
**Get articles mentioning a specific stock ticker**

**Auth**: Optional

**Query Parameters**:
- `limit` (int, default: 50, max: 100) - Number of results

**Example Request**:
```
GET /api/v1/articles/by-ticker/AAPL?limit=20
```

**Response**: Same structure as GET `/api/v1/articles`

---

## AI Endpoints

### GET `/api/v1/ai/sentiment/stats`
**Get sentiment statistics**

**Auth**: Optional

**Query Parameters**:
- `source` (string, optional) - Filter by source
- `start_date` (RFC3339, optional) - Start date
- `end_date` (RFC3339, optional) - End date

**Example Request**:
```
GET /api/v1/ai/sentiment/stats?source=nu.nl
```

**Response**:
```json
{
  "success": true,
  "data": {
    "total_articles": 1500,
    "positive_count": 600,
    "negative_count": 300,
    "neutral_count": 600,
    "avg_sentiment": 0.35,
    "positive_percentage": 40.0,
    "negative_percentage": 20.0,
    "neutral_percentage": 40.0,
    "by_source": {
      "nu.nl": {
        "total": 500,
        "positive": 200,
        "negative": 100,
        "neutral": 200,
        "avg_sentiment": 0.30
      }
    }
  },
  "request_id": "abc123"
}
```

### GET `/api/v1/ai/trending`
**Get trending topics from AI analysis**

**Auth**: Optional

**Query Parameters**:
- `hours` (int, default: 24) - Hours to look back
- `min_articles` (int, default: 3) - Minimum article count

**Example Request**:
```
GET /api/v1/ai/trending?hours=24&min_articles=3
```

**Response**:
```json
{
  "success": true,
  "data": {
    "topics": [
      {
        "keyword": "artificial intelligence",
        "article_count": 25,
        "sentiment": 0.65,
        "relevance": 0.85,
        "sources": ["nu.nl", "nos.nl"]
      }
    ],
    "hours_back": 24,
    "min_articles": 3,
    "count": 15
  },
  "request_id": "abc123"
}
```

### GET `/api/v1/ai/entity/:name`
**Get articles mentioning a specific entity**

**Auth**: Optional

**Query Parameters**:
- `type` (string, optional) - Entity type (persons, organizations, locations)
- `limit` (int, default: 50, max: 100) - Number of results

**Example Request**:
```
GET /api/v1/ai/entity/Elon%20Musk?type=persons&limit=20
```

**Response**: Same structure as GET `/api/v1/articles`

### GET `/api/v1/ai/processor/stats`
**Get AI processor statistics**

**Auth**: Optional

**Response**:
```json
{
  "success": true,
  "data": {
    "is_running": true,
    "process_count": 1500,
    "success_count": 1450,
    "failure_count": 50,
    "last_run": "2025-10-30T13:55:00Z",
    "current_interval": "5m0s",
    "avg_processing_time": "2.5s"
  },
  "request_id": "abc123"
}
```

### POST `/api/v1/ai/chat`
**Conversational AI chat endpoint**

**Auth**: Optional

**Request Body**:
```json
{
  "message": "What are the trending topics today?",
  "context": "general",
  "article_id": 123,
  "article_content": "Optional article content for context"
}
```

**Example Request**:
```
POST /api/v1/ai/chat
Content-Type: application/json

{
  "message": "Summarize the main topics in technology news"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "response": "Based on recent articles, the main technology topics are...",
    "context_used": true,
    "sources": ["nu.nl", "nos.nl"],
    "confidence": 0.85,
    "timestamp": "2025-10-30T14:00:00Z"
  },
  "request_id": "abc123"
}
```

---

## Stock Endpoints

**Note**: Free tier only supports US stocks. Premium features are commented out in code.

### GET `/api/v1/stocks/quote/:symbol`
**Get real-time stock quote (FREE TIER)**

**Auth**: Optional

**Example Request**:
```
GET /api/v1/stocks/quote/AAPL
```

**Response**:
```json
{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "price": 178.50,
  "change": 2.30,
  "change_percent": 1.31,
  "volume": 52000000,
  "market_cap": 2800000000000,
  "pe_ratio": 29.5,
  "timestamp": "2025-10-30T13:59:00Z"
}
```

### GET `/api/v1/stocks/profile/:symbol`
**Get company profile (FREE TIER)**

**Auth**: Optional

**Example Request**:
```
GET /api/v1/stocks/profile/AAPL
```

**Response**:
```json
{
  "symbol": "AAPL",
  "company_name": "Apple Inc.",
  "sector": "Technology",
  "industry": "Consumer Electronics",
  "website": "https://www.apple.com",
  "description": "Apple Inc. designs, manufactures, and markets...",
  "ceo": "Tim Cook",
  "employees": 164000,
  "headquarters": "Cupertino, CA"
}
```

### GET `/api/v1/stocks/earnings`
**Get earnings calendar (FREE TIER)**

**Auth**: Optional

**Query Parameters**:
- `from` (date, format: YYYY-MM-DD) - Start date (default: today)
- `to` (date, format: YYYY-MM-DD) - End date (default: +7 days)

**Example Request**:
```
GET /api/v1/stocks/earnings?from=2025-10-30&to=2025-11-06
```

**Response**:
```json
{
  "from": "2025-10-30",
  "to": "2025-11-06",
  "earnings": [
    {
      "symbol": "AAPL",
      "company_name": "Apple Inc.",
      "date": "2025-11-01",
      "eps_estimated": 1.52,
      "revenue_estimated": 89000000000
    }
  ],
  "total": 25
}
```

### GET `/api/v1/stocks/search`
**Search for stock symbols (FREE TIER)**

**Auth**: Optional

**Query Parameters**:
- `q` (string, required) - Search query
- `limit` (int, default: 10, max: 50) - Number of results

**Example Request**:
```
GET /api/v1/stocks/search?q=apple&limit=10
```

**Response**:
```json
{
  "query": "apple",
  "results": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "exchange": "NASDAQ",
      "type": "stock"
    }
  ],
  "total": 3
}
```

### GET `/api/v1/stocks/stats`
**Get stock API cache statistics**

**Auth**: Optional

**Response**:
```json
{
  "cache": {
    "hit_rate": 0.85,
    "total_requests": 1000,
    "cache_hits": 850,
    "cache_misses": 150
  }
}
```

---

## Source & Category Endpoints

### GET `/api/v1/sources`
**Get all news sources**

**Auth**: Optional

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "name": "nu.nl",
      "feed_url": "https://www.nu.nl/rss/Algemeen",
      "is_active": true
    },
    {
      "name": "nos.nl",
      "feed_url": "https://feeds.nos.nl/nosnieuwsalgemeen",
      "is_active": true
    },
    {
      "name": "ad.nl",
      "feed_url": "https://www.ad.nl/rss.xml",
      "is_active": true
    }
  ],
  "request_id": "abc123"
}
```

### GET `/api/v1/categories`
**Get all article categories with counts**

**Auth**: Optional

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "name": "technology",
      "article_count": 800
    },
    {
      "name": "business",
      "article_count": 650
    },
    {
      "name": "politics",
      "article_count": 550
    }
  ],
  "request_id": "abc123"
}
```

---

## Protected Endpoints

**Authentication**: All protected endpoints require an API key in the request header.

**Header**:
```
X-API-Key: your-api-key-here
```

### Email Endpoints

#### POST `/api/v1/email/fetch-existing`
**Manually fetch existing emails**

**Auth**: Required

**Example Request**:
```
POST /api/v1/email/fetch-existing
Headers:
  X-API-Key: your-api-key
```

**Response**:
```json
{
  "message": "Existing emails fetched successfully",
  "articles_created": 25,
  "status": "completed"
}
```

#### GET `/api/v1/email/stats`
**Get email processing statistics**

**Auth**: Required

**Response**:
```json
{
  "stats": {
    "total_processed": 500,
    "articles_created": 450,
    "spam_filtered": 50,
    "processing_rate": 0.90
  }
}
```

### Scraper Endpoints

#### POST `/api/v1/scrape`
**Trigger manual scraping**

**Auth**: Required

**Request Body** (optional):
```json
{
  "source": "nu.nl"
}
```

**Example Request (All Sources)**:
```
POST /api/v1/scrape
Headers:
  X-API-Key: your-api-key
Content-Type: application/json

{}
```

**Example Request (Single Source)**:
```
POST /api/v1/scrape
Headers:
  X-API-Key: your-api-key
Content-Type: application/json

{
  "source": "nu.nl"
}
```

**Response (Single Source)**:
```json
{
  "success": true,
  "data": {
    "status": "success",
    "source": "nu.nl",
    "articles_found": 50,
    "articles_stored": 35,
    "articles_skipped": 15,
    "duration_seconds": 12.5
  },
  "request_id": "abc123"
}
```

**Response (All Sources)**:
```json
{
  "success": true,
  "data": {
    "total_sources": 3,
    "total_stored": 85,
    "results": [
      {
        "source": "nu.nl",
        "status": "success",
        "articles_found": 50,
        "articles_stored": 35,
        "articles_skipped": 15,
        "duration_seconds": 12.5,
        "error": null
      }
    ]
  },
  "request_id": "abc123"
}
```

#### GET `/api/v1/scraper/stats`
**Get scraper statistics**

**Auth**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "total_scrapes": 500,
    "successful_scrapes": 485,
    "failed_scrapes": 15,
    "total_articles_found": 25000,
    "total_articles_stored": 20000,
    "last_scrape": "2025-10-30T13:55:00Z"
  },
  "request_id": "abc123"
}
```

### AI Processing Endpoints

#### POST `/api/v1/articles/:id/process`
**Process a specific article with AI**

**Auth**: Required

**Example Request**:
```
POST /api/v1/articles/123/process
Headers:
  X-API-Key: your-api-key
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Article processed successfully",
    "article_id": 123,
    "enrichment": {
      "sentiment_score": 0.65,
      "sentiment_label": "positive",
      "ai_summary": "Summary...",
      "keywords": ["AI", "technology"],
      "entities": {...}
    }
  },
  "request_id": "abc123"
}
```

#### POST `/api/v1/ai/process/trigger`
**Manually trigger batch AI processing**

**Auth**: Required

**Example Request**:
```
POST /api/v1/ai/process/trigger
Headers:
  X-API-Key: your-api-key
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Processing completed",
    "total_processed": 50,
    "success_count": 48,
    "failure_count": 2,
    "duration": "45.2s"
  },
  "request_id": "abc123"
}
```

### Cache Management Endpoints

#### GET `/api/v1/cache/stats`
**Get cache statistics**

**Auth**: Required

**Response**:
```json
{
  "status": "ok",
  "total_keys": 1500,
  "hit_rate": 0.85,
  "memory_usage_mb": 45.2,
  "collected_at": "2025-10-30T14:00:00Z"
}
```

#### GET `/api/v1/cache/keys`
**Get cache keys matching a pattern**

**Auth**: Required

**Query Parameters**:
- `pattern` (string, default: "*") - Redis key pattern

**Example Request**:
```
GET /api/v1/cache/keys?pattern=article:*
```

**Response**:
```json
{
  "status": "ok",
  "count": 250,
  "keys": [
    "article:123",
    "article:124",
    "article:125"
  ]
}
```

#### GET `/api/v1/cache/size`
**Get total cache size**

**Auth**: Required

**Response**:
```json
{
  "status": "ok",
  "total_keys": 1500
}
```

#### GET `/api/v1/cache/memory`
**Get Redis memory usage**

**Auth**: Required

**Response**:
```json
{
  "status": "ok",
  "memory_info": {
    "used_memory": 47185920,
    "used_memory_human": "45.00M",
    "used_memory_peak": 52428800,
    "used_memory_peak_human": "50.00M"
  }
}
```

#### POST `/api/v1/cache/invalidate`
**Invalidate cache entries**

**Auth**: Required

**Request Body**:
```json
{
  "pattern": "article:*",
  "article_id": "123",
  "source": "nu.nl",
  "stock_symbol": "AAPL",
  "invalidate_all": false
}
```

**Example Request**:
```
POST /api/v1/cache/invalidate
Headers:
  X-API-Key: your-api-key
Content-Type: application/json

{
  "pattern": "article:*"
}
```

**Response**:
```json
{
  "status": "ok",
  "message": "Cache invalidated successfully"
}
```

#### POST `/api/v1/cache/warm`
**Pre-load cache with data**

**Auth**: Required

**Request Body**:
```json
{
  "data": {
    "article:123": {...},
    "article:124": {...}
  }
}
```

**Response**:
```json
{
  "status": "ok",
  "message": "Cache warmed successfully",
  "count": 2
}
```

---

## Response Format

All successful API responses follow this structure:

```json
{
  "success": true,
  "data": {...},
  "meta": {...},
  "request_id": "unique-request-id",
  "timestamp": "2025-10-30T14:00:00Z"
}
```

### Standard Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Whether the request was successful |
| `data` | object/array | Response payload |
| `meta` | object | Metadata (pagination, sorting, filtering) |
| `request_id` | string | Unique request identifier for tracking |
| `timestamp` | string | Response timestamp in RFC3339 format |

### Metadata Structure

```json
{
  "meta": {
    "pagination": {
      "total": 1500,
      "limit": 50,
      "offset": 0,
      "current_page": 1,
      "total_pages": 30,
      "has_next": true,
      "has_prev": false
    },
    "sorting": {
      "sort_by": "published",
      "sort_order": "desc"
    },
    "filtering": {
      "source": "nu.nl",
      "category": "technology"
    }
  }
}
```

---

## Error Handling

All error responses follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error details"
  },
  "request_id": "unique-request-id",
  "timestamp": "2025-10-30T14:00:00Z"
}
```

### Common Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `INVALID_REQUEST` | Invalid request parameters |
| 400 | `INVALID_ID` | Invalid ID format |
| 400 | `MISSING_PARAMETER` | Required parameter missing |
| 401 | `UNAUTHORIZED` | Authentication required |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `DATABASE_ERROR` | Database operation failed |
| 500 | `PROCESSING_ERROR` | Processing operation failed |
| 503 | `SERVICE_UNAVAILABLE` | Service temporarily unavailable |

### Error Response Examples

**Invalid Request**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid request parameters",
    "details": "limit must be between 1 and 100"
  },
  "request_id": "abc123",
  "timestamp": "2025-10-30T14:00:00Z"
}
```

**Not Found**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Article not found",
    "details": "No article with ID 999999"
  },
  "request_id": "abc123",
  "timestamp": "2025-10-30T14:00:00Z"
}
```

**Rate Limit Exceeded**:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded",
    "details": "Maximum 100 requests per minute allowed"
  },
  "request_id": "abc123",
  "timestamp": "2025-10-30T14:00:00Z"
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse.

### Rate Limit Headers

Every response includes rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1698674460
```

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests allowed per window |
| `X-RateLimit-Remaining` | Requests remaining in current window |
| `X-RateLimit-Reset` | Unix timestamp when the limit resets |

### Default Limits

- **Public endpoints**: 100 requests per minute
- **Protected endpoints**: 200 requests per minute (with API key)
- **Burst allowance**: 10 requests above limit

### Handling Rate Limits

When rate limit is exceeded:

1. Response status: `429 Too Many Requests`
2. Retry after the time indicated in `X-RateLimit-Reset`
3. Implement exponential backoff for retries

---

## Best Practices

### 1. Use Caching Headers

The API uses Redis caching extensively. Leverage cache-friendly patterns:

```javascript
// Good: Reuse same query parameters
GET /api/v1/articles?limit=50&offset=0&source=nu.nl

// Bad: Random query order (different cache key)
GET /api/v1/articles?source=nu.nl&offset=0&limit=50
```

### 2. Pagination

Always use pagination for large datasets:

```javascript
// Fetch first page
GET /api/v1/articles?limit=50&offset=0

// Fetch second page
GET /api/v1/articles?limit=50&offset=50
```

### 3. Error Handling

Always check the `success` field and handle errors gracefully:

```javascript
const response = await fetch('/api/v1/articles/123');
const data = await response.json();

if (!data.success) {
  console.error(data.error.code, data.error.message);
  // Handle error
}
```

### 4. Request IDs

Use the `request_id` for debugging and support:

```javascript
const requestId = data.request_id;
console.log('Request ID for support:', requestId);
```

### 5. Date Formats

Always use RFC3339 format for dates:

```javascript
// Correct
const startDate = new Date().toISOString(); // "2025-10-30T14:00:00.000Z"

// Incorrect
const startDate = "2025-10-30"; // May cause parsing errors
```

---

## Common Integration Patterns

### Fetching Articles with Filters

```javascript
async function fetchArticles(filters = {}) {
  const params = new URLSearchParams({
    limit: filters.limit || 50,
    offset: filters.offset || 0,
    source: filters.source || '',
    category: filters.category || '',
    sort_by: filters.sortBy || 'published',
    sort_order: filters.sortOrder || 'desc'
  });

  const response = await fetch(`/api/v1/articles?${params}`);
  const data = await response.json();
  
  if (data.success) {
    return {
      articles: data.data,
      pagination: data.meta.pagination
    };
  }
  
  throw new Error(data.error.message);
}
```

### Real-time Stock Updates

```javascript
async function getStockQuote(symbol) {
  const response = await fetch(`/api/v1/stocks/quote/${symbol}`);
  return await response.json();
}

// Poll for updates
setInterval(async () => {
  const quote = await getStockQuote('AAPL');
  updateUI(quote);
}, 60000); // Every 60 seconds
```

### AI Chat Integration

```javascript
async function sendChatMessage(message, articleId = null) {
  const response = await fetch('/api/v1/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message,
      article_id: articleId,
      context: 'general'
    })
  });
  
  const data = await response.json();
  return data.success ? data.data.response : null;
}
```

### Health Monitoring

```javascript
async function checkHealth() {
  const response = await fetch('/health');
  const data = await response.json();
  
  return {
    isHealthy: data.data.status === 'healthy',
    components: data.data.components,
    uptime: data.data.uptime_seconds
  };
}
```

---

## Changelog

### Version 1.0.0 (2025-10-30)
- Initial complete API reference
- Health endpoints documented
- Analytics endpoints documented
- Article, AI, and Stock endpoints documented
- Protected endpoints with authentication
- Cache management endpoints
- Complete request/response examples

---

## Support

For issues or questions about the API:

1. Check this documentation first
2. Review error codes and messages
3. Include `request_id` when reporting issues
4. Check health endpoints for system status

**API Base URL**: `http://localhost:8080` (development)