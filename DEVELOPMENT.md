# Development Guide

This guide provides detailed information for developers working on the Nieuws Scraper Frontend.

## 📚 Table of Contents

- [Setup](#setup)
- [Architecture](#architecture)
- [Component Guidelines](#component-guidelines)
- [API Integration](#api-integration)
- [State Management](#state-management)
- [Styling Guidelines](#styling-guidelines)
- [Testing Strategy](#testing-strategy)
- [Debugging](#debugging)
- [Performance](#performance)
- [Best Practices](#best-practices)

## 🛠️ Setup

### Initial Setup

1. Clone and install:
```bash
git clone <repository-url>
cd nieuwscraper-frontend
npm install
```

2. Configure environment:
```bash
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

3. Start development:
```bash
npm run dev
```

### IDE Setup

#### VS Code Extensions (Recommended)

- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **ESLint**
- **Prettier**
- **TypeScript Import Sorter**

#### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^\"'`]*)(?:'|\"|`)"]
  ]
}
```

## 🏗️ Architecture

### Next.js App Router

We use Next.js 14 with the App Router for:

- **File-based routing** - Pages are defined by folder structure
- **Server Components** - Default server-side rendering
- **Client Components** - Opt-in with `'use client'`
- **Layouts** - Shared UI across routes

### Directory Structure

```
app/
├── page.tsx              # Server component (if possible)
├── layout.tsx            # Root layout
├── [route]/
│   └── page.tsx          # Route page

components/
├── ui/                   # Base UI components
├── [feature]/            # Feature-specific components
└── [shared]/             # Shared components

lib/
├── api/                  # API client & utilities
├── types/                # TypeScript definitions
└── utils.ts              # Utility functions
```

### Component Types

1. **Server Components** (default)
   - Fetch data on server
   - No useState, useEffect, or browser APIs
   - Better performance, SEO

2. **Client Components** (`'use client'`)
   - Interactive components
   - Use hooks and browser APIs
   - Event handlers

## 🎨 Component Guidelines

### Component Structure

```tsx
'use client'; // Only if needed

import { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

interface MyComponentProps {
  title: string;
  description?: string;
  className?: string;
}

export function MyComponent({
  title,
  description,
  className,
}: MyComponentProps) {
  return (
    <div className={cn('base-classes', className)}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
```

### Naming Conventions

- **Components**: PascalCase (`ArticleCard.tsx`)
- **Utilities**: camelCase (`formatDate`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types**: PascalCase (`APIResponse`)

### Component Best Practices

1. **Single Responsibility** - One component, one job
2. **Composition over Inheritance** - Build complex UIs from simple components
3. **Props Interface** - Always define TypeScript interfaces
4. **Default Props** - Use destructuring defaults
5. **Memo Wisely** - Use React.memo for expensive components

## 🔌 API Integration

### Using the API Client

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export function ArticleList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['articles'],
    queryFn: () => apiClient.getArticles(),
  });

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay error={error} />;
  if (!data?.success) return <ErrorDisplay error={data?.error} />;

  return <ArticleGrid articles={data.data} />;
}
```

### Query Keys Convention

```tsx
// List queries
['articles']
['articles', { page: 1, limit: 20 }]

// Detail queries
['article', id]

// Filtered queries
['articles', 'search', query]
['articles', { source: 'nu.nl' }]

// Stats queries
['stats']
['sources']
['categories']
```

### Error Handling

```tsx
import { handleAPIError } from '@/lib/api/errors';

try {
  const response = await apiClient.getArticles();
  if (!response.success) {
    const message = handleAPIError(response.error, response.request_id);
    // Show error to user
  }
} catch (error) {
  // Network error
  console.error('Network error:', error);
}
```

## 📊 State Management

### TanStack Query (React Query)

We use TanStack Query for all server state:

```tsx
// Configuration in providers.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

### Local State

Use React hooks for UI state:

```tsx
// Simple state
const [isOpen, setIsOpen] = useState(false);

// Complex state
const [filters, setFilters] = useState<ArticleFilters>({
  limit: 20,
  offset: 0,
});

// Derived state
const hasFilters = filters.source || filters.category;
```

### URL State

Use searchParams for shareable state:

```tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';

export function FilterableList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const page = Number(searchParams.get('page')) || 1;
  
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    router.push(`?${params.toString()}`);
  };
  
  // ...
}
```

## 🎨 Styling Guidelines

### Tailwind CSS

We use Tailwind for all styling:

```tsx
// ✅ Good - Semantic class names
<div className="flex items-center gap-2 p-4 rounded-lg bg-card">

// ❌ Avoid - Inline styles
<div style={{ display: 'flex', padding: '1rem' }}>
```

### Class Name Utility

Use `cn()` for conditional classes:

```tsx
import { cn } from '@/lib/utils';

<button
  className={cn(
    'base-classes',
    isActive && 'active-classes',
    isDisabled && 'disabled-classes',
    className // Allow prop override
  )}
/>
```

### Responsive Design

```tsx
// Mobile-first approach
<div className="
  grid grid-cols-1          // Mobile
  md:grid-cols-2            // Tablet
  lg:grid-cols-3            // Desktop
  gap-4
">
```

### Theme Variables

Use CSS variables from globals.css:

```tsx
// Colors
bg-background, text-foreground
bg-card, text-card-foreground
bg-primary, text-primary-foreground

// Semantic colors
bg-destructive, bg-muted, bg-accent
```

## 🧪 Testing Strategy

### Unit Tests (To Implement)

```tsx
// Example test structure
import { render, screen } from '@testing-library/react';
import { ArticleCard } from './article-card';

describe('ArticleCard', () => {
  it('renders article title', () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText(mockArticle.title)).toBeInTheDocument();
  });
});
```

### Integration Tests (To Implement)

```tsx
// Test API integration
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

test('loads and displays articles', async () => {
  render(<ArticleList />, { wrapper });
  
  await waitFor(() => {
    expect(screen.getByText(/article title/i)).toBeInTheDocument();
  });
});
```

## 🐛 Debugging

### React Developer Tools

Install React DevTools browser extension for:
- Component tree inspection
- Props and state inspection
- Performance profiling

### TanStack Query DevTools

Add to development:

```tsx
// app/layout.tsx (development only)
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </Providers>
      </body>
    </html>
  );
}
```

### API Debugging

Check request IDs in API responses:

```tsx
const response = await apiClient.getArticles();
console.log('Request ID:', response.request_id);
```

### Network Tab

Monitor API calls in browser DevTools:
1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Check request/response details
4. Verify rate limit headers

## ⚡ Performance

### Image Optimization

Always use Next.js Image component:

```tsx
import Image from 'next/image';

<Image
  src={article.image_url}
  alt={article.title}
  width={400}
  height={300}
  className="object-cover"
  loading="lazy" // or "eager" for above fold
/>
```

### Code Splitting

Use dynamic imports for heavy components:

```tsx
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./heavy-chart'), {
  loading: () => <Skeleton />,
  ssr: false, // If not needed on server
});
```

### Memoization

Use useMemo for expensive computations:

```tsx
const filteredArticles = useMemo(() => {
  return articles.filter(article => 
    article.title.includes(searchTerm)
  );
}, [articles, searchTerm]);
```

### Debouncing

Debounce user input:

```tsx
import { debounce } from '@/lib/utils';

const debouncedSearch = debounce((value: string) => {
  setSearchQuery(value);
}, 300);

<input onChange={(e) => debouncedSearch(e.target.value)} />
```

## ✅ Best Practices

### TypeScript

1. **Avoid `any`** - Always type your data
2. **Use interfaces** - For component props and API responses
3. **Type guards** - For runtime type checking
4. **Strict mode** - Keep strict TypeScript enabled

### React

1. **Prefer functions** - Use functional components
2. **Custom hooks** - Extract reusable logic
3. **Error boundaries** - Wrap components properly
4. **Key props** - Always provide keys in lists

### Next.js

1. **Server first** - Use server components by default
2. **Metadata** - Define metadata for SEO
3. **Loading states** - Use loading.tsx files
4. **Error states** - Use error.tsx files

### API Calls

1. **Use React Query** - For all server data
2. **Cache wisely** - Set appropriate stale times
3. **Error handling** - Always handle errors
4. **Loading states** - Show loading indicators

### Git

1. **Meaningful commits** - Describe what and why
2. **Feature branches** - Never commit directly to main
3. **Small PRs** - Keep pull requests focused
4. **Code review** - Review before merging

### Code Organization

1. **File naming** - Consistent naming convention
2. **Imports order** - External → Internal → Relative
3. **Export pattern** - Named exports preferred
4. **File size** - Keep files under 300 lines

## 🔧 Common Tasks

### Adding a New Page

1. Create page in app directory:
```bash
app/my-page/page.tsx
```

2. Define metadata:
```tsx
export const metadata = {
  title: 'My Page - Nieuws Scraper',
  description: 'Description of my page',
};
```

3. Add to navigation if needed:
```tsx
// components/navigation.tsx
const navItems = [
  // ...
  { name: 'My Page', href: '/my-page', icon: Icon },
];
```

### Adding a New Component

1. Create component file:
```bash
components/my-component.tsx
```

2. Define props interface:
```tsx
interface MyComponentProps {
  // props
}
```

3. Export component:
```tsx
export function MyComponent(props: MyComponentProps) {
  // implementation
}
```

### Adding API Integration

1. Add types in `lib/types/api.ts`:
```tsx
export interface MyDataType {
  // fields
}
```

2. Add method in `lib/api/client.ts`:
```tsx
async getMyData(): Promise<APIResponse<MyDataType>> {
  return this.fetchWithErrorHandling<MyDataType>('/api/v1/my-data');
}
```

3. Use in component:
```tsx
const { data } = useQuery({
  queryKey: ['myData'],
  queryFn: () => apiClient.getMyData(),
});
```

## 📝 Code Review Checklist

Before submitting a PR:

- [ ] Code follows TypeScript conventions
- [ ] All components are properly typed
- [ ] Error handling is implemented
- [ ] Loading states are shown
- [ ] Responsive design is implemented
- [ ] Accessibility is considered
- [ ] No console errors
- [ ] Code is properly formatted
- [ ] Comments explain complex logic
- [ ] Tests pass (when implemented)

## 🚀 Deployment Checklist

Before deploying:

- [ ] Environment variables configured
- [ ] Build succeeds (`npm run build`)
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] API endpoints are correct
- [ ] Images are optimized
- [ ] Meta tags are set
- [ ] Performance tested
- [ ] Mobile tested
- [ ] Error boundaries working

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## 🆘 Getting Help

- Check the README.md for basic setup
- Review the API documentation in backend
- Check browser console for errors
- Use request IDs for debugging API issues
- Ask team members for help

---

Happy coding! 🎉