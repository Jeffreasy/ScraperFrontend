import { useState, useEffect } from 'react';
import { StockQuote } from '@/lib/types/api';
import { advancedApiClient } from '@/lib/api/advanced-client';

interface UseStockQuoteResult {
    quote: StockQuote | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}

export function useStockQuote(symbol: string | null): UseStockQuoteResult {
    const [quote, setQuote] = useState<StockQuote | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchQuote = async () => {
        if (!symbol) {
            setQuote(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await advancedApiClient.getStockQuote(symbol);
            if (response.success && response.data) {
                setQuote(response.data);
            } else {
                throw new Error(response.error?.message || 'Failed to fetch quote');
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuote();
    }, [symbol]);

    return { quote, loading, error, refetch: fetchQuote };
}