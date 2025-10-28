'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { advancedApiClient } from '@/lib/api/advanced-client';
import type {
    HealthResponse,
    LivenessResponse,
    ReadinessResponse,
    MetricsResponse,
    APIResponse
} from '@/lib/types/api';

// ============================================
// Health Check Hook
// ============================================

export const useHealth = (
    options?: Omit<UseQueryOptions<APIResponse<HealthResponse>>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: ['health'],
        queryFn: () => advancedApiClient.healthCheck(),
        staleTime: 30 * 1000, // 30 seconds
        refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
        retry: 1,
        ...options,
    });
};

// ============================================
// Liveness Check Hook
// ============================================

export const useLiveness = (
    options?: Omit<UseQueryOptions<APIResponse<LivenessResponse>>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: ['health', 'liveness'],
        queryFn: () => advancedApiClient.livenessCheck(),
        staleTime: 10 * 1000, // 10 seconds
        refetchInterval: 10 * 1000,
        retry: false, // Don't retry liveness checks
        ...options,
    });
};

// ============================================
// Readiness Check Hook
// ============================================

export const useReadiness = (
    options?: Omit<UseQueryOptions<APIResponse<ReadinessResponse>>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: ['health', 'readiness'],
        queryFn: () => advancedApiClient.readinessCheck(),
        staleTime: 30 * 1000, // 30 seconds
        refetchInterval: 30 * 1000,
        retry: 2,
        ...options,
    });
};

// ============================================
// Metrics Hook
// ============================================

export const useMetrics = (
    options?: Omit<UseQueryOptions<APIResponse<MetricsResponse>>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: ['health', 'metrics'],
        queryFn: () => advancedApiClient.getMetrics(),
        staleTime: 30 * 1000, // 30 seconds
        refetchInterval: 30 * 1000,
        retry: 1,
        ...options,
    });
};

// ============================================
// Combined Health Status Hook
// ============================================

export const useHealthStatus = () => {
    const health = useHealth();
    const metrics = useMetrics();

    return {
        health,
        metrics,
        isHealthy: health.data?.data?.status === 'healthy',
        isDegraded: health.data?.data?.status === 'degraded',
        isUnhealthy: health.data?.data?.status === 'unhealthy',
        isLoading: health.isLoading || metrics.isLoading,
        hasError: health.isError || metrics.isError,
    };
};