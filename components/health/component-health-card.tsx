'use client';

import { Card } from '@/components/ui/card';
import { ComponentHealth } from '@/lib/types/api';
import { CheckCircle, AlertCircle, AlertTriangle, XCircle } from 'lucide-react';

interface ComponentHealthCardProps {
    name: string;
    health: ComponentHealth;
}

export function ComponentHealthCard({ name, health }: ComponentHealthCardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
                return 'border-green-500 bg-green-50';
            case 'degraded':
                return 'border-yellow-500 bg-yellow-50';
            case 'unhealthy':
                return 'border-red-500 bg-red-50';
            case 'disabled':
                return 'border-gray-300 bg-gray-50';
            default:
                return 'border-gray-300 bg-gray-50';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'degraded':
                return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
            case 'unhealthy':
                return <XCircle className="h-5 w-5 text-red-600" />;
            case 'disabled':
                return <AlertCircle className="h-5 w-5 text-gray-400" />;
            default:
                return <AlertCircle className="h-5 w-5 text-gray-400" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'healthy':
                return 'Gezond';
            case 'degraded':
                return 'Verminderd';
            case 'unhealthy':
                return 'Ongezond';
            case 'disabled':
                return 'Uitgeschakeld';
            default:
                return 'Onbekend';
        }
    };

    return (
        <Card className={`p-4 border-2 ${getStatusColor(health.status)}`}>
            <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{name}</h4>
                {getStatusIcon(health.status)}
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <span className={`text-sm font-semibold ${health.status === 'healthy' ? 'text-green-700' :
                            health.status === 'degraded' ? 'text-yellow-700' :
                                health.status === 'unhealthy' ? 'text-red-700' :
                                    'text-gray-500'
                        }`}>
                        {getStatusText(health.status)}
                    </span>
                </div>

                {health.message && (
                    <p className="text-xs text-gray-600">{health.message}</p>
                )}

                {health.latency_ms !== undefined && (
                    <div className="text-xs text-gray-500">
                        <span className="font-medium">Latentie:</span> {health.latency_ms.toFixed(1)}ms
                    </div>
                )}

                {health.details && Object.keys(health.details).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="space-y-1">
                            {Object.entries(health.details).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-xs">
                                    <span className="text-gray-600 capitalize">
                                        {key.replace(/_/g, ' ')}:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {typeof value === 'boolean' ? (value ? 'Ja' : 'Nee') : String(value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}