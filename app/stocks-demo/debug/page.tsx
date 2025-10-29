'use client';

import React, { useEffect, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Code } from 'lucide-react';
import {
    cn,
    flexPatterns,
    spacing,
    transitions,
    bodyText,
    gap,
    responsiveHeadings,
} from '@/lib/styles/theme';

// ============================================================================
// TYPES
// ============================================================================

interface TestResult {
    name: string;
    success: boolean;
    data: string;
    raw: any;
}

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const testCardVariants = cva(
    ['transition-all duration-200'],
    {
        variants: {
            status: {
                success: 'border-green-500 dark:border-green-800',
                error: 'border-red-500 dark:border-red-800',
                pending: 'border-muted',
            },
        },
        defaultVariants: {
            status: 'pending',
        },
    }
);

const detailsVariants = cva(
    ['cursor-pointer', bodyText.small, 'text-muted-foreground', transitions.colors],
    {
        variants: {
            interactive: {
                true: 'hover:text-foreground',
                false: '',
            },
        },
        defaultVariants: {
            interactive: true,
        },
    }
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function StockDebugPage() {
    const [results, setResults] = useState<TestResult[]>([]);

    useEffect(() => {
        async function testEndpoints() {
            const tests: TestResult[] = [];

            // Test 1: Single quote
            try {
                const response = await apiClient.getStockQuote('AAPL');
                tests.push({
                    name: 'Single Quote (AAPL)',
                    success: response.success,
                    data: response.success ? 'OK' : String(response.error),
                    raw: response,
                });
            } catch (error) {
                tests.push({
                    name: 'Single Quote (AAPL)',
                    success: false,
                    data: error instanceof Error ? error.message : 'Unknown error',
                    raw: error,
                });
            }

            // Test 2: Batch quotes
            try {
                const response = await apiClient.getMultipleQuotes(['AAPL', 'MSFT']);
                tests.push({
                    name: 'Batch Quotes',
                    success: response.success,
                    data: response.success ? 'OK' : String(response.error),
                    raw: response,
                });
            } catch (error) {
                tests.push({
                    name: 'Batch Quotes',
                    success: false,
                    data: error instanceof Error ? error.message : 'Unknown error',
                    raw: error,
                });
            }

            // Test 3: Market Gainers
            try {
                const response = await apiClient.getMarketGainers();
                tests.push({
                    name: 'Market Gainers',
                    success: response.success,
                    data: response.success ? 'OK' : String(response.error),
                    raw: response,
                });
            } catch (error) {
                tests.push({
                    name: 'Market Gainers',
                    success: false,
                    data: error instanceof Error ? error.message : 'Unknown error',
                    raw: error,
                });
            }

            // Test 4: Health check
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/health`
                );
                const data = await response.json();
                tests.push({
                    name: 'Backend Health',
                    success: response.ok,
                    data: response.ok ? 'OK' : 'Failed',
                    raw: data,
                });
            } catch (error) {
                tests.push({
                    name: 'Backend Health',
                    success: false,
                    data: error instanceof Error ? error.message : 'Unknown error',
                    raw: error,
                });
            }

            setResults(tests);
        }

        testEndpoints();
    }, []);

    return (
        <div className={spacing.lg}>
            {/* Page Header */}
            <PageHeader />

            {/* Environment Info */}
            <EnvironmentCard />

            {/* Test Results */}
            {results.length > 0 ? (
                <div className={spacing.lg}>
                    {results.map((result, i) => (
                        <TestResultCard key={i} result={result} />
                    ))}
                </div>
            ) : (
                <LoadingCard />
            )}
        </div>
    );
}

// ============================================================================
// SUB COMPONENTS
// ============================================================================

function PageHeader() {
    return (
        <div className={spacing.xs}>
            <h1 className={cn(responsiveHeadings.h1, flexPatterns.start, gap.sm)}>
                <Code className="h-8 w-8 text-primary" />
                Stock API Debug
            </h1>
            <p className={cn('text-lg text-muted-foreground')}>
                Testing alle stock API endpoints
            </p>
        </div>
    );
}

function EnvironmentCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Environment</CardTitle>
            </CardHeader>
            <CardContent>
                <pre className={cn('bg-muted p-4 rounded overflow-auto', bodyText.xs)}>
                    {JSON.stringify(
                        {
                            API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
                            API_KEY: process.env.NEXT_PUBLIC_API_KEY ? '***SET***' : 'NOT SET',
                        },
                        null,
                        2
                    )}
                </pre>
            </CardContent>
        </Card>
    );
}

function TestResultCard({ result }: { result: TestResult }) {
    return (
        <Card className={testCardVariants({ status: result.success ? 'success' : 'error' })}>
            <CardHeader>
                <CardTitle className={cn(flexPatterns.start, gap.sm)}>
                    {result.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                        <XCircle className="w-5 h-5 text-destructive" />
                    )}
                    {result.name}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className={spacing.xs}>
                    <div>
                        <strong>Status:</strong> {result.data}
                    </div>
                    <details>
                        <summary className={detailsVariants()}>Show raw response</summary>
                        <pre className={cn('bg-muted p-4 rounded overflow-auto mt-2 max-h-96', bodyText.xs)}>
                            {JSON.stringify(result.raw, null, 2)}
                        </pre>
                    </details>
                </div>
            </CardContent>
        </Card>
    );
}

function LoadingCard() {
    return (
        <Card>
            <CardContent className="pt-6">
                <p className={cn('text-center text-muted-foreground', bodyText.base)}>
                    Testing endpoints...
                </p>
            </CardContent>
        </Card>
    );
}

// ============================================================================
// EXPORTS
// ============================================================================

export { testCardVariants, detailsVariants };