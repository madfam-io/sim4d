/**
 * Production error boundary with proper error handling and reporting
 */

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { getConfig } from '@sim4d/engine-core';
import ProductionLogger from '@sim4d/engine-occt';

// Lazy logger initialization to avoid constructor issues during module loading
let logger: any = null;
const getLogger = () => {
  if (!logger) {
    logger = new ProductionLogger({ component: 'ErrorBoundary' } as any);
  }
  return logger;
};

interface Props {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class ProductionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { errorId } = this.state;

    // Log to production logging system
    getLogger().error('React error boundary caught error', {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, send to error reporting service
    if (getConfig().isProduction && getConfig().enableErrorReporting) {
      this.reportToErrorService(error, errorInfo);
    }
  }

  private reportToErrorService(_error: Error, _errorInfo: ErrorInfo) {
    // This would integrate with Sentry or similar service
    try {
      // Example Sentry integration:
      // Sentry.withScope((scope) => {
      //   scope.setContext('errorBoundary', {
      //     errorId: this.state.errorId,
      //     componentStack: errorInfo.componentStack,
      //   });
      //   Sentry.captureException(error);
      // });

      // For now, just log that we would report
      getLogger().info('Error reported to monitoring service', {
        errorId: this.state.errorId,
      });
    } catch (reportError) {
      // Silently fail to avoid recursive errors
      getLogger().warn('Failed to report error to service', reportError);
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private renderDefaultFallback() {
    const { error, errorId } = this.state;
    const config = getConfig();

    return (
      <div className="error-boundary-fallback">
        <div className="error-container">
          <h1 className="error-title">
            {config.isProduction ? 'Something went wrong' : 'Application Error'}
          </h1>

          <p className="error-message">
            {config.isProduction
              ? 'An unexpected error occurred. Please try refreshing the page.'
              : error?.message || 'Unknown error'}
          </p>

          {!config.isProduction && error?.stack && (
            <details className="error-details">
              <summary>Error Details</summary>
              <pre className="error-stack">{error.stack}</pre>
            </details>
          )}

          {errorId && (
            <p className="error-id">
              Error ID: <code>{errorId}</code>
            </p>
          )}

          <div className="error-actions">
            <button onClick={this.handleReset} className="btn btn-secondary">
              Try Again
            </button>
            <button onClick={this.handleReload} className="btn btn-primary">
              Reload Page
            </button>
          </div>

          {config.isProduction && (
            <p className="error-support">
              If this problem persists, please contact support with the error ID above.
            </p>
          )}
        </div>

        <style>{`
          .error-boundary-fallback {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 2rem;
          }

          .error-container {
            background: white;
            border-radius: 8px;
            padding: 2rem;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }

          .error-title {
            color: #e53e3e;
            font-size: 1.875rem;
            font-weight: bold;
            margin-bottom: 1rem;
          }

          .error-message {
            color: #4a5568;
            font-size: 1.125rem;
            margin-bottom: 1.5rem;
          }

          .error-details {
            background: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 1rem;
            margin-bottom: 1.5rem;
          }

          .error-details summary {
            cursor: pointer;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 0.5rem;
          }

          .error-stack {
            font-family: 'Courier New', monospace;
            font-size: 0.875rem;
            color: #e53e3e;
            overflow-x: auto;
            white-space: pre-wrap;
            word-break: break-word;
            margin: 0;
          }

          .error-id {
            color: #718096;
            font-size: 0.875rem;
            margin-bottom: 1.5rem;
          }

          .error-id code {
            background: #edf2f7;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
          }

          .error-actions {
            display: flex;
            gap: 1rem;
          }

          .btn {
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            font-size: 1rem;
          }

          .btn-primary {
            background: #667eea;
            color: white;
          }

          .btn-primary:hover {
            background: #5a67d8;
          }

          .btn-secondary {
            background: #edf2f7;
            color: #4a5568;
          }

          .btn-secondary:hover {
            background: #e2e8f0;
          }

          .error-support {
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e2e8f0;
            color: #718096;
            font-size: 0.875rem;
            text-align: center;
          }
        `}</style>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided, otherwise use default
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.state.errorInfo!);
      }
      return this.renderDefaultFallback();
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ProductionErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ProductionErrorBoundary>
  );
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;
  return WrappedComponent;
}
