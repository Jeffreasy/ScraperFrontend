'use client';

import { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { useFetchExistingEmails } from '@/lib/hooks/use-email';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Loader2, CheckCircle, AlertCircle, Info } from 'lucide-react';
import {
    cn,
    flexPatterns,
    spacing,
    transitions,
    bodyText,
    gap,
} from '@/lib/styles/theme';

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const statusBannerVariants = cva(
    ['flex items-center gap-2 p-3 rounded-lg border', transitions.colors],
    {
        variants: {
            status: {
                success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
                error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
                info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
            },
        },
    }
);

const statusTextVariants = cva(
    [bodyText.small, 'font-medium'],
    {
        variants: {
            status: {
                success: 'text-green-800 dark:text-green-200',
                error: 'text-red-800 dark:text-red-200',
                info: 'text-blue-800 dark:text-blue-200',
            },
        },
    }
);

const statusDetailVariants = cva(
    [bodyText.small],
    {
        variants: {
            status: {
                success: 'text-green-600 dark:text-green-400',
                error: 'text-red-600 dark:text-red-400',
                info: 'text-blue-600 dark:text-blue-400',
            },
        },
    }
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EmailFetchControls() {
    const [isFetching, setIsFetching] = useState(false);
    const fetchMutation = useFetchExistingEmails();

    const handleFetchExisting = async () => {
        setIsFetching(true);
        try {
            await fetchMutation.mutateAsync();
        } finally {
            setIsFetching(false);
        }
    };

    const isLoading = isFetching || fetchMutation.isPending;
    const hasError = fetchMutation.isError;
    const hasSuccess = fetchMutation.isSuccess;

    return (
        <Card>
            <CardHeader>
                <CardTitle className={cn(flexPatterns.start, gap.sm)}>
                    <Download className="h-5 w-5" />
                    Email Import Controls
                </CardTitle>
            </CardHeader>
            <CardContent className={spacing.md}>
                {/* Control Section */}
                <div className={flexPatterns.between}>
                    <div>
                        <h4 className="font-medium">Fetch Existing Emails</h4>
                        <p className={cn(bodyText.small, 'text-muted-foreground')}>
                            Import historical emails from your inbox on first setup
                        </p>
                    </div>
                    <Button
                        onClick={handleFetchExisting}
                        disabled={isLoading}
                        variant="outline"
                        loading={isLoading}
                        leftIcon={!isLoading ? <Download className="h-4 w-4" /> : undefined}
                    >
                        {isLoading ? 'Fetching...' : 'Fetch Existing'}
                    </Button>
                </div>

                {/* Error State */}
                {hasError && (
                    <div className={statusBannerVariants({ status: 'error' })}>
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <div className="flex-1">
                            <p className={statusTextVariants({ status: 'error' })}>Failed to fetch emails</p>
                            <p className={statusDetailVariants({ status: 'error' })}>
                                Check your email configuration and try again
                            </p>
                        </div>
                    </div>
                )}

                {/* Success State */}
                {hasSuccess && fetchMutation.data?.data && (
                    <div className={statusBannerVariants({ status: 'success' })}>
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <div className="flex-1">
                            <p className={statusTextVariants({ status: 'success' })}>
                                Successfully imported emails
                            </p>
                            <p className={statusDetailVariants({ status: 'success' })}>
                                Created {fetchMutation.data.data.articles_created} articles from existing emails
                            </p>
                        </div>
                        <Badge variant="success">{fetchMutation.data.data.status}</Badge>
                    </div>
                )}

                {/* Info Note */}
                <div className={cn(bodyText.xs, 'text-muted-foreground')}>
                    <p>
                        <strong>Note:</strong> This will fetch emails from the last 30 days that match your
                        allowed senders. Subsequent runs will only process new emails.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
    statusBannerVariants,
    statusTextVariants,
    statusDetailVariants,
};