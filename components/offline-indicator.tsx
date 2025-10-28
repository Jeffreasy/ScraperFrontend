'use client';

import { useOnlineStatus } from '@/lib/hooks/use-online-status';
import { WifiOff, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';

export function OfflineIndicator() {
    const isOnline = useOnlineStatus();
    const [showReconnected, setShowReconnected] = useState(false);
    const [wasOffline, setWasOffline] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        // Track when we go offline
        if (!isOnline) {
            setWasOffline(true);
            setShowReconnected(false);
        }

        // Show reconnected message when coming back online
        if (isOnline && wasOffline) {
            setShowReconnected(true);

            // Hide reconnected message after 3 seconds
            const timer = setTimeout(() => {
                setShowReconnected(false);
                setWasOffline(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isOnline, wasOffline]);

    // Don't render until mounted (SSR compatibility)
    if (!isMounted) return null;

    // Show nothing if online and wasn't recently offline
    if (isOnline && !showReconnected) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top">
            {!isOnline ? (
                <div className="bg-red-600 text-white px-4 py-3 shadow-lg">
                    <div className="container mx-auto flex items-center justify-center gap-3">
                        <WifiOff className="h-5 w-5" />
                        <span className="font-medium">
                            Je bent offline. Sommige functies zijn niet beschikbaar.
                        </span>
                    </div>
                </div>
            ) : showReconnected ? (
                <div className="bg-green-600 text-white px-4 py-3 shadow-lg animate-in fade-in">
                    <div className="container mx-auto flex items-center justify-center gap-3">
                        <Wifi className="h-5 w-5" />
                        <span className="font-medium">
                            Verbinding hersteld! Bezig met synchroniseren...
                        </span>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

// Compact version for use in headers/navbars
export function OfflineIndicatorCompact() {
    const isOnline = useOnlineStatus();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Don't render until mounted (avoid hydration mismatch)
    if (!isMounted) return null;

    if (isOnline) return null;

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm">
            <WifiOff className="h-4 w-4" />
            <span className="font-medium">Offline</span>
        </div>
    );
}