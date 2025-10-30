import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { ScrapeRequest, ScrapeResponse, SourceInfo } from '@/lib/types/api';

export function useTriggerScrape() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request?: ScrapeRequest) => {
            return await apiClient.triggerScrape(request);
        },
        onSuccess: () => {
            // Invalidate articles and stats after scraping
            queryClient.invalidateQueries({ queryKey: ['articles'] });
            queryClient.invalidateQueries({ queryKey: ['scraper'] });
        },
    });
}

export function useSources() {
    return useQuery({
        queryKey: ['sources'],
        queryFn: async () => {
            const result = await apiClient.getSources();
            return result.sources;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}