'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { useAutoRetry } from '@/lib/hooks/use-online-status';

// ============================================
// Optimized Query Client Configuration
// ============================================

// Custom stale times per data type (in milliseconds)
export const STALE_TIMES = {
  articles: 5 * 60 * 1000,      // 5 minutes
  stats: 2 * 60 * 1000,          // 2 minutes
  trending: 1 * 60 * 1000,       // 1 minute
  sentiment: 5 * 60 * 1000,      // 5 minutes
  health: 30 * 1000,             // 30 seconds
  sources: 60 * 60 * 1000,       // 1 hour (changes rarely)
  categories: 10 * 60 * 1000,    // 10 minutes
  enrichment: 10 * 60 * 1000,    // 10 minutes
  processor: 2 * 60 * 1000,      // 2 minutes
} as const;

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default stale time - 5 minutes
            staleTime: 5 * 60 * 1000,

            // Keep data in cache for 30 minutes
            gcTime: 30 * 60 * 1000,

            // Retry configuration with exponential backoff
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // Don't refetch on window focus by default (can be overridden per query)
            refetchOnWindowFocus: false,

            // Refetch on mount only if stale
            refetchOnMount: true,

            // Don't refetch on reconnect automatically (handled by useAutoRetry)
            refetchOnReconnect: false,
          },
          mutations: {
            // Retry mutations once on failure
            retry: 1,
            retryDelay: 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AutoRetryProvider />
      {children}
    </QueryClientProvider>
  );
}

// ============================================
// Auto Retry Provider (handles reconnection)
// ============================================

function AutoRetryProvider() {
  useAutoRetry();
  return null;
}