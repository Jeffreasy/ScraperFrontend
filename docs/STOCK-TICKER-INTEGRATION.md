# Stock Ticker Integratie

Deze documentatie beschrijft de stock ticker integratie in de Nieuwscraper Frontend applicatie.

## Overzicht

De stock ticker integratie maakt het mogelijk om:
- Stock tickers te tonen die in artikelen worden vermeld
- Actuele koersinformatie op te halen
- Artikelen te filteren per aandeel
- Bedrijfsinformatie te bekijken

## Componenten

### StockTickerBadge
Toont een individuele stock ticker als klikbare badge.

**Locatie:** [`components/stock/stock-ticker-badge.tsx`](../components/stock/stock-ticker-badge.tsx)

**Gebruik:**
```tsx
import { StockTickerBadge } from '@/components/stock';

<StockTickerBadge 
  ticker={{ symbol: 'ASML', exchange: 'AEX' }}
  onClick={(symbol) => router.push(`/stocks/${symbol}`)}
/>
```

### StockQuoteCard
Toont actuele koersinformatie voor een aandeel.

**Locatie:** [`components/stock/stock-quote-card.tsx`](../components/stock/stock-quote-card.tsx)

**Gebruik:**
```tsx
import { StockQuoteCard } from '@/components/stock';

<StockQuoteCard symbol="ASML" />
```

### ArticleStockTickers
Toont alle stock tickers die in een artikel worden genoemd.

**Locatie:** [`components/stock/article-stock-tickers.tsx`](../components/stock/article-stock-tickers.tsx)

**Gebruik:**
```tsx
import { ArticleStockTickers } from '@/components/stock';

<ArticleStockTickers tickers={article.ai_enrichment?.entities?.stock_tickers || []} />
```

## Hooks

### useStockQuote
Hook voor het ophalen van stock quote data.

**Locatie:** [`lib/hooks/use-stock-quote.ts`](../lib/hooks/use-stock-quote.ts)

**Gebruik:**
```tsx
import { useStockQuote } from '@/lib/hooks/use-stock-quote';

const { quote, loading, error, refetch } = useStockQuote('ASML');
```

### useArticleStockTickers
Hook voor het extraheren van stock tickers uit een artikel.

**Locatie:** [`lib/hooks/use-article-stock-tickers.ts`](../lib/hooks/use-article-stock-tickers.ts)

**Gebruik:**
```tsx
import { useArticleStockTickers } from '@/lib/hooks/use-article-stock-tickers';

const { tickers, symbols, hasTickers } = useArticleStockTickers(article);
```

## API Endpoints

### GET /api/v1/stocks/quote/:symbol
Haalt de actuele koersinformatie op voor een specifiek aandeel.

**Response:**
```typescript
{
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  market_cap?: number;
  exchange: string;
  currency: string;
  last_updated: string;
  previous_close?: number;
  day_high?: number;
  day_low?: number;
}
```

### POST /api/v1/stocks/quotes
Haalt koersinformatie op voor meerdere aandelen tegelijk.

**Request:**
```json
{
  "symbols": ["ASML", "SHELL", "ING"]
}
```

**Response:**
```typescript
{
  "ASML": { /* StockQuote */ },
  "SHELL": { /* StockQuote */ },
  "ING": { /* StockQuote */ }
}
```

### GET /api/v1/stocks/profile/:symbol
Haalt bedrijfsinformatie op voor een aandeel.

**Response:**
```typescript
{
  symbol: string;
  company_name: string;
  currency: string;
  exchange: string;
  industry?: string;
  sector?: string;
  website?: string;
  description?: string;
  ceo?: string;
  country?: string;
  ipo_date?: string;
}
```

### GET /api/v1/articles/by-ticker/:symbol
Haalt artikelen op die een specifiek aandeel vermelden.

**Query Parameters:**
- `limit` (optional): Aantal artikelen (default: 10)

**Response:**
```typescript
Article[]
```

## Pagina's

### Stock Ticker Detail Pagina
Toont gedetailleerde informatie over een aandeel inclusief gerelateerde artikelen.

**Route:** `/stocks/[symbol]`

**Locatie:** [`app/stocks/[symbol]/page.tsx`](../app/stocks/[symbol]/page.tsx)

**Features:**
- Actuele koersinformatie
- Bedrijfsprofiel
- Lijst met gerelateerde nieuwsartikelen
- Responsive layout met sidebar

## Types

Alle stock-gerelateerde types zijn gedefineerd in [`lib/types/api.ts`](../lib/types/api.ts):

```typescript
interface StockTicker {
  symbol: string;
  name?: string;
  exchange?: string;
  mentions?: number;
  context?: string;
}

interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  market_cap?: number;
  exchange: string;
  currency: string;
  last_updated: string;
  previous_close?: number;
  day_high?: number;
  day_low?: number;
}

interface StockProfile {
  symbol: string;
  company_name: string;
  currency: string;
  exchange: string;
  industry?: string;
  sector?: string;
  website?: string;
  description?: string;
  ceo?: string;
  country?: string;
  ipo_date?: string;
}
```

## Integratie in Bestaande Componenten

### ArticleCard
Stock tickers worden automatisch getoond als ze beschikbaar zijn in de AI enrichment data.

**Locatie:** [`components/article-card.tsx`](../components/article-card.tsx:69)

### ArticleCardEnhanced
Ook de enhanced variant toont stock tickers boven de AI enrichment sectie.

**Locatie:** [`components/article-card-enhanced.tsx`](../components/article-card-enhanced.tsx:76)

## Styling

De stock ticker componenten gebruiken de bestaande design system tokens:

```css
/* Positive price change */
.stock-positive {
  @apply text-green-600 dark:text-green-400;
  @apply bg-green-50 dark:bg-green-950/30;
}

/* Negative price change */
.stock-negative {
  @apply text-red-600 dark:text-red-400;
  @apply bg-red-50 dark:bg-red-950/30;
}

/* Ticker badge */
.ticker-badge {
  @apply bg-blue-100 dark:bg-blue-950/30;
  @apply text-blue-800 dark:text-blue-300;
  @apply border-blue-200 dark:border-blue-800;
}
```

## Caching

Stock quote data wordt gecached via de advanced API client:
- GET requests worden automatisch gededupliceerd
- Circuit breaker pattern voorkomt overbelasting bij fouten
- Retry logic met exponential backoff

## Error Handling

Alle componenten hebben robuuste error handling:
- Fallback UI bij laadfouten
- Duidelijke foutmeldingen voor gebruikers
- Graceful degradation als data niet beschikbaar is

## Performance

### Optimalisaties:
1. **Lazy Loading**: Stock data wordt pas geladen wanneer nodig
2. **Request Deduplication**: Identieke requests worden samengevoegd
3. **Client-side Caching**: React Query caching (indien gebruikt)
4. **Batch Requests**: Meerdere quotes in één API call

### Best Practices:
```tsx
// ✅ Goed: Batch loading
const quotes = await advancedApiClient.getMultipleQuotes(['ASML', 'SHELL', 'ING']);

// ❌ Slecht: Individuele requests
const asml = await advancedApiClient.getStockQuote('ASML');
const shell = await advancedApiClient.getStockQuote('SHELL');
const ing = await advancedApiClient.getStockQuote('ING');
```

## Toekomstige Uitbreidingen

Mogelijke toekomstige features:
- Real-time quote updates via WebSocket
- Historische koersgrafieken
- Portefeuille tracking
- Prijs alerting
- Watchlist functionaliteit
- Technische indicatoren

## Troubleshooting

### Stock quotes laden niet
1. Controleer of de backend API bereikbaar is
2. Verifieer dat de API key correct is ingesteld
3. Check de browser console voor errors
4. Controleer of het ticker symbol correct is

### Tickers worden niet getoond in artikelen
1. Verifieer dat AI enrichment is uitgevoerd op het artikel
2. Check of `article.ai_enrichment.entities.stock_tickers` data bevat
3. Controleer of de `ArticleStockTickers` component correct is geïmporteerd

### Type errors
Zorg ervoor dat alle types up-to-date zijn:
```bash
npm run type-check
```

## Testing

Voor het testen van de stock ticker integratie:

1. **Start de development server:**
   ```bash
   npm run dev
   ```

2. **Test de stock detail pagina:**
   - Navigeer naar `/stocks/ASML`
   - Verifieer dat koersinformatie wordt getoond
   - Check of artikelen correct worden geladen

3. **Test artikel integratie:**
   - Open een artikel met stock tickers
   - Verifieer dat ticker badges worden getoond
   - Test of klikken naar de stock detail pagina navigeert

## Support

Voor vragen of problemen:
- Check de [main documentation](./README.md)
- Review de [API documentation](./api/ADVANCED-API.md)
- Bekijk de backend [stock tickers feature docs](../../backend/docs/features/stock-tickers.md)