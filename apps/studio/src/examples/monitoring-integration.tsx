/**
 * Example integration of monitoring system with BrepFlow components
 * This file demonstrates best practices for using the monitoring system
 */

import React, { useCallback, useState } from 'react';
import { ErrorBoundary, WASMErrorBoundary } from '../lib/error-handling/error-boundary';
import { useMonitoring, useRenderTiming, useOperationTiming } from '../hooks/useMonitoring';
import { ErrorCode } from '../lib/error-handling/types';
import { createChildLogger } from '../lib/logging/logger-instance';

const logger = createChildLogger({ module: 'monitoring-integration' });

/**
 * Example: Monitored Button Component
 * Shows how to track user interactions and handle errors
 */
export const MonitoredButton: React.FC<{
  children: React.ReactNode;
  onClick: () => Promise<void> | void;
  operation?: string;
}> = ({ children, onClick, operation = 'button_click' }) => {
  const { recordUserInteraction, executeMonitoredOperation } = useMonitoring();
  const [isLoading, setIsLoading] = useState(false);

  // Track render performance
  useRenderTiming('MonitoredButton');

  const handleClick = useCallback(async () => {
    // Record user interaction
    recordUserInteraction({
      type: 'button_click',
      target: operation,
      data: { timestamp: Date.now() },
    });

    setIsLoading(true);

    try {
      // Execute with monitoring
      await executeMonitoredOperation(
        async () => {
          const result = onClick();
          if (result instanceof Promise) {
            await result;
          }
        },
        operation,
        {
          enableRetry: true,
          retryConfig: {
            maxAttempts: 3,
            baseDelay: 1000,
          },
        }
      );
    } finally {
      setIsLoading(false);
    }
  }, [onClick, operation, recordUserInteraction, executeMonitoredOperation]);

  return (
    <button onClick={handleClick} disabled={isLoading}>
      {isLoading ? 'Loading...' : children}
    </button>
  );
};

/**
 * Example: Monitored WASM Geometry Component
 * Shows how to handle WASM operations with specialized error boundaries
 */
export const GeometryPreview: React.FC<{
  geometryData: any;
  onError?: (error: Error) => void;
}> = ({ geometryData, onError }) => {
  const { executeWasmOperation } = useMonitoring();
  const { measureAsync } = useOperationTiming();
  const [geometry, setGeometry] = useState<any>(null);
  const [isComputing, setIsComputing] = useState(false);

  // Track render performance
  useRenderTiming('GeometryPreview');

  const computeGeometry = useCallback(async () => {
    if (!geometryData) return;

    setIsComputing(true);

    try {
      // Measure and execute WASM operation
      const result = await measureAsync(
        () =>
          executeWasmOperation(() => {
            // Simulate geometry computation
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                if (Math.random() > 0.9) {
                  reject(new Error('Geometry computation failed'));
                } else {
                  resolve({ vertices: [], faces: [] });
                }
              }, 1000);
            });
          }, 'geometry_preview_computation'),
        'geometry_preview_render',
        { geometryType: geometryData.type }
      );

      setGeometry(result);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsComputing(false);
    }
  }, [geometryData, executeWasmOperation, measureAsync, onError]);

  React.useEffect(() => {
    computeGeometry();
  }, [computeGeometry]);

  return (
    <WASMErrorBoundary
      onError={(error, errorInfo) => {
        logger.error('WASM error in geometry preview:', error, errorInfo);
        onError?.(error);
      }}
    >
      <div className="geometry-preview">
        {isComputing ? (
          <div className="loading">Computing geometry...</div>
        ) : geometry ? (
          <div className="geometry-display">
            Geometry ready: {geometry.vertices?.length || 0} vertices
          </div>
        ) : (
          <div className="no-geometry">No geometry data</div>
        )}
      </div>
    </WASMErrorBoundary>
  );
};

/**
 * Example: Monitored Form Component
 * Shows how to handle validation errors and user input tracking
 */
export const MonitoredForm: React.FC<{
  onSubmit: (data: any) => Promise<void>;
}> = ({ onSubmit }) => {
  const { recordUserInteraction, executeNetworkOperation } = useMonitoring();
  const [formData, setFormData] = useState({ name: '', value: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Track render performance
  useRenderTiming('MonitoredForm');

  const handleInputChange = useCallback(
    (field: string, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }

      // Record user input (debounced)
      recordUserInteraction({
        type: 'form_input',
        target: field,
        data: { valueLength: value.length },
      });
    },
    [errors, recordUserInteraction]
  );

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.value.trim()) {
      newErrors.value = 'Value is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Record form submission attempt
      recordUserInteraction({
        type: 'form_submit',
        target: 'monitored_form',
        data: { fieldCount: Object.keys(formData).length },
      });

      if (!validateForm()) {
        recordUserInteraction({
          type: 'form_validation_error',
          target: 'monitored_form',
          data: { errorCount: Object.keys(errors).length },
        });
        return;
      }

      try {
        // Execute with network monitoring
        await executeNetworkOperation(() => onSubmit(formData), 'form_submission');

        // Reset form on success
        setFormData({ name: '', value: '' });

        recordUserInteraction({
          type: 'form_submit_success',
          target: 'monitored_form',
        });
      } catch (error) {
        recordUserInteraction({
          type: 'form_submit_error',
          target: 'monitored_form',
          data: { error: error instanceof Error ? error.message : String(error) },
        });
      }
    },
    [formData, validateForm, errors, recordUserInteraction, executeNetworkOperation, onSubmit]
  );

  return (
    <ErrorBoundary>
      <form onSubmit={handleSubmit} className="monitored-form">
        <div className="form-field">
          <label htmlFor="name">Name:</label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="value">Value:</label>
          <input
            id="value"
            type="text"
            value={formData.value}
            onChange={(e) => handleInputChange('value', e.target.value)}
          />
          {errors.value && <span className="error">{errors.value}</span>}
        </div>

        <MonitoredButton
          onClick={() => {
            const formEvent = new Event('submit', { bubbles: true, cancelable: true }) as any;
            handleSubmit(formEvent);
          }}
          operation="form_submit_button"
        >
          Submit
        </MonitoredButton>
      </form>
    </ErrorBoundary>
  );
};

/**
 * Example: Component with Manual Error Handling
 * Shows how to create and handle custom errors
 */
export const DataProcessor: React.FC<{
  data: any[];
}> = ({ data }) => {
  const { recordUserInteraction } = useMonitoring();
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Track render performance
  useRenderTiming('DataProcessor');

  const processData = useCallback(async () => {
    setError(null);

    try {
      // Validate input
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format: expected array');
      }

      if (data.length === 0) {
        throw new Error('No data to process');
      }

      // Record processing start
      recordUserInteraction({
        type: 'data_processing_start',
        data: { itemCount: data.length },
      });

      // Simulate processing
      const processed = data.map((item, index) => {
        if (typeof item !== 'object') {
          throw new Error(`Invalid item at index ${index}: expected object`);
        }

        return {
          ...item,
          processed: true,
          processedAt: new Date().toISOString(),
        };
      });

      setProcessedData(processed);

      recordUserInteraction({
        type: 'data_processing_success',
        data: { processedCount: processed.length },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);

      recordUserInteraction({
        type: 'data_processing_error',
        data: { error: errorMessage },
      });
    }
  }, [data, recordUserInteraction]);

  React.useEffect(() => {
    if (data) {
      processData();
    }
  }, [processData]);

  if (error) {
    return (
      <div className="error-display">
        <h3>Processing Error</h3>
        <p>{error}</p>
        <MonitoredButton onClick={processData} operation="data_processor_retry">
          Retry
        </MonitoredButton>
      </div>
    );
  }

  return (
    <div className="data-processor">
      <h3>Processed Data ({processedData.length} items)</h3>
      <div className="data-list">
        {processedData.map((item, index) => (
          <div key={index} className="data-item">
            <pre>{JSON.stringify(item, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Example: Page Component with Comprehensive Monitoring
 * Shows how to integrate monitoring at the page level
 */
export const MonitoredPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);

  // Track page render performance
  useRenderTiming('MonitoredPage');

  const handleFormSubmit = useCallback(async (formData: any) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setData((prev) => [...prev, { ...formData, id: Date.now() }]);
  }, []);

  const handleGeometryError = useCallback((error: Error) => {
    logger.error('Geometry error:', error);
    // Could show user notification here
  }, []);

  return (
    <ErrorBoundary>
      <div className="monitored-page">
        <h1>Monitored BrepFlow Component Examples</h1>

        <section>
          <h2>Form Example</h2>
          <MonitoredForm onSubmit={handleFormSubmit} />
        </section>

        <section>
          <h2>Geometry Example</h2>
          <GeometryPreview
            geometryData={{ type: 'box', width: 10, height: 10, depth: 10 }}
            onError={handleGeometryError}
          />
        </section>

        <section>
          <h2>Data Processing Example</h2>
          <DataProcessor data={data} />
        </section>
      </div>
    </ErrorBoundary>
  );
};
