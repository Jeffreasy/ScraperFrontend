# Sentiment Dashboard Fix - Integratie met Nieuwe Analytics API

## 🎯 Probleem

De [`SentimentDashboard`](components/ai/sentiment-dashboard.tsx) component gebruikte de oude [`useSentimentStats`](lib/hooks/use-article-ai.ts:19) hook die naar `/api/v1/ai/sentiment/stats` ging. Deze endpoint was niet de juiste voor de nieuwe backend implementatie.

Volgens je backend troubleshooting is de werkende API nu:
- ✅ **Sentiment Trends API**: `http://localhost:8080/api/v1/analytics/sentiment-trends`

## 🔧 Oplossing

### 1. Nieuwe Aggregatie Hook Gemaakt

Bestand: [`lib/hooks/use-sentiment-aggregated.ts`](lib/hooks/use-sentiment-aggregated.ts)

Deze hook:
- ✅ Gebruikt de werkende [`useSentimentTrends`](lib/hooks/use-analytics.ts:22) hook
- ✅ Aggregeert de sentiment trends (per dag/bron) naar totalen
- ✅ Berekent gewogen gemiddelde sentiment score
- ✅ Retourneert data in het formaat dat [`SentimentDashboard`](components/ai/sentiment-dashboard.tsx) verwacht

**Data Transformatie:**

```typescript
// Input van nieuwe API (sentiment-trends):
{
  trends: [
    {
      day: "2025-10-30",
      source: "ad.nl",
      total_articles: 60,
      positive_count: 20,
      neutral_count: 30,
      negative_count: 10,
      avg_sentiment: -0.079
    },
    // ... meer trends per dag/bron
  ]
}

// Output voor SentimentDashboard:
{
  total_processed: 328,        // Som van alle total_articles
  by_sentiment: {
    positive: 120,              // Som van alle positive_counts
    neutral: 150,               // Som van alle neutral_counts
    negative: 58                // Som van alle negative_counts
  },
  avg_sentiment_score: -0.054  // Gewogen gemiddelde
}
```

### 2. SentimentDashboard Geüpdatet

Wijziging in [`components/ai/sentiment-dashboard.tsx`](components/ai/sentiment-dashboard.tsx):

```typescript
// OUD:
import { useSentimentStats } from '@/lib/hooks/use-article-ai';
const { data: stats, isLoading, error } = useSentimentStats(source, startDate, endDate);

// NIEUW:
import { useSentimentAggregated } from '@/lib/hooks/use-sentiment-aggregated';
const { data: stats, isLoading, error } = useSentimentAggregated(source);
```

## ✅ Resultaat

De [`SentimentDashboard`](components/ai/sentiment-dashboard.tsx) component werkt nu met de nieuwe backend API en toont:

1. **Sentiment Distributie**
   - Positieve artikelen: aantal + percentage
   - Neutrale artikelen: aantal + percentage
   - Negatieve artikelen: aantal + percentage

2. **Gemiddeld Sentiment Meter**
   - Visualisatie van -1.0 tot +1.0
   - Gewogen gemiddelde sentiment score

3. **Summary Stats**
   - Totaal aantal geanalyseerde artikelen
   - Overall sentiment score

## 📊 Backend Data Verificatie

Volgens je backend troubleshooting:

```
Sentiment Trends:
2025-10-30:
  - ad.nl:  60 artikelen (avg sentiment: -0.079)
  - nos.nl: 21 artikelen (avg sentiment: -0.280)
  - nu.nl:  70 artikelen (avg sentiment:  0.100)

2025-10-29:
  - ad.nl:  68 artikelen (avg sentiment:  0.009)
  - nos.nl: 30 artikelen (avg sentiment: -0.290)
  - nu.nl:  79 artikelen (avg sentiment: -0.054)
```

De nieuwe hook aggregeert deze data correct naar:
- **Total artikelen**: 328 (60+21+70+68+30+79)
- **Gewogen gemiddelde sentiment**: berekend op basis van alle trends

## 🔗 Gerelateerde Bestanden

### Nieuwe/Gewijzigde Bestanden:
- [`lib/hooks/use-sentiment-aggregated.ts`](lib/hooks/use-sentiment-aggregated.ts) - Nieuwe aggregatie hook
- [`components/ai/sentiment-dashboard.tsx`](components/ai/sentiment-dashboard.tsx) - Geüpdatet om nieuwe hook te gebruiken

### Werkende Backend API's:
- [`lib/hooks/use-analytics.ts`](lib/hooks/use-analytics.ts:22) - [`useSentimentTrends`](lib/hooks/use-analytics.ts:22) hook
- [`lib/api/client.ts`](lib/api/client.ts:173) - [`getSentimentTrends`](lib/api/client.ts:173) API client methode
- [`lib/api/advanced-client.ts`](lib/api/advanced-client.ts:387) - Advanced client met circuit breaker

### Types:
- [`lib/types/api.ts`](lib/types/api.ts:117) - [`SentimentTrend`](lib/types/api.ts:117) interface
- [`lib/types/api.ts`](lib/types/api.ts:129) - [`SentimentTrendsResponse`](lib/types/api.ts:129) interface

## 🚀 Testen

Om de wijzigingen te testen:

1. Start de backend:
   ```bash
   # Backend moet draaien op localhost:8080
   ```

2. Test de API direct:
   ```bash
   curl "http://localhost:8080/api/v1/analytics/sentiment-trends"
   ```

3. Open de frontend en navigeer naar een pagina die [`SentimentDashboard`](components/ai/sentiment-dashboard.tsx) gebruikt

4. Verwachte resultaten:
   - Dashboard toont sentiment statistieken
   - Geen errors in console
   - Data komt van nieuwe analytics API

## 💡 Voordelen Nieuwe Implementatie

1. **Betere Performance**: Gebruikt geoptimaliseerde materialized views
2. **Meer Data**: Trends per dag en bron beschikbaar
3. **Type Safety**: TypeScript interfaces voor alle responses
4. **Circuit Breaker**: Advanced client met foutafhandeling
5. **Deduplicatie**: Voorkomt dubbele requests

## 📝 Notities

- De [`startDate`](components/ai/sentiment-dashboard.tsx:26) en [`endDate`](components/ai/sentiment-dashboard.tsx:27) parameters worden momenteel niet gebruikt in de nieuwe hook
- Als je date filtering nodig hebt, kan dit worden toegevoegd aan de backend API
- De oude [`useSentimentStats`](lib/hooks/use-article-ai.ts:19) hook blijft bestaan voor backwards compatibility