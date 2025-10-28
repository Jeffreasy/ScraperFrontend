'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StockDebugPage() {
    const [results, setResults] = useState<any[]>([]);

    useEffect(() => {
        async function testEndpoints() {
            const tests = [];

            // Test 1: Single quote
            try {
                const response = await apiClient.getStockQuote('AAPL');
                tests.push({
                    name: 'Single Quote (AAPL)',
                    success: response.success,
                    data: response.success ? 'OK' : response.error,
                    raw: response
                });
            } catch (error) {
                tests.push({
                    name: 'Single Quote (AAPL)',
                    success: false,
                    data: error instanceof Error ? error.message : 'Unknown error',
                    raw: error
                });
            }

            // Test 2: Batch quotes
            try {
                const response = await apiClient.getMultipleQuotes(['AAPL', 'MSFT']);
                tests.push({
                    name: 'Batch Quotes',
                    success: response.success,
                    data: response.success ? 'OK' : response.error,
                    raw: response
                });
            } catch (error) {
                tests.push({
                    name: 'Batch Quotes',
                    success: false,
                    data: error instanceof Error ? error.message : 'Unknown error',
                    raw: error
                });
            }

            // Test 3: Market Gainers
            try {
                const response = await apiClient.getMarketGainers();
                tests.push({
                    name: 'Market Gainers',
                    success: response.success,
                    data: response.success ? 'OK' : response.error,
                    raw: response
                });
            } catch (error) {
                tests.push({
                    name: 'Market Gainers',
                    success: false,
                    data: error instanceof Error ? error.message : 'Unknown error',
                    raw: error
                });
            }

            // Test 4: Health check
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/health`);
                const data = await response.json();
                tests.push({
                    name: 'Backend Health',
                    success: response.ok,
                    data: response.ok ? 'OK' : 'Failed',
                    raw: data
                });
            } catch (error) {
                tests.push({
                    name: 'Backend Health',
                    success: false,
                    data: error instanceof Error ? error.message : 'Unknown error',
                    raw: error
                });
            }

            setResults(tests);
        }

        testEndpoints();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Stock API Debug</h1>
                <p className="text-muted-foreground">Testing alle stock API endpoints</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Environment</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="bg-muted p-4 rounded text-xs overflow-auto">
                        {JSON.stringify({
                            API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
                            API_KEY: process.env.NEXT_PUBLIC_API_KEY ? '***SET***' : 'NOT SET',
                        }, null, 2)}
                    </pre>
                </CardContent>
            </Card>

            {results.map((result, i) => (
                <Card key={i} className={result.success ? 'border-green-500' : 'border-red-500'}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span>{result.success ? '✅' : '❌'}</span>
                            {result.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div>
                                <strong>Status:</strong> {result.data}
                            </div>
                            <details>
                                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                                    Show raw response
                                </summary>
                                <pre className="bg-muted p-4 rounded text-xs overflow-auto mt-2 max-h-96">
                                    {JSON.stringify(result.raw, null, 2)}
                                </pre>
                            </details>
                        </div>
                    </CardContent>
                </Card>
            ))}

            {results.length === 0 && (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">Testing endpoints...</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}