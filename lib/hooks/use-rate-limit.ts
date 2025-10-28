'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface RateLimitInfo {
    limit: number;
    remaining: number;
    reset: number;
    isLimited: boolean;
    resetIn: number; // seconds until reset
}

/**
 * Hook voor het monitoren van rate limits
 */
export const useRateLimit = () => {
    const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo>({
        limit: 0,
        remaining: 0,
        reset: 0,
        isLimited: false,
        resetIn: 0,
    });

    const queryClient = useQueryClient();

    useEffect(() => {
        // Monitor alle query responses voor rate limit headers
        const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
            if (event?.type === 'updated' && event.query.state.data) {
                const data = event.query.state.data as any;

                if (data?.rateLimitHeaders) {
                    const headers = data.rateLimitHeaders;
                    const now = Math.floor(Date.now() / 1000);
                    const resetIn = Math.max(0, headers.reset - now);

                    setRateLimitInfo({
                        limit: headers.limit,
                        remaining: headers.remaining,
                        reset: headers.reset,
                        isLimited: headers.remaining === 0,
                        resetIn,
                    });
                }
            }
        });

        return () => unsubscribe();
    }, [queryClient]);

    return rateLimitInfo;
};

/**
 * Get percentage of remaining rate limit
 */
export const useRateLimitPercentage = () => {
    const rateLimit = useRateLimit();

    if (!rateLimit.limit) return 100;

    return (rateLimit.remaining / rateLimit.limit) * 100;
};