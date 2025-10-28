'use client';

import { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

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

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage = this.state.error?.message || 'Onbekende fout';
      const isNetworkError = errorMessage.toLowerCase().includes('network') ||
        errorMessage.toLowerCase().includes('fetch');
      const isTimeoutError = errorMessage.toLowerCase().includes('timeout');

      return (
        <div className="container mx-auto px-4 py-8">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                {isNetworkError ? 'Netwerkfout' :
                  isTimeoutError ? 'Time-out fout' :
                    'Er is iets misgegaan'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  {isNetworkError ? (
                    'Kan geen verbinding maken met de server. Controleer je internetverbinding en probeer het opnieuw.'
                  ) : isTimeoutError ? (
                    'De server reageert niet op tijd. Probeer het later opnieuw.'
                  ) : (
                    'Er is een onverwachte fout opgetreden. Probeer de pagina te vernieuwen.'
                  )}
                </p>

                {this.state.resetCount > 0 && (
                  <p className="text-xs text-gray-600">
                    Deze pagina is al {this.state.resetCount}x opnieuw geprobeerd.
                  </p>
                )}
              </div>

              {this.state.error && process.env.NODE_ENV === 'development' && (
                <details className="text-xs text-gray-600">
                  <summary className="cursor-pointer hover:underline font-medium">
                    Technische details (alleen in development)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <strong>Error:</strong>
                      <pre className="mt-1 p-2 bg-white rounded overflow-auto text-red-700">
                        {this.state.error.message}
                      </pre>
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack trace:</strong>
                        <pre className="mt-1 p-2 bg-white rounded overflow-auto text-xs">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong>Component stack:</strong>
                        <pre className="mt-1 p-2 bg-white rounded overflow-auto text-xs">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={this.reset}
                  variant="default"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Probeer opnieuw
                </Button>

                {this.state.resetCount > 1 && (
                  <Button
                    onClick={this.handleRefresh}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Pagina vernieuwen
                  </Button>
                )}

                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Terug naar home
                </Button>
              </div>

              {isNetworkError && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                  <strong>Tip:</strong> Controleer of je internetverbinding werkt en of de API server actief is.
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

// ============================================
// Lightweight Error Boundary for Components
// ============================================

interface LightweightErrorBoundaryProps {
  children: ReactNode;
  componentName?: string;
}

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
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-sm">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">
              {this.props.componentName || 'Deze component'} kon niet worden geladen
            </span>
          </div>
          <p className="mt-1 text-xs text-yellow-700">
            Er is een fout opgetreden, maar de rest van de applicatie werkt nog.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}