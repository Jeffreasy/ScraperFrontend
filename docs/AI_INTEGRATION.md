# AI Integration Guide - Frontend

This guide explains how to use the AI-powered features in the NieuwsScraper frontend.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [Components](#components)
4. [Hooks](#hooks)
5. [Usage Examples](#usage-examples)
6. [API Integration](#api-integration)
7. [Best Practices](#best-practices)

## Overview

The frontend now integrates with the backend's AI processing features to provide:

- **Sentiment Analysis** - Visual sentiment badges and dashboards
- **Entity Extraction** - Interactive chips for people, organizations, and locations
- **Trending Topics** - Real-time trending topics widget
- **Smart Keywords** - AI-extracted keywords with relevance scores
- **AI Summaries** - Concise article summaries
- **Category Classification** - Automatic categorization with confidence scores

## Setup

### 1. Install Dependencies

All required dependencies are already in [`package.json`](../package.json):
- `@tanstack/react-query` - For data fetching and caching
- `lucide-react` - For icons

### 2. Environment Variables

No additional environment variables needed. The AI endpoints use the same base URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 3. Enable AI in Backend

Make sure the backend has AI processing enabled:

```env
# Backend .env
AI_ENABLED=true
OPENAI_API_KEY=your-key-here
```

## Components

### AI Components

All AI components are located in [`components/ai/`](../components/ai/):

#### SentimentBadge

Displays sentiment with emoji and score.

```tsx
import { SentimentBadge } from '@/components/ai';

<SentimentBadge 
  sentiment={{
    score: 0.65,
    label: 'positive',
    confidence: 0.89
  }}
  showScore={true}
/>
```

**Props:**
- `sentiment: SentimentAnalysis` - Sentiment data from API
- `showScore?: boolean` - Show/hide numerical score (default: true)

#### EntityChip

Interactive chip for entities (people, organizations, locations).

```tsx
import { EntityChip } from '@/components/ai';

<EntityChip
  name="Mark Rutte"
  type="persons"
  onClick={() => handleEntityClick('Mark Rutte', 'persons')}
/>
```

**Props:**
- `name: string` - Entity name
- `type: 'persons' | 'organizations' | 'locations'` - Entity type
- `onClick?: () => void` - Optional click handler

#### KeywordTag

Displays keyword with size based on relevance score.

```tsx
import { KeywordTag } from '@/components/ai';

<KeywordTag 
  keyword="verkiezingen"
  score={0.95}
/>
```

**Props:**
- `keyword: string` - Keyword text
- `score: number` - Relevance score (0.0 to 1.0)

#### AIInsights

Complete AI insights panel for an article.

```tsx
import { AIInsights } from '@/components/ai';

<AIInsights
  enrichment={aiData}
  onEntityClick={(entity, type) => {
    // Navigate to entity page or filter
    router.push(`/?entity=${entity}&type=${type}`);
  }}
/>
```

**Props:**
- `enrichment: AIEnrichment` - AI enrichment data from API
- `onEntityClick?: (entity: string, type: string) => void` - Entity click handler

#### TrendingTopics

Widget showing trending topics.

```tsx
import { TrendingTopics } from '@/components/ai';

<TrendingTopics 
  hours={24}
  minArticles={3}
/>
```

**Props:**
- `hours?: number` - Look back period (default: 24)
- `minArticles?: number` - Minimum articles per topic (default: 3)

#### SentimentDashboard

Complete sentiment analysis dashboard.

```tsx
import { SentimentDashboard } from '@/components/ai';

<SentimentDashboard
  source="nu.nl"
  startDate="2024-01-01T00:00:00Z"
  endDate="2024-01-31T23:59:59Z"
/>
```

**Props:**
- `source?: string` - Filter by news source
- `startDate?: string` - Start date (RFC3339)
- `endDate?: string` - End date (RFC3339)

### Enhanced Article Card

[`ArticleCardEnhanced`](../components/article-card-enhanced.tsx) - Article card with AI features.

```tsx
import { ArticleCardEnhanced } from '@/components/article-card-enhanced';

<ArticleCardEnhanced
  article={article}
  showAI={true}
  onEntityClick={(entity, type) => {
    // Handle entity click
  }}
/>
```

**Features:**
- Displays sentiment badge
- Shows AI categories
- AI-extracted keywords
- Expandable AI insights panel
- Entity chips with click handlers

## Hooks

All AI hooks are in [`lib/hooks/use-article-ai.ts`](../lib/hooks/use-article-ai.ts):

### useArticleAI

Fetch AI enrichment for a specific article.

```tsx
import { useArticleAI } from '@/lib/hooks/use-article-ai';

const { data, isLoading, error } = useArticleAI(articleId, enabled);
```

**Returns:**
```tsx
{
  data: AIEnrichment | undefined;
  isLoading: boolean;
  error: Error | null;
}
```

**Options:**
- `articleId: number` - Article ID
- `enabled?: boolean` - Enable/disable query (default: true)

### useSentimentStats

Fetch sentiment statistics.

```tsx
import { useSentimentStats } from '@/lib/hooks/use-article-ai';

const { data } = useSentimentStats('nu.nl', startDate, endDate);
```

### useTrendingTopics

Fetch trending topics.

```tsx
import { useTrendingTopics } from '@/lib/hooks/use-article-ai';

const { data } = useTrendingTopics(24, 3);
```

### useArticlesByEntity

Fetch articles mentioning a specific entity.

```tsx
import { useArticlesByEntity } from '@/lib/hooks/use-article-ai';

const { data } = useArticlesByEntity('Mark Rutte', 'persons', 50);
```

### useProcessorStats

Monitor AI processor status.

```tsx
import { useProcessorStats } from '@/lib/hooks/use-article-ai';

const { data } = useProcessorStats();
```

## Usage Examples

### Example 1: Article List with AI

```tsx
'use client';

import { ArticleCardEnhanced } from '@/components/article-card-enhanced';
import { useArticles } from '@/lib/hooks/use-articles';

export default function ArticlesPage() {
  const { data } = useArticles({ limit: 20 });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data?.data?.map((article) => (
        <ArticleCardEnhanced
          key={article.id}
          article={article}
          showAI={true}
          onEntityClick={(entity, type) => {
            console.log(`Clicked: ${entity} (${type})`);
          }}
        />
      ))}
    </div>
  );
}
```

### Example 2: AI Dashboard Page

The complete AI dashboard is implemented in [`app/ai/page.tsx`](../app/ai/page.tsx):

```tsx
import { TrendingTopics } from '@/components/ai/trending-topics';
import { SentimentDashboard } from '@/components/ai/sentiment-dashboard';

export default function AIPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <TrendingTopics hours={24} minArticles={3} />
      </div>
      <div className="lg:col-span-2">
        <SentimentDashboard />
      </div>
    </div>
  );
}
```

### Example 3: Entity Explorer

```tsx
'use client';

import { useArticlesByEntity } from '@/lib/hooks/use-article-ai';
import { ArticleCard } from '@/components/article-card';

export default function EntityPage({ params }: { params: { name: string } }) {
  const { data, isLoading } = useArticlesByEntity(
    decodeURIComponent(params.name),
    'persons',
    20
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{params.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data?.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
```

### Example 4: Progressive Enhancement

```tsx
'use client';

import { useState } from 'react';
import { useArticleAI } from '@/lib/hooks/use-article-ai';
import { AIInsights } from '@/components/ai';

export function ArticleDetail({ article }: { article: Article }) {
  const [showAI, setShowAI] = useState(false);
  const { data: ai } = useArticleAI(article.id, showAI);

  return (
    <div>
      {/* Basic article content - always available */}
      <h1>{article.title}</h1>
      <p>{article.summary}</p>

      {/* AI insights - progressively enhanced */}
      <button onClick={() => setShowAI(true)}>
        Show AI Insights
      </button>

      {showAI && ai && <AIInsights enrichment={ai} />}
    </div>
  );
}
```

## API Integration

The API client in [`lib/api/client.ts`](../lib/api/client.ts) includes all AI methods:

```tsx
// Get article enrichment
await apiClient.getArticleEnrichment(articleId);

// Get sentiment stats
await apiClient.getSentimentStats(source, startDate, endDate);

// Get trending topics
await apiClient.getTrendingTopics(hours, minArticles);

// Get articles by entity
await apiClient.getArticlesByEntity(entityName, entityType, limit);

// Get processor stats
await apiClient.getProcessorStats();

// Trigger processing (requires API key)
await apiClient.processArticle(articleId);
await apiClient.triggerBatchProcessing();
```

## Best Practices

### 1. Graceful Degradation

Always handle cases where AI data is not available:

```tsx
const { data: ai } = useArticleAI(articleId);

// Show article even without AI data
return (
  <div>
    <h1>{article.title}</h1>
    <p>{article.summary}</p>
    
    {/* AI features are optional */}
    {ai?.sentiment && <SentimentBadge sentiment={ai.sentiment} />}
  </div>
);
```

### 2. Progressive Loading

Load AI data only when needed:

```tsx
const [expanded, setExpanded] = useState(false);
const { data: ai } = useArticleAI(articleId, expanded);

return (
  <div>
    <button onClick={() => setExpanded(true)}>
      Show AI Insights
    </button>
    {expanded && ai && <AIInsights enrichment={ai} />}
  </div>
);
```

### 3. Error Handling

```tsx
const { data, error, isLoading } = useArticleAI(articleId);

if (error) {
  return <div>AI analysis unavailable</div>;
}

if (isLoading) {
  return <Skeleton />;
}

return <AIInsights enrichment={data} />;
```

### 4. Caching Strategy

React Query automatically caches AI data:

```tsx
// In lib/hooks/use-article-ai.ts
staleTime: 5 * 60 * 1000, // 5 minutes - AI data changes slowly
```

### 5. Performance

- Use lazy loading for AI components
- Enable queries conditionally
- Implement skeleton states
- Cache expensive operations

### 6. Accessibility

All AI components include proper ARIA labels:

```tsx
<span role="img" aria-label="Positive sentiment">😊</span>
<button aria-label="Show AI insights">...</button>
```

## TypeScript Types

All AI types are defined in [`lib/types/api.ts`](../lib/types/api.ts):

```tsx
import type {
  AIEnrichment,
  SentimentAnalysis,
  EntityExtraction,
  Keyword,
  TrendingTopic,
  SentimentStats,
} from '@/lib/types/api';
```

## Testing

### Component Testing

```tsx
import { render } from '@testing-library/react';
import { SentimentBadge } from '@/components/ai';

test('renders positive sentiment', () => {
  const { getByText } = render(
    <SentimentBadge
      sentiment={{ score: 0.8, label: 'positive', confidence: 0.9 }}
    />
  );
  expect(getByText('Positief')).toBeInTheDocument();
});
```

### Integration Testing

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useArticleAI } from '@/lib/hooks/use-article-ai';

test('fetches AI enrichment', async () => {
  const queryClient = new QueryClient();
  const { result, waitFor } = renderHook(
    () => useArticleAI(123),
    { wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )}
  );

  await waitFor(() => expect(result.current.data).toBeDefined());
});
```

## Troubleshooting

### AI Data Not Loading

1. Check backend AI is enabled: `AI_ENABLED=true`
2. Verify OpenAI API key is set
3. Check processor status: `GET /api/v1/ai/processor/stats`
4. Look at browser console for errors

### Components Not Rendering

1. Ensure React Query provider is set up in [`components/providers.tsx`](../components/providers.tsx)
2. Check import paths
3. Verify TypeScript types

### Performance Issues

1. Reduce `staleTime` in hooks
2. Disable auto-refetch for expensive queries
3. Implement pagination
4. Use React.memo for expensive components

## Next Steps

1. **Implement Entity Pages** - Create dedicated pages for entities
2. **Add Search Filters** - Filter by sentiment, entities, categories
3. **Create Visualizations** - Charts for sentiment over time
4. **Add Notifications** - Real-time updates for trending topics
5. **Implement Recommendations** - Personalized article recommendations

## Resources

- [Backend AI Documentation](../../FRONTEND_AI_API.md)
- [API Client](../lib/api/client.ts)
- [AI Hooks](../lib/hooks/use-article-ai.ts)
- [AI Components](../components/ai/)
- [Example Page](../app/ai/page.tsx)

---

**Status**: ✅ AI Integration Complete  
**Version**: 1.0.0  
**Last Updated**: 2025-01-28