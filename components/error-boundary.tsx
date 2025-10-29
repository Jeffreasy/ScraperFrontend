'use client';

import { Component, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home, Wifi, Clock } from 'lucide-react';
import {
  cn,
  flexPatterns,
  spacing,
  transitions,
  bodyText,
  gap,
  cardStyles,
} from '@/lib/styles/theme';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  resetKeys?: any[];
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
  resetCount: number;
}

interface LightweightErrorBoundaryProps {
  children: ReactNode;
  componentName?: string;
}

type ErrorType = 'network' | 'timeout' | 'unknown';

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const errorCardVariants = cva(
  [cardStyles.base, transitions.shadow],
  {
    variants: {
      severity: {
        error: 'border-destructive/50 bg-destructive/10',
        warning: 'border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20',
        info: 'border-blue-500/50 bg-blue-50 dark:bg-blue-950/20',
      },
    },
    defaultVariants: {
      severity: 'error',
    },
  }
);

const errorTitleVariants = cva(
  ['flex items-center gap-2 font-semibold'],
  {
    variants: {
      severity: {
        error: 'text-destructive',
        warning: 'text-yellow-800 dark:text-yellow-300',
        info: 'text-blue-800 dark:text-blue-300',
      },
    },
    defaultVariants: {
      severity: 'error',
    },
  }
);

const errorMessageVariants = cva(
  [bodyText.small],
  {
    variants: {
      severity: {
        error: 'text-destructive/90',
        warning: 'text-yellow-700 dark:text-yellow-300',
        info: 'text-blue-700 dark:text-blue-300',
      },
    },
    defaultVariants: {
      severity: 'error',
    },
  }
);

const tipBoxVariants = cva(
  ['p-3 rounded border', bodyText.small, transitions.colors],
  {
    variants: {
      type: {
        info: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
        warning: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300',
      },
    },
    defaultVariants: {
      type: 'info',
    },
  }
);

const detailsVariants = cva(
  [bodyText.xs, 'text-muted-foreground'],
  {
    variants: {
      interactive: {
        true: 'cursor-pointer hover:underline font-medium',
        false: '',
      },
    },
    defaultVariants: {
      interactive: false,
    },
  }
);

// ============================================================================
// MAIN ERROR BOUNDARY
// ============================================================================

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      resetCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      resetCount: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });

    // Log to external service if available (e.g., Sentry)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, { extra: errorInfo });
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error boundary when resetKeys change
    if (
      this.props.resetKeys &&
      prevProps.resetKeys &&
      this.props.resetKeys !== prevProps.resetKeys
    ) {
      if (this.state.hasError) {
        this.reset();
      }
    }
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      resetCount: this.state.resetCount + 1,
    });
    this.props.onReset?.();
  };

  handleRefresh = () => {
    this.reset();
    window.location.reload();
  };

  handleGoHome = () => {
    this.reset();
    window.location.href = '/';
  };

  getErrorType(): ErrorType {
    const errorMessage = this.state.error?.message?.toLowerCase() || '';
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'network';
    }
    if (errorMessage.includes('timeout')) {
      return 'timeout';
    }
    return 'unknown';
  }

  getErrorIcon(): React.ComponentType<{ className?: string }> {
    const errorType = this.getErrorType();
    switch (errorType) {
      case 'network':
        return Wifi;
      case 'timeout':
        return Clock;
      default:
        return AlertCircle;
    }
  }

  getErrorTitle(): string {
    const errorType = this.getErrorType();
    switch (errorType) {
      case 'network':
        return 'Netwerkfout';
      case 'timeout':
        return 'Time-out fout';
      default:
        return 'Er is iets misgegaan';
    }
  }

  getErrorMessage(): string {
    const errorType = this.getErrorType();
    switch (errorType) {
      case 'network':
        return 'Kan geen verbinding maken met de server. Controleer je internetverbinding en probeer het opnieuw.';
      case 'timeout':
        return 'De server reageert niet op tijd. Probeer het later opnieuw.';
      default:
        return 'Er is een onverwachte fout opgetreden. Probeer de pagina te vernieuwen.';
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorType = this.getErrorType();
      const ErrorIcon = this.getErrorIcon();
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="container mx-auto px-4 py-8">
          <Card className={errorCardVariants({ severity: 'error' })}>
            <CardHeader>
              <CardTitle className={errorTitleVariants({ severity: 'error' })}>
                <ErrorIcon className="h-5 w-5" />
                {this.getErrorTitle()}
              </CardTitle>
            </CardHeader>

            <CardContent className={spacing.md}>
              {/* Error Message */}
              <div className={spacing.xs}>
                <p className={errorMessageVariants({ severity: 'error' })}>
                  {this.getErrorMessage()}
                </p>

                {this.state.resetCount > 0 && (
                  <p className={cn(bodyText.xs, 'text-muted-foreground mt-2')}>
                    Deze pagina is al {this.state.resetCount}x opnieuw geprobeerd.
                  </p>
                )}
              </div>

              {/* Development Details */}
              {this.state.error && isDevelopment && (
                <details className={cn(bodyText.xs, 'text-muted-foreground')}>
                  <summary className={detailsVariants({ interactive: true })}>
                    Technische details (alleen in development)
                  </summary>
                  <div className={cn('mt-2', spacing.xs)}>
                    <div>
                      <strong>Error:</strong>
                      <pre className={cn('mt-1 p-2 bg-background rounded overflow-auto text-destructive', bodyText.xs)}>
                        {this.state.error.message}
                      </pre>
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack trace:</strong>
                        <pre className={cn('mt-1 p-2 bg-background rounded overflow-auto', bodyText.xs)}>
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong>Component stack:</strong>
                        <pre className={cn('mt-1 p-2 bg-background rounded overflow-auto', bodyText.xs)}>
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className={cn('flex flex-wrap', gap.sm)}>
                <Button
                  onClick={this.reset}
                  variant="default"
                  className={cn(flexPatterns.start, gap.sm)}
                >
                  <RefreshCw className="h-4 w-4" />
                  Probeer opnieuw
                </Button>

                {this.state.resetCount > 1 && (
                  <Button
                    onClick={this.handleRefresh}
                    variant="outline"
                    className={cn(flexPatterns.start, gap.sm)}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Pagina vernieuwen
                  </Button>
                )}

                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className={cn(flexPatterns.start, gap.sm)}
                >
                  <Home className="h-4 w-4" />
                  Terug naar home
                </Button>
              </div>

              {/* Network Tip */}
              {errorType === 'network' && (
                <div className={tipBoxVariants({ type: 'info' })}>
                  <strong>Tip:</strong> Controleer of je internetverbinding werkt en of de API
                  server actief is.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// LIGHTWEIGHT ERROR BOUNDARY
// ============================================================================

export class LightweightErrorBoundary extends Component<
  LightweightErrorBoundaryProps,
  { hasError: boolean }
> {
  constructor(props: LightweightErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error(
      `Error in ${this.props.componentName || 'component'}:`,
      error,
      errorInfo
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={cn(errorCardVariants({ severity: 'warning' }), 'p-4')}>
          <div className={cn(flexPatterns.start, gap.sm, errorTitleVariants({ severity: 'warning' }))}>
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">
              {this.props.componentName || 'Deze component'} kon niet worden geladen
            </span>
          </div>
          <p className={cn('mt-1', bodyText.xs, errorMessageVariants({ severity: 'warning' }))}>
            Er is een fout opgetreden, maar de rest van de applicatie werkt nog.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { Props as ErrorBoundaryProps, LightweightErrorBoundaryProps, ErrorType };
export {
  errorCardVariants,
  errorTitleVariants,
  errorMessageVariants,
  tipBoxVariants,
  detailsVariants,
};