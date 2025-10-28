import { useState, useEffect } from 'react';
import { HistoricalDataResponse } from '@/lib/types/api';
import { apiClient } from '@/lib/api/client';

interface UseStockHistoricalResult {
    data: HistoricalDataResponse | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}

export function useStockHistorical(
    symbol: string | null,
    from?: string,
    to?: string
): UseStockHistoricalResult {
    const [data, setData] = useState<HistoricalDataResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = async () => {
        if (!symbol) {
            setData(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await apiClient.getHistoricalData(symbol, from, to);
            if (response.success && response.data) {
                setData(response.data);
            } else {
                throw new Error(response.error?.message || 'Failed to fetch historical data');
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [symbol, from, to]);

    return { data, loading, error, refetch: fetchData };
}