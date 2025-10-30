import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { StockQuote, StockProfile, SymbolSearchResponse } from '@/lib/types/api';

export function useStockQuote(symbol: string) {
    return useQuery({
        queryKey: ['stocks', 'quote', symbol],
        queryFn: async () => {
            return await apiClient.getStockQuote(symbol);
        },
        enabled: symbol.length > 0,
        staleTime: 60 * 1000, // 1 minute
        refetchInterval: 60 * 1000, // Auto-refresh every minute
    });
}

export function useStockProfile(symbol: string) {
    return useQuery({
        queryKey: ['stocks', 'profile', symbol],
        queryFn: async () => {
            return await apiClient.getStockProfile(symbol);
        },
        enabled: symbol.length > 0,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

export function useSearchStocks(query: string) {
    return useQuery({
        queryKey: ['stocks', 'search', query],
        queryFn: async () => {
            return await apiClient.searchSymbols(query);
        },
        enabled: query.length > 0,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useEarningsCalendar() {
    return useQuery({
        queryKey: ['stocks', 'earnings'],
        queryFn: async () => {
            return await apiClient.getEarningsCalendar();
        },
        staleTime: 60 * 60 * 1000, // 1 hour
    });
}

export function useStockStats() {
    return useQuery({
        queryKey: ['stocks', 'stats'],
        queryFn: async () => {
            return await apiClient.getStockStats();
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}