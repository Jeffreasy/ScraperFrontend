import { useState, useEffect } from 'react';
import { FinancialMetrics } from '@/lib/types/api';
import { apiClient } from '@/lib/api/client';

interface UseStockMetricsResult {
    metrics: FinancialMetrics | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}

export function useStockMetrics(symbol: string | null): UseStockMetricsResult {
    const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchMetrics = async () => {
        if (!symbol) {
            setMetrics(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await apiClient.getFinancialMetrics(symbol);
            if (response.success && response.data) {
                setMetrics(response.data);
            } else {
                throw new Error(response.error?.message || 'Failed to fetch metrics');
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
    }, [symbol]);

    return { metrics, loading, error, refetch: fetchMetrics };
}