'use client';

// ============================================
// WebSocket Client for Real-time Updates
// ============================================

type MessageHandler = (data: any) => void;

export class WebSocketClient {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private listeners = new Map<string, Set<MessageHandler>>();
    private isManualClose = false;

    constructor(private url: string) {
        this.connect();
    }

    private connect() {
        if (typeof window === 'undefined') {
            console.warn('[WS] WebSocket not available in SSR');
            return;
        }

        try {
            this.ws = new WebSocket(this.url);
            this.setupEventHandlers();
        } catch (error) {
            console.error('[WS] Connection error:', error);
            this.attemptReconnect();
        }
    }

    private setupEventHandlers() {
        if (!this.ws) return;

        this.ws.onopen = () => {
            console.log('[WS] Connected');
            this.reconnectAttempts = 0;
        };

        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.handleMessage(message);
            } catch (error) {
                console.error('[WS] Failed to parse message:', error);
            }
        };

        this.ws.onerror = (error) => {
            console.error('[WS] Error:', error);
        };

        this.ws.onclose = (event) => {
            console.log('[WS] Disconnected', event.code, event.reason);

            if (!this.isManualClose) {
                this.attemptReconnect();
            }
        };
    }

    private handleMessage(message: { type: string; data: any }) {
        const listeners = this.listeners.get(message.type);
        if (listeners) {
            listeners.forEach(listener => {
                try {
                    listener(message.data);
                } catch (error) {
                    console.error('[WS] Listener error:', error);
                }
            });
        }
    }

    private attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('[WS] Max reconnect attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

        console.log(
            `[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
        );

        setTimeout(() => {
            if (!this.isManualClose) {
                this.connect();
            }
        }, delay);
    }

    public subscribe(type: string, callback: MessageHandler): () => void {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, new Set());
        }

        this.listeners.get(type)!.add(callback);

        // Return unsubscribe function
        return () => {
            const listeners = this.listeners.get(type);
            if (listeners) {
                listeners.delete(callback);
                if (listeners.size === 0) {
                    this.listeners.delete(type);
                }
            }
        };
    }

    public send(type: string, data: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, data }));
        } else {
            console.warn('[WS] Cannot send message, connection not open');
        }
    }

    public disconnect() {
        this.isManualClose = true;
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.listeners.clear();
    }

    public getReadyState(): number | null {
        return this.ws?.readyState ?? null;
    }

    public isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}

// ============================================
// React Hook for WebSocket
// ============================================

import { useEffect, useState, useRef } from 'react';

export const useWebSocket = (url: string) => {
    const clientRef = useRef<WebSocketClient | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        clientRef.current = new WebSocketClient(url);

        // Poll connection status
        const checkConnection = window.setInterval(() => {
            setIsConnected(clientRef.current?.isConnected() ?? false);
        }, 1000);

        return () => {
            window.clearInterval(checkConnection);
            clientRef.current?.disconnect();
            clientRef.current = null;
        };
    }, [url]);

    return {
        client: clientRef.current,
        isConnected,
        subscribe: (type: string, callback: MessageHandler) =>
            clientRef.current?.subscribe(type, callback) ?? (() => { }),
        send: (type: string, data: any) =>
            clientRef.current?.send(type, data),
    };
};

// ============================================
// Specific WebSocket Hooks
// ============================================

export const useWebSocketUpdates = <T>(
    url: string,
    messageType: string,
    initialData?: T
) => {
    const [data, setData] = useState<T | undefined>(initialData);
    const { subscribe, isConnected } = useWebSocket(url);

    useEffect(() => {
        const unsubscribe = subscribe(messageType, (newData: T) => {
            setData(newData);
        });

        return unsubscribe;
    }, [subscribe, messageType]);

    return { data, isConnected };
};