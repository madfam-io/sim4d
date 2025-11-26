/**
 * User-friendly error display component
 */

import React, { useState, useEffect } from 'react';
import { Sim4DError, ErrorSeverity, RecoveryAction } from '../../lib/error-handling/types';
import { ErrorManager } from '../../lib/error-handling/error-manager';

interface ErrorDisplayProps {
  errorId: string | null;
  error: Error | null;
  onReset: () => void;
  isolated?: boolean;
  specializedFor?: 'wasm' | 'geometry' | 'network';
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  errorId,
  error,
  onReset,
  isolated = false,
  specializedFor,
}) => {
  const [brepFlowError, setSim4DError] = useState<Sim4DError | null>(null);
  const [isExecutingRecovery, setIsExecutingRecovery] = useState<string | null>(null);

  useEffect(() => {
    if (errorId) {
      const errorManager = ErrorManager.getInstance();
      const errors = errorManager.getErrors();
      const foundError = errors.find((e) => e.id === errorId);
      setSim4DError(foundError || null);
    }
  }, [errorId]);

  const handleRecoveryAction = async (action: RecoveryAction) => {
    if (!errorId) return;

    if (action.requiresConfirmation) {
      const confirmed = window.confirm(
        `Are you sure you want to ${action.label}?\n\n${action.description}${
          action.destructive ? '\n\nThis action cannot be undone.' : ''
        }`
      );

      if (!confirmed) return;
    }

    setIsExecutingRecovery(action.id);

    try {
      const errorManager = ErrorManager.getInstance();
      const success = await errorManager.executeRecoveryAction(errorId, action.id);

      if (success) {
        onReset();
      } else {
        alert('Recovery action failed. Please try another option or contact support.');
      }
    } catch (error) {
      alert('Recovery action failed with an error. Please try another option or contact support.');
    } finally {
      setIsExecutingRecovery(null);
    }
  };

  const getSeverityColor = (severity: ErrorSeverity): string => {
    switch (severity) {
      case ErrorSeverity.LOW:
        return '#10b981'; // green
      case ErrorSeverity.MEDIUM:
        return '#f59e0b'; // amber
      case ErrorSeverity.HIGH:
        return '#ef4444'; // red
      case ErrorSeverity.CRITICAL:
        return '#dc2626'; // dark red
      default:
        return '#6b7280'; // gray
    }
  };

  const getSeverityIcon = (severity: ErrorSeverity): string => {
    switch (severity) {
      case ErrorSeverity.LOW:
        return '⚠️';
      case ErrorSeverity.MEDIUM:
        return '⚠️';
      case ErrorSeverity.HIGH:
        return '❌';
      case ErrorSeverity.CRITICAL:
        return '🚨';
      default:
        return '❓';
    }
  };

  const getSpecializedMessage = (): React.ReactNode => {
    switch (specializedFor) {
      case 'wasm':
        return (
          <div className="specialized-message wasm">
            <h4>🔧 WASM Engine Issue</h4>
            <p>The WebAssembly geometry engine encountered an error. This might be due to:</p>
            <ul>
              <li>Complex geometry operations exceeding memory limits</li>
              <li>Invalid parameters passed to geometry functions</li>
              <li>Browser compatibility issues with SharedArrayBuffer</li>
            </ul>
          </div>
        );

      case 'geometry':
        return (
          <div className="specialized-message geometry">
            <h4>📐 Geometry Computation Error</h4>
            <p>Unable to compute the requested geometry operation. Common causes:</p>
            <ul>
              <li>Invalid or contradictory geometric parameters</li>
              <li>Degenerate geometry (zero-area surfaces, zero-length curves)</li>
              <li>Numeric precision issues with very small or large values</li>
            </ul>
          </div>
        );

      case 'network':
        return (
          <div className="specialized-message network">
            <h4>🌐 Network Connection Error</h4>
            <p>Unable to communicate with the server. This might be due to:</p>
            <ul>
              <li>Network connectivity issues</li>
              <li>Server maintenance or downtime</li>
              <li>Firewall or proxy blocking the request</li>
            </ul>
          </div>
        );

      default:
        return null;
    }
  };

  const displayError = brepFlowError || {
    id: 'unknown',
    code: 'UNKNOWN_ERROR' as any,
    category: 'runtime' as any,
    severity: ErrorSeverity.MEDIUM,
    message: error?.message || 'An unexpected error occurred',
    technicalDetails: error?.stack,
    userMessage: 'Something went wrong. Please try refreshing the page.',
    context: {
      timestamp: Date.now(),
      sessionId: 'unknown',
      buildVersion: 'unknown',
    },
    recoverable: true,
    recoveryActions: [
      {
        id: 'reset',
        label: 'Try Again',
        description: 'Attempt to recover from this error',
        action: () => true,
        destructive: false,
        requiresConfirmation: false,
      },
    ],
    reportedToService: false,
    occurredAt: new Date(),
  };

  return (
    <div
      className={`error-display ${isolated ? 'isolated' : 'full'} severity-${displayError.severity}`}
      style={{
        padding: '2rem',
        margin: isolated ? '1rem' : '0',
        border: `2px solid ${getSeverityColor(displayError.severity)}`,
        borderRadius: '8px',
        backgroundColor: '#fef2f2',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: isolated ? '500px' : '100%',
      }}
    >
      <div className="error-header" style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem',
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>{getSeverityIcon(displayError.severity)}</span>
          <h3
            style={{
              margin: 0,
              color: getSeverityColor(displayError.severity),
              fontSize: '1.25rem',
            }}
          >
            {displayError.severity === ErrorSeverity.CRITICAL
              ? 'Critical Error'
              : displayError.severity === ErrorSeverity.HIGH
                ? 'Error'
                : displayError.severity === ErrorSeverity.MEDIUM
                  ? 'Warning'
                  : 'Notice'}
          </h3>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: '1rem',
            color: '#374151',
            fontWeight: 500,
          }}
        >
          {displayError.userMessage}
        </p>
      </div>

      {getSpecializedMessage()}

      {/* Technical details (collapsible) */}
      <details style={{ marginBottom: '1.5rem' }}>
        <summary
          style={{
            cursor: 'pointer',
            color: '#6b7280',
            fontSize: '0.875rem',
            marginBottom: '0.5rem',
          }}
        >
          Technical Details
        </summary>
        <div
          style={{
            padding: '0.75rem',
            backgroundColor: '#f9fafb',
            borderRadius: '4px',
            fontSize: '0.8rem',
            color: '#374151',
            fontFamily: 'monospace',
          }}
        >
          <p>
            <strong>Error Code:</strong> {displayError.code}
          </p>
          <p>
            <strong>Category:</strong> {displayError.category}
          </p>
          <p>
            <strong>Time:</strong> {displayError.occurredAt.toLocaleString()}
          </p>
          {displayError.message !== displayError.userMessage && (
            <p>
              <strong>Technical Message:</strong> {displayError.message}
            </p>
          )}
          {displayError.technicalDetails && (
            <details>
              <summary>Stack Trace</summary>
              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.75rem',
                  marginTop: '0.5rem',
                }}
              >
                {displayError.technicalDetails}
              </pre>
            </details>
          )}
        </div>
      </details>

      {/* Recovery actions */}
      {displayError.recoverable &&
        displayError.recoveryActions &&
        displayError.recoveryActions.length > 0 && (
          <div className="recovery-actions" style={{ marginBottom: '1rem' }}>
            <h4
              style={{
                margin: '0 0 0.75rem 0',
                fontSize: '1rem',
                color: '#374151',
              }}
            >
              What would you like to do?
            </h4>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {displayError.recoveryActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleRecoveryAction(action)}
                  disabled={isExecutingRecovery === action.id}
                  style={{
                    padding: '0.5rem 1rem',
                    border:
                      (action.destructive ?? false) ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: (action.destructive ?? false) ? '#fef2f2' : '#ffffff',
                    color: (action.destructive ?? false) ? '#dc2626' : '#374151',
                    cursor: isExecutingRecovery ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    opacity: isExecutingRecovery && isExecutingRecovery !== action.id ? 0.5 : 1,
                  }}
                  title={action.description}
                >
                  {isExecutingRecovery === action.id ? '...' : action.label}
                </button>
              ))}
            </div>
          </div>
        )}

      {/* Default reset button if no recovery actions */}
      {(!displayError.recoveryActions || displayError.recoveryActions.length === 0) && (
        <button
          onClick={onReset}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: '#3b82f6',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
        >
          Try Again
        </button>
      )}

      {/* Error reporting status */}
      <div
        style={{
          marginTop: '1rem',
          fontSize: '0.75rem',
          color: '#6b7280',
          borderTop: '1px solid #e5e7eb',
          paddingTop: '0.75rem',
        }}
      >
        {displayError.reportedToService ? (
          <span>✅ Error has been automatically reported</span>
        ) : (
          <span>ℹ️ This error will be used to improve the application</span>
        )}
      </div>
    </div>
  );
};
