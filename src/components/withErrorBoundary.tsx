import React, { ComponentType, Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface WithErrorBoundaryProps {
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

/**
 * Higher-Order Component for error boundary functionality
 * Catches JavaScript errors anywhere in the component tree
 */
const withErrorBoundary = <P extends object>(
  WrappedComponent: ComponentType<P & WithErrorBoundaryProps>
) => {
  class ErrorBoundary extends Component<P & WithErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: P & WithErrorBoundaryProps) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      this.setState({ error, errorInfo });
      
      // Call custom error handler if provided
      if (this.props.onError) {
        this.props.onError(error, errorInfo);
      }

      // Log error to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
      }
    }

    handleRetry = () => {
      this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    handleGoHome = () => {
      window.location.href = '/';
    };

    render(): ReactNode {
      if (this.state.hasError) {
        const { fallback: CustomFallback } = this.props;
        
        // Use custom fallback if provided
        if (CustomFallback) {
          return <CustomFallback error={this.state.error!} retry={this.handleRetry} />;
        }

        // Default error UI
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Something went wrong</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-center">
                  We're sorry, but something unexpected happened. Please try again.
                </p>
                
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="bg-gray-100 p-3 rounded text-xs">
                    <summary className="cursor-pointer font-medium">Error Details</summary>
                    <pre className="mt-2 whitespace-pre-wrap text-red-600">
                      {this.state.error.toString()}
                    </pre>
                  </details>
                )}

                <div className="flex gap-2">
                  <Button onClick={this.handleRetry} className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Button variant="outline" onClick={this.handleGoHome} className="flex-1">
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }

      return <WrappedComponent {...this.props} />;
    }
  }

  // Set display name for debugging
  ErrorBoundary.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return ErrorBoundary;
};

export default withErrorBoundary;
