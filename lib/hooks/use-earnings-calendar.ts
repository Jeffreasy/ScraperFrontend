import { useState, useEffect } from 'react';
import { EarningsCalendarResponse } from '@/lib/types/api';
import { apiClient } from '@/lib/api/client';

interface UseEarningsCalendarResult {
    earnings: EarningsCalendarResponse | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}

export function useEarningsCalendar(
    from?: string,
    to?: string
): UseEarningsCalendarResult {
    const [earnings, setEarnings] = useState<EarningsCalendarResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchEarnings = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiClient.getEarningsCalendar(from, to);
            if (response.success && response.data) {
                setEarnings(response.data);
            } else {
                throw new Error(response.error?.message || 'Failed to fetch earnings calendar');
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEarnings();
    }, [from, to]);

    return { earnings, loading, error, refetch: fetchEarnings };
}