# Quick Start Guide

Get up and running with Nieuws Scraper Frontend in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:8080`

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.local.example .env.local

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## What You Get

### 📰 Home Page (`/`)
- Browse latest news articles
- Search with real-time results
- Filter by source, category, date
- Sort by date, title, or created time
- Paginated results

### 📊 Statistics (`/stats`)
- Total articles count
- Articles per source
- Category breakdown
- System health status
- Real-time updates

### ℹ️ About Page (`/about`)
- Application information
- Tech stack details
- API documentation

## Common Tasks

### Change API URL
Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://your-api-url:port
```

### Add API Key (Optional)
Edit `.env.local`:
```env
NEXT_PUBLIC_API_KEY=your-api-key-here
```

### Build for Production
```bash
npm run build
npm start
```

### Run Linter
```bash
npm run lint
```

## Project Structure

```
app/              # Pages
components/       # React components
lib/              # Utilities & API client
├── api/          # API integration
├── types/        # TypeScript types
└── utils.ts      # Helper functions
```

## Key Features

✅ Real-time search with debouncing  
✅ Advanced filtering (source, category, date, keywords)  
✅ Responsive design (mobile, tablet, desktop)  
✅ Server-side rendering for SEO  
✅ Automatic caching & optimization  
✅ Error boundaries & loading states  
✅ Health monitoring  

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8080` |
| `NEXT_PUBLIC_API_KEY` | API key (optional) | - |
| `NEXT_PUBLIC_APP_NAME` | App name | `Nieuws Scraper` |
| `NEXT_PUBLIC_ITEMS_PER_PAGE` | Items per page | `20` |

## Troubleshooting

### Port already in use
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
npm run dev -- -p 3001
```

### API connection errors
1. Check backend is running: `http://localhost:8080/health`
2. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
3. Check CORS configuration in backend

### Build errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. Read [README.md](README.md) for full documentation
2. Check [DEVELOPMENT.md](DEVELOPMENT.md) for development guide
3. Review API documentation in backend project
4. Customize theme in `app/globals.css`
5. Add your own features!

## Support

- Check console for errors
- Review API response `request_id` for debugging
- Check backend logs with request ID
- Refer to [DEVELOPMENT.md](DEVELOPMENT.md)

---

Happy coding! 🚀