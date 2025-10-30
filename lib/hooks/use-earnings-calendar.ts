import { useQuery } from '@tanstack/react-query';
import { EarningsCalendarResponse } from '@/lib/types/api';
import { apiClient } from '@/lib/api/client';

interface UseEarningsCalendarOptions {
    enabled?: boolean;
    staleTime?: number;
}

export function useEarningsCalendar(
    from?: string,
    to?: string,
    options?: UseEarningsCalendarOptions
) {
    return useQuery({
        queryKey: ['earnings', 'calendar', from, to],
        queryFn: async () => {
            return await apiClient.getEarningsCalendar();
        },
        enabled: options?.enabled !== false,
        staleTime: options?.staleTime ?? 10 * 60 * 1000, // 10 minutes default
        retry: 2,
    });
}