import { useState, useCallback } from 'react';
import { SymbolSearchResponse } from '@/lib/types/api';
import { apiClient } from '@/lib/api/client';

interface UseSymbolSearchResult {
    results: SymbolSearchResponse | null;
    loading: boolean;
    error: Error | null;
    search: (query: string, limit?: number) => Promise<void>;
}

export function useSymbolSearch(): UseSymbolSearchResult {
    const [results, setResults] = useState<SymbolSearchResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const search = useCallback(async (query: string, limit: number = 10) => {
        if (!query || query.length < 2) {
            setResults(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await apiClient.searchSymbols(query, limit);
            if (response.success && response.data) {
                setResults(response.data);
            } else {
                throw new Error(response.error?.message || 'Failed to search symbols');
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    }, []);

    return { results, loading, error, search };
}