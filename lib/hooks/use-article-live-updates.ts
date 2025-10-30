'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback, useRef, useState } from 'react';
import { advancedApiClient } from '@/lib/api/advanced-client';
import { ArticleFilter, Article, ArticleListResponse } from '@/lib/types/api';
import { useAdaptivePolling } from './use-adaptive-polling';

// ============================================
// Live Article Updates Hook
// ============================================

interface UseArticleLiveUpdatesOptions {
    filters?: ArticleFilter;
    searchQuery?: string;
    enabled?: boolean;
    onNewArticles?: (count: number) => void;
    pollingInterval?: {
        min?: number;
        max?: number;
    };
}

export const useArticleLiveUpdates = (
    queryKey: any[],
    options?: UseArticleLiveUpdatesOptions
) => {
    const queryClient = useQueryClient();
    const lastArticleIdRef = useRef<number | null>(null);
    const {
        filters,
        searchQuery,
        enabled = true,
        onNewArticles,
        pollingInterval = { min: 10000, max: 60000 }
    } = options || {};

    // Query function voor articles
    const fetchArticles = useCallback(async () => {
        if (searchQuery) {
            return advancedApiClient.searchArticles({
                q: searchQuery,
                ...filters,
            });
        }
        return advancedApiClient.getArticles(filters);
    }, [searchQuery, filters]);

    // Gebruik adaptive polling voor efficiënte updates
    const query = useAdaptivePolling(
        queryKey,
        fetchArticles,
        {
            minInterval: pollingInterval.min,
            maxInterval: pollingInterval.max,
            queryOptions: {
                enabled,
                refetchOnMount: true,
                refetchOnWindowFocus: true,
            }
        }
    );

    // Detecteer nieuwe articles
    useEffect(() => {
        if (query.data) {
            const response = query.data as ArticleListResponse;
            const articles = response.articles;

            if (articles && articles.length > 0) {
                const latestArticleId = articles[0].id;

                // Check voor nieuwe articles
                if (lastArticleIdRef.current !== null &&
                    latestArticleId > lastArticleIdRef.current) {

                    // Tel hoeveel nieuwe articles er zijn
                    const newCount = articles.filter(
                        a => a.id > lastArticleIdRef.current!
                    ).length;

                    if (newCount > 0) {
                        console.log(`[Live Updates] ${newCount} nieuwe artikel(en) gevonden`);
                        onNewArticles?.(newCount);
                    }
                }

                lastArticleIdRef.current = latestArticleId;
            }
        }
    }, [query.data, onNewArticles]);

    // Manual refresh functie
    const refresh = useCallback(() => {
        return queryClient.invalidateQueries({ queryKey });
    }, [queryClient, queryKey]);

    return {
        ...query,
        refresh,
        lastArticleId: lastArticleIdRef.current,
    };
};

// ============================================
// Simple Polling Hook (fallback)
// ============================================

export const useArticlePolling = (
    queryKey: any[],
    fetchFn: () => Promise<any>,
    interval: number = 30000
) => {
    return useQuery({
        queryKey,
        queryFn: fetchFn,
        refetchInterval: interval,
        refetchIntervalInBackground: false,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
    });
};

// ============================================
// New Articles Notification Helper
// ============================================

export const useNewArticlesNotification = () => {
    const [newCount, setNewCount] = useState(0);
    const [showNotification, setShowNotification] = useState(false);

    const handleNewArticles = useCallback((count: number) => {
        setNewCount(count);
        setShowNotification(true);
    }, []);

    const clearNotification = useCallback(() => {
        setShowNotification(false);
        setNewCount(0);
    }, []);

    return {
        newCount,
        showNotification,
        handleNewArticles,
        clearNotification,
    };
};