'use client';

import { useQuery, UseQueryOptions, QueryFunction } from '@tanstack/react-query';
import { useEffect, useState, useRef } from 'react';

// ============================================
// Adaptive Polling Hook
// ============================================

interface AdaptivePollingOptions<T> {
    minInterval?: number;
    maxInterval?: number;
    activityThreshold?: number;
    queryOptions?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn' | 'refetchInterval'>;
}

export const useAdaptivePolling = <T>(
    queryKey: any[],
    queryFn: QueryFunction<T>,
    options?: AdaptivePollingOptions<T>
) => {
    const {
        minInterval = 5000, // 5 seconds when active
        maxInterval = 60000, // 1 minute when inactive
        activityThreshold = 300000, // 5 minutes
        queryOptions = {},
    } = options || {};

    const [interval, setInterval] = useState(minInterval);
    const [lastActivity, setLastActivity] = useState(Date.now());

    // Update activity timestamp on user interaction
    useEffect(() => {
        const handleActivity = () => setLastActivity(Date.now());

        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

        events.forEach(event => {
            window.addEventListener(event, handleActivity, { passive: true });
        });

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, []);

    // Adjust interval based on activity
    useEffect(() => {
        const checkActivity = () => {
            const timeSinceActivity = Date.now() - lastActivity;

            if (timeSinceActivity < activityThreshold) {
                if (interval !== minInterval) {
                    console.log('[Adaptive Polling] User active, increasing frequency');
                    setInterval(minInterval);
                }
            } else {
                if (interval !== maxInterval) {
                    console.log('[Adaptive Polling] User inactive, decreasing frequency');
                    setInterval(maxInterval);
                }
            }
        };

        const intervalId = window.setInterval(checkActivity, 10000); // Check every 10 seconds
        checkActivity(); // Check immediately

        return () => window.clearInterval(intervalId);
    }, [lastActivity, minInterval, maxInterval, activityThreshold, interval]);

    return useQuery({
        queryKey,
        queryFn,
        refetchInterval: interval,
        refetchIntervalInBackground: false,
        ...queryOptions,
    });
};

// ============================================
// Smart Polling with Backoff
// ============================================

interface SmartPollingOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
    baseInterval?: number;
    maxInterval?: number;
    backoffMultiplier?: number;
    resetOnSuccess?: boolean;
}

export const useSmartPolling = <T>(
    queryKey: any[],
    queryFn: QueryFunction<T>,
    options?: SmartPollingOptions<T>
) => {
    const {
        baseInterval = 5000,
        maxInterval = 60000,
        backoffMultiplier = 2,
        resetOnSuccess = true,
        ...queryOptions
    } = options || {};

    const [currentInterval, setCurrentInterval] = useState(baseInterval);
    const consecutiveErrors = useRef(0);

    const query = useQuery({
        queryKey,
        queryFn: async (...args) => {
            try {
                const result = await queryFn(...args);

                // Reset on success if configured
                if (resetOnSuccess && consecutiveErrors.current > 0) {
                    consecutiveErrors.current = 0;
                    setCurrentInterval(baseInterval);
                    console.log('[Smart Polling] Success - resetting interval to base');
                }

                return result;
            } catch (error) {
                // Increase interval on error
                consecutiveErrors.current++;
                const newInterval = Math.min(
                    baseInterval * Math.pow(backoffMultiplier, consecutiveErrors.current),
                    maxInterval
                );

                if (newInterval !== currentInterval) {
                    setCurrentInterval(newInterval);
                    console.log(`[Smart Polling] Error - backing off to ${newInterval}ms`);
                }

                throw error;
            }
        },
        refetchInterval: currentInterval,
        refetchIntervalInBackground: false,
        ...queryOptions,
    });

    return {
        ...query,
        currentInterval,
        consecutiveErrors: consecutiveErrors.current,
    };
};