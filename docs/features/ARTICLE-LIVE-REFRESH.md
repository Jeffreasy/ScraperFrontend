# Article Live Refresh Functionaliteit

## Overzicht

Deze documentatie brengt de volledige article-architectuur in kaart en beschrijft de nieuwe live refresh functionaliteit.

---

## 📋 Article Architectuur Overzicht

### Core Components

#### 1. **Article Card** (`components/article-card.tsx`)
- Hoofdcomponent voor het weergeven van een enkel artikel
- Features:
  - Responsive image display met fallback
  - AI-verrijkte content (sentiment, keywords, entities)
  - Stock ticker integratie
  - Content scraping functionaliteit
  - Expandable AI insights sectie

#### 2. **Article Filters** (`components/article-filters.tsx`)
- Filter panel voor artikelen
- Filter opties:
  - Bron (source)
  - Categorie
  - Keyword zoeken
  - Datum range (start/eind datum)

#### 3. **Article Skeleton** (`components/article-skeleton.tsx`)
- Loading states voor artikelen
- Varianten: default, compact, detailed
- Grid layouts met verschillende kolom configuraties

### API Integration

#### 1. **Base API Client** (`lib/api/client.ts`)
- Basis API communicatie met backend
- Rate limiting tracking
- Error handling
- Endpoints:
  - `GET /api/v1/articles` - Alle artikelen met filters
  - `GET /api/v1/articles/:id` - Specifiek artikel
  - `GET /api/v1/articles/search` - Zoeken in artikelen
  - `GET /api/v1/articles/stats` - Statistieken
  - `GET /api/v1/articles/:id/enrichment` - AI verrijking

#### 2. **Advanced API Client** (`lib/api/advanced-client.ts`)
- Geavanceerde features:
  - **Circuit Breaker Pattern**: Beschermt tegen cascading failures
  - **Request Deduplication**: Voorkomt duplicate requests
  - **Automatic Retry**: Met exponential backoff
  - **Smart Error Handling**: Context-aware retry logic

### Data Types (`lib/types/api.ts`)

```typescript
interface Article {
  id: number;
  title: string;
  summary: string;
  content?: string;
  content_extracted: boolean;
  url: string;
  published: string;
  source: string;
  keywords: string[];
  image_url: string;
  author: string;
  category: string;
  created_at: string;
  updated_at: string;
  ai_enrichment?: AIEnrichment;
  stock_data?: Record<string, StockQuote>;
}

interface ArticleFilters {
  limit?: number;
  offset?: number;
  source?: string;
  category?: string;
  keyword?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: 'published' | 'created_at' | 'title';
  sort_order?: 'asc' | 'desc';
}
```

---

## 🔄 Live Refresh Functionaliteit

### Nieuwe Componenten

#### 1. **Live Updates Hook** (`lib/hooks/use-article-live-updates.ts`)

**Features:**
- ✅ **Adaptive Polling**: Past polling interval aan op basis van gebruikersactiviteit
  - Actief: 10 seconden
  - Inactief: 60 seconden
- ✅ **New Article Detection**: Detecteert automatisch nieuwe artikelen
- ✅ **Smart Caching**: Gebruikt React Query cache
- ✅ **Manual Refresh**: Optie om handmatig te verversen

**Gebruik:**
```typescript
const {
  data,
  isLoading,
  error,
  refresh,
  lastArticleId
} = useArticleLiveUpdates(
  ['articles', page, filters],
  {
    filters: { limit: 20, offset: 0 },
    searchQuery: 'breaking news',
    onNewArticles: (count) => console.log(`${count} nieuwe artikelen`),
    pollingInterval: { min: 10000, max: 60000 }
  }
);
```

#### 2. **New Articles Notification** (`components/new-articles-notification.tsx`)

**Features:**
- ✅ Toont aantal nieuwe artikelen
- ✅ "Toon nieuw" knop om te refreshen
- ✅ Dismiss functionaliteit
- ✅ Animaties voor smooth UX
- ✅ Accessibility support (ARIA labels)

**Visueel:**
```
┌─────────────────────────────────────────────┐
│  🔄  3 nieuwe artikelen beschikbaar         │
│                    [Toon nieuw]  [×]        │
└─────────────────────────────────────────────┘
```

#### 3. **New Articles Notification Hook**

Helper hook voor notificatie state:
```typescript
const {
  newCount,
  showNotification,
  handleNewArticles,
  clearNotification
} = useNewArticlesNotification();
```

### Homepage Integratie (`app/page.tsx`)

**Voor:**
```typescript
// Oude implementatie - geen auto-refresh
const { data, isLoading, error } = useQuery({
  queryKey: ['articles', page, filters],
  queryFn: () => advancedApiClient.getArticles(filters),
  staleTime: 5 * 60 * 1000, // 5 minuten
});
```

**Na:**
```typescript
// Nieuwe implementatie - met live refresh
const { data, isLoading, error, refresh } = useArticleLiveUpdates(
  ['articles', page, filters],
  {
    filters: { ...filters, offset: (page - 1) * 20 },
    searchQuery: debouncedSearch,
    onNewArticles: handleNewArticles,
    pollingInterval: { min: 10000, max: 60000 }
  }
);
```

---

## 🎯 Adaptive Polling Strategie

### Hoe het werkt:

1. **Activity Detection**
   - Luistert naar: `mousemove`, `keydown`, `click`, `scroll`, `touchstart`
   - Bijhoudt laatste activity timestamp

2. **Interval Aanpassing**
   ```
   Gebruiker actief (< 5 min inactief) → 10 seconden polling
   Gebruiker inactief (> 5 min inactief) → 60 seconden polling
   ```

3. **Smart Backoff** (bij errors)
   ```
   Poging 1: 10 seconden wachten
   Poging 2: 20 seconden wachten
   Poging 3: 40 seconden wachten
   Max: 60 seconden
   ```

### Voordelen:

✅ **Efficiënt**: Minder requests wanneer gebruiker inactief is
✅ **Real-time**: Snelle updates wanneer gebruiker actief is
✅ **Server-friendly**: Vermindert server load
✅ **Battery-friendly**: Bespaart battery op mobiele apparaten

---

## 🔧 Configuratie Opties

### Polling Intervals Aanpassen

```typescript
// In app/page.tsx
const { data } = useArticleLiveUpdates(queryKey, {
  pollingInterval: {
    min: 5000,   // 5 seconden (actief)
    max: 120000, // 2 minuten (inactief)
  }
});
```

### Callback voor Nieuwe Artikelen

```typescript
const { data } = useArticleLiveUpdates(queryKey, {
  onNewArticles: (count) => {
    // Custom logica
    console.log(`${count} nieuwe artikelen!`);
    // Bijvoorbeeld: play sound, push notification, etc.
  }
});
```

### Live Updates Uitschakelen

```typescript
const { data } = useArticleLiveUpdates(queryKey, {
  enabled: false, // Schakelt polling uit
});
```

---

## 📊 Performance Optimalisatie

### React Query Caching

```typescript
// components/providers.tsx
export const STALE_TIMES = {
  articles: 5 * 60 * 1000,      // 5 minuten
  stats: 2 * 60 * 1000,          // 2 minuten
  trending: 1 * 60 * 1000,       // 1 minuut
};
```

### Request Deduplication

De `AdvancedAPIClient` dedupliceert automatisch identieke requests:
```typescript
// Beide requests gebruiken dezelfde pending request
const articles1 = await getArticles({ limit: 20 });
const articles2 = await getArticles({ limit: 20 }); // Reuses first request
```

### Circuit Breaker

Beschermt tegen overbelasting:
```
Failures: 0-4  → State: CLOSED (normaal)
Failures: 5+   → State: OPEN (geblokkeerd)
After 60s      → State: HALF_OPEN (probeer opnieuw)
Success × 2    → State: CLOSED (hersteld)
```

---

## 🧪 Testing

### Handmatig Testen

1. **Open homepage**: `http://localhost:3000`
2. **Wacht 10 seconden**: Nieuwe articles worden automatisch gedetecteerd
3. **Zie notificatie**: "X nieuwe artikelen beschikbaar"
4. **Klik "Toon nieuw"**: Pagina refresht automatisch
5. **Test inactiviteit**: Wacht 5+ minuten zonder interactie
   - Polling interval moet verhogen naar 60 seconden

### Console Logs

Live updates loggen automatisch:
```
[Live Updates] 3 nieuwe artikel(en) gevonden
[Adaptive Polling] User active, increasing frequency
[Adaptive Polling] User inactive, decreasing frequency
```

---

## 🚀 Toekomstige Verbeteringen

### Mogelijke Uitbreidingen:

1. **WebSocket Integratie** (`lib/utils/websocket-client.ts` is al beschikbaar)
   - Real-time push updates i.p.v. polling
   - Lagere latency
   - Minder server load

2. **Service Worker**
   - Background sync
   - Offline support
   - Push notifications

3. **Smart Prefetching**
   - Prefetch volgende pagina
   - Predictive loading based on user behavior

4. **User Preferences**
   - Sla polling interval voorkeur op
   - Toggle voor live updates

---

## 📝 Samenvatting

### Wat is nieuw:

✅ **Automatic Refresh**: Artikelen updaten automatisch elke 10-60 seconden
✅ **Smart Polling**: Past zich aan op basis van gebruikersactiviteit
✅ **Visual Feedback**: Notificatie toont nieuwe artikelen
✅ **Manual Control**: Gebruiker kan handmatig refreshen of notificatie dismissen
✅ **Performance**: Efficient met caching en deduplication
✅ **Accessibility**: Volledig toegankelijk met ARIA labels

### Hoe te gebruiken:

1. Open de homepage
2. Artikelen updaten automatisch op de achtergrond
3. Zie notificatie wanneer nieuwe artikelen beschikbaar zijn
4. Klik "Toon nieuw" om te refreshen

**Geen handmatig refreshen meer nodig!** 🎉