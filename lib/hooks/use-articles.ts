import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { Article, ArticleListResponse, ArticleFilter } from '@/lib/types/api';

export function useArticles(filters?: ArticleFilter) {
    return useQuery({
        queryKey: ['articles', filters],
        queryFn: async () => {
            return await apiClient.getArticles(filters);
        },
        staleTime: 60 * 1000, // 1 minute
    });
}

export function useArticle(id: number) {
    return useQuery({
        queryKey: ['article', id],
        queryFn: async () => {
            const result = await apiClient.getArticle(id);
            return result.article;
        },
        enabled: !!id,
    });
}

export function useSearchArticles(query: string, enabled = true) {
    return useQuery({
        queryKey: ['articles', 'search', query],
        queryFn: async () => {
            return await apiClient.searchArticles({ q: query });
        },
        enabled: enabled && query.length > 0,
    });
}

export function useExtractContent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            return await apiClient.extractArticleContent(id);
        },
        onSuccess: (data, id) => {
            // Update article in cache
            queryClient.setQueryData(['article', id], data.article);
            // Invalidate list
            queryClient.invalidateQueries({ queryKey: ['articles'] });
        },
    });
}

export function useProcessArticle() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            return await apiClient.processArticle(id);
        },
        onSuccess: (data, id) => {
            // Update article in cache
            queryClient.setQueryData(['article', id], data.article);
            // Invalidate list
            queryClient.invalidateQueries({ queryKey: ['articles'] });
        },
    });
}

export function useArticlesByTicker(symbol: string, limit: number = 10) {
    return useQuery({
        queryKey: ['articles', 'ticker', symbol, limit],
        queryFn: async () => {
            return await apiClient.getArticlesByTicker(symbol, limit);
        },
        enabled: !!symbol,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}