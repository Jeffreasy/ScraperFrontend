import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { EmailStats, EmailFetchResponse } from '@/lib/types/api';

export function useEmailStats() {
    return useQuery({
        queryKey: ['email', 'stats'],
        queryFn: () => apiClient.getEmailStats(),
        staleTime: 30 * 1000, // 30 seconds
        refetchInterval: 30 * 1000,
    });
}

export function useFetchExistingEmails() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => apiClient.fetchExistingEmails(),
        onSuccess: () => {
            // Invalidate and refetch email stats
            queryClient.invalidateQueries({ queryKey: ['email', 'stats'] });
        },
    });
}