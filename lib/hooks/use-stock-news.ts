import { useState, useEffect } from 'react';
import { StockNewsResponse } from '@/lib/types/api';
import { apiClient } from '@/lib/api/client';

interface UseStockNewsResult {
    news: StockNewsResponse | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}

export function useStockNews(
    symbol: string | null,
    limit: number = 10
): UseStockNewsResult {
    const [news, setNews] = useState<StockNewsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchNews = async () => {
        if (!symbol) {
            setNews(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await apiClient.getStockNews(symbol, limit);
            if (response.success && response.data) {
                setNews(response.data);
            } else {
                throw new Error(response.error?.message || 'Failed to fetch news');
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, [symbol, limit]);

    return { news, loading, error, refetch: fetchNews };
}