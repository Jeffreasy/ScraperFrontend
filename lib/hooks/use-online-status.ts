'use client';

import { useEffect, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// ============================================
// Online Status Hook
// ============================================

export const useOnlineStatus = () => {
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );

    useEffect(() => {
        const handleOnline = () => {
            console.log('[Network] Connection restored');
            setIsOnline(true);
        };

        const handleOffline = () => {
            console.log('[Network] Connection lost');
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
};

// ============================================
// Auto Retry Hook (when coming back online)
// ============================================

export const useAutoRetry = () => {
    const queryClient = useQueryClient();
    const isOnline = useOnlineStatus();
    const wasOffline = useRef(!isOnline);

    useEffect(() => {
        if (wasOffline.current && isOnline) {
            console.log('[Network] Back online - retrying failed queries');

            // Retry failed queries
            queryClient.refetchQueries({
                predicate: (query) => query.state.status === 'error',
            });

            // Also invalidate stale queries to get fresh data
            queryClient.invalidateQueries({
                predicate: (query) =>
                    query.state.isInvalidated ||
                    (query.state.dataUpdatedAt > 0 &&
                        Date.now() - query.state.dataUpdatedAt > 60000), // Older than 1 minute
            });
        }

        wasOffline.current = !isOnline;
    }, [isOnline, queryClient]);
};

// ============================================
// Network Quality Hook (experimental)
// ============================================

interface NetworkInformation extends EventTarget {
    downlink?: number;
    effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
    rtt?: number;
    saveData?: boolean;
}

interface NavigatorWithConnection extends Navigator {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
}

export const useNetworkQuality = () => {
    const [networkInfo, setNetworkInfo] = useState<{
        effectiveType?: string;
        downlink?: number;
        rtt?: number;
        saveData?: boolean;
    }>({});

    useEffect(() => {
        const nav = navigator as NavigatorWithConnection;
        const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

        if (!connection) {
            return;
        }

        const updateNetworkInfo = () => {
            setNetworkInfo({
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData,
            });
        };

        updateNetworkInfo();
        connection.addEventListener('change', updateNetworkInfo);

        return () => {
            connection.removeEventListener('change', updateNetworkInfo);
        };
    }, []);

    return {
        ...networkInfo,
        isSlow: networkInfo.effectiveType === 'slow-2g' || networkInfo.effectiveType === '2g',
        isFast: networkInfo.effectiveType === '4g',
    };
};

// ============================================
// Combined Network Status Hook
// ============================================

export const useNetworkStatus = () => {
    const isOnline = useOnlineStatus();
    const networkQuality = useNetworkQuality();

    return {
        isOnline,
        ...networkQuality,
        isOptimal: isOnline && networkQuality.isFast,
        isDegraded: isOnline && networkQuality.isSlow,
    };
};