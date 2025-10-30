# 🔧 Troubleshooting: Geen Data in Trending & Sentiment

## Probleem
"Trending Now" en "Sentiment Analyse" tonen geen data.

## Mogelijke Oorzaken & Oplossingen

### 1. **Backend API is niet gestart** ✅ MEEST WAARSCHIJNLIJK

**Check:**
```bash
# Test of API bereikbaar is
curl http://localhost:8080/health

# Test trending endpoint
curl http://localhost:8080/api/v1/analytics/trending

# Test sentiment endpoint  
curl http://localhost:8080/api/v1/ai/sentiment/stats
```

**Oplossing:**
```bash
# Start de backend API
cd ../backend  # of waar je backend is
go run cmd/api/main.go

# Of als je Docker gebruikt:
docker-compose up
```

---

### 2. **Geen Artikelen met AI Processing**

**Probleem:** De endpoints hebben data nodig van artikelen die al door AI zijn verwerkt.

**Check in Browser Console:**
```javascript
// Open DevTools (F12) en run:
fetch('http://localhost:8080/api/v1/articles/stats')
  .then(r => r.json())
  .then(console.log)
```

**Verwacht resultaat:** Een lijst met sources en aantallen
**Probleem als:** Alles is 0 of leeg

**Oplossing:**
```bash
# Trigger scraping om artikelen op te halen
curl -X POST http://localhost:8080/api/v1/scrape

# Wacht 30 seconden...

# Trigger AI processing
curl -X POST http://localhost:8080/api/v1/ai/process/trigger

# Check resultaat
curl http://localhost:8080/api/v1/ai/sentiment/stats
```

---

### 3. **Database Materialized Views Niet Ge-refreshed**

**Probleem:** Analytics views zijn niet up-to-date

**Oplossing:**
```bash
# Refresh analytics views
curl -X POST http://localhost:8080/api/v1/analytics/refresh

# Check database health
curl http://localhost:8080/api/v1/analytics/database-health
```

---

### 4. **CORS Errors**

**Check Browser Console** voor errors zoals:
```
Access to fetch at 'http://localhost:8080' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Oplossing:** Zorg dat backend CORS enabled heeft voor localhost:3000

---

### 5. **Wrong API URL**

**Check in Browser Console:**
```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)
```

**Verwacht:** `http://localhost:8080`
**Als het undefined is:** Maak `.env.local` aan

**Create `.env.local`:**
```bash
# In project root
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8080
EOF
```

**Restart Next.js:**
```bash
npm run dev
```

---

## Quick Fix Script

Run dit om alles te testen en fixen:

```bash
#!/bin/bash
echo "🔍 Testing API Connection..."

# Test 1: Health Check
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ API is bereikbaar"
else
    echo "❌ API is NIET bereikbaar"
    echo "   Start de backend met: cd backend && go run cmd/api/main.go"
    exit 1
fi

# Test 2: Check Articles
ARTICLE_COUNT=$(curl -s http://localhost:8080/api/v1/articles/stats | jq 'to_entries | map(.value) | add // 0')
echo "📊 Aantal artikelen in database: $ARTICLE_COUNT"

if [ "$ARTICLE_COUNT" -eq 0 ]; then
    echo "⚠️  Geen artikelen gevonden. Triggering scrape..."
    curl -X POST http://localhost:8080/api/v1/scrape
    echo "   Wacht 30 seconden voor scraping..."
    sleep 30
fi

# Test 3: Check AI Processing
AI_COUNT=$(curl -s 'http://localhost:8080/api/v1/ai/sentiment/stats' | jq '.total_processed // 0')
echo "🤖 Aantal AI-processed artikelen: $AI_COUNT"

if [ "$AI_COUNT" -eq 0 ]; then
    echo "⚠️  Geen AI-processed artikelen. Triggering AI processing..."
    curl -X POST http://localhost:8080/api/v1/ai/process/trigger
    echo "   Wacht 20 seconden voor processing..."
    sleep 20
fi

# Test 4: Refresh Analytics
echo "🔄 Refreshing analytics views..."
curl -s -X POST http://localhost:8080/api/v1/analytics/refresh | jq '.message'

# Test 5: Final Check
echo ""
echo "🎯 Final Results:"
echo "Trending Topics:"
curl -s 'http://localhost:8080/api/v1/analytics/trending?limit=3' | jq '.trending[].keyword'

echo ""
echo "Sentiment Stats:"
curl -s 'http://localhost:8080/api/v1/ai/sentiment/stats' | jq '{total: .total_processed, positive: .by_sentiment.positive, negative: .by_sentiment.negative}'

echo ""
echo "✅ Done! Refresh de browser pagina."
```

**Save als `fix-no-data.sh` en run:**
```bash
chmod +x fix-no-data.sh
./fix-no-data.sh
```

---

## Manual Test in Browser

Open Browser DevTools (F12) en plak in Console:

```javascript
// Test Trending API
fetch('http://localhost:8080/api/v1/analytics/trending')
  .then(r => r.json())
  .then(data => {
    console.log('📊 Trending Data:', data);
    if (data.trending && data.trending.length > 0) {
      console.log('✅ Trending werkt! Count:', data.trending.length);
    } else {
      console.log('⚠️ Geen trending data');
    }
  })
  .catch(err => console.error('❌ Trending error:', err));

// Test Sentiment API
fetch('http://localhost:8080/api/v1/ai/sentiment/stats')
  .then(r => r.json())
  .then(data => {
    console.log('😊 Sentiment Data:', data);
    if (data.total_processed > 0) {
      console.log('✅ Sentiment werkt! Total:', data.total_processed);
    } else {
      console.log('⚠️ Geen processed artikelen');
    }
  })
  .catch(err => console.error('❌ Sentiment error:', err));
```

---

## Expected Data Structure

### Trending Response
```json
{
  "trending": [
    {
      "keyword": "bitcoin",
      "article_count": 45,
      "source_count": 3,
      "sources": ["nu.nl", "ad.nl"],
      "avg_sentiment": 0.25,
      "trending_score": 87.5
    }
  ],
  "meta": {
    "hours": 24,
    "count": 10
  }
}
```

### Sentiment Response
```json
{
  "total_processed": 150,
  "by_sentiment": {
    "positive": 60,
    "neutral": 70,
    "negative": 20
  },
  "avg_sentiment_score": 0.12
}
```

---

## Still Not Working?

### Check Backend Logs

Kijk naar de backend console output voor errors:
- Database connection errors
- AI processing errors  
- Rate limiting issues

### Check Frontend Console

Open Browser DevTools en kijk naar:
- **Console tab:** JavaScript errors
- **Network tab:** Failed API requests (rood)
- **Application tab > Local Storage:** Check NEXT_PUBLIC_API_URL

### Verify Database

```sql
-- Connect to database
psql -U your_user -d nieuwscraper

-- Check article count
SELECT COUNT(*) FROM articles;

-- Check AI processed count
SELECT COUNT(*) FROM articles WHERE ai_processed = true;

-- Check materialized views
SELECT * FROM pg_matviews WHERE schemaname = 'public';
```

---

## Quick Wins

1. **Restart Everything:**
   ```bash
   # Stop frontend
   Ctrl+C
   
   # Stop backend
   Ctrl+C
   
   # Start backend
   cd backend && go run cmd/api/main.go
   
   # Start frontend (new terminal)
   cd frontend && npm run dev
   ```

2. **Clear Browser Cache:**
   - Chrome: Ctrl+Shift+Del
   - Select "Cached images and files"
   - Click "Clear data"

3. **Use Incognito/Private Window:**
   - Test in fresh browser window
   - Rules out cache issues

---

## Success Indicators

You'll know it's working when:
- ✅ "Trending Now" shows list of keywords
- ✅ "Sentiment Analyse" shows positive/neutral/negative counts
- ✅ No errors in browser console
- ✅ Network tab shows successful 200 responses
- ✅ Data updates when you refresh page

---

## Need More Help?

Check these logs with debug enabled:

```javascript
// Add to lib/hooks/use-analytics.ts
export function useTrendingKeywords(hours = 24, minArticles = 3, limit = 20) {
    return useQuery({
        queryKey: ['analytics', 'trending', hours, minArticles, limit],
        queryFn: async () => {
            console.log('🔍 Fetching trending...', { hours, minArticles, limit });
            const result = await apiClient.getTrendingKeywords(hours, minArticles, limit);
            console.log('📊 Trending result:', result);
            return result;
        },
        // ... rest
    });
}
```

Refresh en check console voor detailed logs.