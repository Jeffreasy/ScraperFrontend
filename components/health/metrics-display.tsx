'use client';

import { Card } from '@/components/ui/card';
import { MetricsResponse } from '@/lib/types/api';
import { Database, Cpu, Activity, TrendingUp } from 'lucide-react';

interface MetricsDisplayProps {
    metrics: MetricsResponse;
}

export function MetricsDisplay({ metrics }: MetricsDisplayProps) {
    const formatDuration = (seconds: number) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (days > 0) {
            return `${days}d ${hours}u`;
        } else if (hours > 0) {
            return `${hours}u ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    };

    const formatTimestamp = (timestamp?: number) => {
        if (!timestamp) return 'Nooit';
        return new Date(timestamp * 1000).toLocaleString('nl-NL', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Database Metrics */}
            <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Database className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">Database</h4>
                </div>
                <div className="space-y-2 text-sm">
                    {metrics.db_total_conns !== undefined && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">Totale connecties:</span>
                            <span className="font-medium text-gray-900">{metrics.db_total_conns}</span>
                        </div>
                    )}
                    {metrics.db_idle_conns !== undefined && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">Idle:</span>
                            <span className="font-medium text-gray-900">{metrics.db_idle_conns}</span>
                        </div>
                    )}
                    {metrics.db_acquired_conns !== undefined && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">In gebruik:</span>
                            <span className="font-medium text-gray-900">{metrics.db_acquired_conns}</span>
                        </div>
                    )}
                    {metrics.db_max_conns !== undefined && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">Max connecties:</span>
                            <span className="font-medium text-gray-900">{metrics.db_max_conns}</span>
                        </div>
                    )}
                    {metrics.db_acquire_duration_ms !== undefined && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">Acquire tijd:</span>
                            <span className="font-medium text-gray-900">{metrics.db_acquire_duration_ms.toFixed(1)}ms</span>
                        </div>
                    )}
                </div>
            </Card>

            {/* AI Processor Metrics */}
            {(metrics.ai_is_running !== undefined || metrics.ai_process_count !== undefined) && (
                <Card className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Cpu className="h-5 w-5 text-purple-600" />
                        <h4 className="font-semibold text-gray-900">AI Processor</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                        {metrics.ai_is_running !== undefined && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <span className={`font-medium ${metrics.ai_is_running ? 'text-green-600' : 'text-gray-500'}`}>
                                    {metrics.ai_is_running ? 'Actief' : 'Inactief'}
                                </span>
                            </div>
                        )}
                        {metrics.ai_process_count !== undefined && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Verwerkte artikelen:</span>
                                <span className="font-medium text-gray-900">{metrics.ai_process_count}</span>
                            </div>
                        )}
                        {metrics.ai_last_run !== undefined && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Laatste run:</span>
                                <span className="font-medium text-gray-900">{formatTimestamp(metrics.ai_last_run)}</span>
                            </div>
                        )}
                        {metrics.ai_current_interval_seconds !== undefined && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Interval:</span>
                                <span className="font-medium text-gray-900">{formatDuration(metrics.ai_current_interval_seconds)}</span>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* Scraper Metrics */}
            {metrics.scraper && (
                <Card className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <h4 className="font-semibold text-gray-900">Scraper</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Totaal scrapes:</span>
                            <span className="font-medium text-gray-900">{metrics.scraper.total_scrapes}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Succesvol:</span>
                            <span className="font-medium text-green-600">{metrics.scraper.successful_scrapes}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Mislukt:</span>
                            <span className="font-medium text-red-600">{metrics.scraper.failed_scrapes}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Successpercentage:</span>
                            <span className="font-medium text-gray-900">
                                {metrics.scraper.total_scrapes > 0
                                    ? ((metrics.scraper.successful_scrapes / metrics.scraper.total_scrapes) * 100).toFixed(1)
                                    : '0'}%
                            </span>
                        </div>
                    </div>
                </Card>
            )}

            {/* System Uptime */}
            <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Activity className="h-5 w-5 text-indigo-600" />
                    <h4 className="font-semibold text-gray-900">Systeem</h4>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Uptime:</span>
                        <span className="font-medium text-gray-900">{formatDuration(metrics.uptime)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Timestamp:</span>
                        <span className="font-medium text-gray-900">{formatTimestamp(metrics.timestamp)}</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}