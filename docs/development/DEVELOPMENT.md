# Development Guide

Complete development guide voor de Nieuws Scraper Frontend.

## 🛠️ Setup

### Initial Setup

```bash
git clone <repository-url>
cd nieuwscraper-frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### VS Code Extensions (Recommended)

- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- ESLint
- Prettier
- TypeScript Import Sorter

## 🏗️ Architecture

### Next.js App Router

- **File-based routing** - Pages defined by folder structure
- **Server Components** - Default server-side rendering
- **Client Components** - Opt-in with `'use client'`
- **Layouts** - Shared UI across routes

### Directory Structure

See [Folder Structure](FOLDER-STRUCTURE.md) for complete overview.

## 🎨 Component Guidelines

### Component Structure

```tsx
'use client'; // Only if needed

import { cn } from '@/lib/utils';

interface MyComponentProps {
  title: string;
  className?: string;
}

export function MyComponent({ title, className }: MyComponentProps) {
  return (
    <div className={cn('base-classes', className)}>
      <h2>{title}</h2>
    </div>
  );
}
```

### Naming Conventions

- **Components**: PascalCase (`ArticleCard.tsx`)
- **Utilities**: camelCase (`formatDate`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types**: PascalCase (`APIResponse`)

## 🔌 API Integration

### Using the Advanced API Client

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { advancedApiClient } from '@/lib/api/advanced-client';

export function ArticleList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['articles'],
    queryFn: () => advancedApiClient.getArticles(),
  });

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay error={error} />;
  
  return <ArticleGrid articles={data.data} />;
}
```

### Query Keys Convention

```tsx
['articles']                      // List queries
['article', id]                   // Detail queries
['articles', { source: 'nu.nl' }] // Filtered queries
['stats']                         // Stats queries
```

## 📊 State Management

### TanStack Query

Configuration in [`components/providers.tsx`](../../components/providers.tsx):

```tsx
const STALE_TIMES = {
  articles: 5 * 60 * 1000,   // 5 min
  stats: 2 * 60 * 1000,       // 2 min
  trending: 1 * 60 * 1000,    // 1 min
  health: 30 * 1000,          // 30 sec
  sources: 60 * 60 * 1000,    // 1 uur
};
```

### Local State

```tsx
const [isOpen, setIsOpen] = useState(false);
const [filters, setFilters] = useState<ArticleFilters>({});
```

### URL State

```tsx
const searchParams = useSearchParams();
const page = Number(searchParams.get('page')) || 1;
```

## 🎨 Styling Guidelines

### Tailwind CSS

```tsx
// ✅ Good
<div className="flex items-center gap-2 p-4 rounded-lg bg-card">

// ❌ Avoid
<div style={{ display: 'flex', padding: '1rem' }}>
```

### Class Name Utility

```tsx
import { cn } from '@/lib/utils';

<button className={cn('base', isActive && 'active', className)} />
```

### Responsive Design

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

## 🐛 Debugging

### React DevTools
- Component tree inspection
- Props and state inspection
- Performance profiling

### TanStack Query DevTools
- Query state inspection (included in dev mode)
- Cache visualization
- Mutation tracking

### API Debugging

```tsx
const response = await advancedApiClient.getArticles();
console.log('Request ID:', response.request_id);
```

## ⚡ Performance

### Image Optimization

```tsx
import Image from 'next/image';

<Image
  src={article.image_url}
  alt={article.title}
  width={400}
  height={300}
  loading="lazy"
/>
```

### Code Splitting

```tsx
import dynamic from 'next/dynamic';

const Heavy = dynamic(() => import('./heavy'), {
  loading: () => <Skeleton />,
});
```

### Memoization

```tsx
const filtered = useMemo(() => 
  articles.filter(a => a.title.includes(search)),
  [articles, search]
);
```

## ✅ Best Practices

### TypeScript
- Avoid `any`
- Use interfaces for props
- Type guards for runtime checks
- Strict mode enabled

### React
- Functional components
- Custom hooks for reusable logic
- Error boundaries
- Keys in lists

### Next.js
- Server components by default
- Metadata for SEO
- loading.tsx for loading states
- error.tsx for error states

### API Calls
- Use React Query
- Set appropriate stale times
- Handle errors gracefully
- Show loading states

## 🔧 Common Tasks

### Adding a New Page

```bash
# Create page
app/my-page/page.tsx

# Add metadata
export const metadata = {
  title: 'My Page',
  description: 'Description',
};

# Add to navigation
components/navigation.tsx
```

### Adding a Component

```bash
# Create component
components/my-component.tsx

# Define props
interface MyComponentProps { }

# Export
export function MyComponent(props) { }
```

### Adding API Integration

```tsx
// 1. Add types in lib/types/api.ts
export interface MyData { }

// 2. Add method in lib/api/advanced-client.ts
async getMyData() { }

// 3. Use in component
const { data } = useQuery({
  queryKey: ['myData'],
  queryFn: () => advancedApiClient.getMyData(),
});
```

## 📝 Code Review Checklist

- [ ] TypeScript conventions followed
- [ ] Components properly typed
- [ ] Error handling implemented
- [ ] Loading states shown
- [ ] Responsive design
- [ ] No console errors
- [ ] Code formatted
- [ ] Comments on complex logic

## 🚀 Deployment Checklist

- [ ] Environment variables configured
- [ ] Build succeeds
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] API endpoints correct
- [ ] Images optimized
- [ ] Meta tags set
- [ ] Mobile tested

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## 🆘 Getting Help

- Check [README.md](../../README.md)
- Review [API documentation](../api/ADVANCED-API.md)
- Check [Troubleshooting Guide](../troubleshooting/TROUBLESHOOTING.md)
- Use request IDs for debugging

---

**Related Documentation:**
- [Optimizations](OPTIMIZATIONS.md)
- [Folder Structure](FOLDER-STRUCTURE.md)
- [Implementation Guide](../guides/IMPLEMENTATION_GUIDE.md)

Happy coding! 🎉