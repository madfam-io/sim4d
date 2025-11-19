/**
 * React hooks for monitoring integration
 */

import { useEffect, useCallback, useState } from 'react';
import { MonitoringSystem } from '../lib/monitoring/monitoring-system';
import { ErrorManager } from '../lib/error-handling/error-manager';
import { MetricsCollector } from '../lib/monitoring/metrics-collector';
import { HealthAlert } from '../lib/monitoring/health-monitor';
import { BrepFlowError } from '../lib/error-handling/types';
import { createChildLogger } from '../lib/logging/logger-instance';

const logger = createChildLogger({ module: 'useMonitoring' });

/**
 * Hook for accessing monitoring system
 */
export function useMonitoring() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [monitoringSystem, setMonitoringSystem] = useState<MonitoringSystem | null>(null);

  useEffect(() => {
    try {
      const system = MonitoringSystem.getInstance();
      setMonitoringSystem(system);
      setIsInitialized(true);
    } catch (error) {
      logger.warn('Monitoring system not initialized yet');
    }
  }, []);

  const recordUserInteraction = useCallback(
    (interaction: { type: string; target?: string; data?: Record<string, unknown> }) => {
      monitoringSystem?.recordUserInteraction(interaction);
    },
    [monitoringSystem]
  );

  const executeMonitoredOperation = useCallback(
    async <T>(
      operation: () => Promise<T>,
      operationName: string,
      options?: Parameters<NonNullable<typeof monitoringSystem>['executeMonitoredOperation']>[2]
    ): Promise<T> => {
      if (!monitoringSystem) {
        throw new Error('Monitoring system not available');
      }
      return monitoringSystem.executeMonitoredOperation(operation, operationName, options);
    },
    [monitoringSystem]
  );

  const executeWasmOperation = useCallback(
    async <T>(operation: () => Promise<T>, operationName?: string): Promise<T> => {
      if (!monitoringSystem) {
        throw new Error('Monitoring system not available');
      }
      return monitoringSystem.executeWasmOperation(operation, operationName);
    },
    [monitoringSystem]
  );

  const executeNetworkOperation = useCallback(
    async <T>(operation: () => Promise<T>, operationName?: string): Promise<T> => {
      if (!monitoringSystem) {
        throw new Error('Monitoring system not available');
      }
      return monitoringSystem.executeNetworkOperation(operation, operationName);
    },
    [monitoringSystem]
  );

  return {
    isInitialized,
    monitoringSystem,
    recordUserInteraction,
    executeMonitoredOperation,
    executeWasmOperation,
    executeNetworkOperation,
  };
}

/**
 * Hook for real-time health monitoring
 */
export function useHealthMonitoring() {
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [systemHealth, setSystemHealth] = useState<unknown>(null);

  useEffect(() => {
    const handleHealthAlert = (event: CustomEvent) => {
      const alert = event.detail as HealthAlert;
      setAlerts((prev) => {
        // Add new alert if not already present
        if (!prev.find((a) => a.id === alert.id)) {
          return [...prev, alert];
        }
        return prev;
      });
    };

    // Listen for health alerts
    window.addEventListener('brepflow:health-alert', handleHealthAlert as EventListener);

    // Periodic health update
    const interval = setInterval(() => {
      try {
        const system = MonitoringSystem.getInstance();
        const health = system.getMonitoringDashboard().systemHealth;
        setSystemHealth(health);

        // Update alerts list
        const activeAlerts = system.getMonitoringDashboard().activeAlerts;
        setAlerts(activeAlerts);
      } catch (error) {
        // Monitoring system not ready
      }
    }, 10000); // Update every 10 seconds

    return () => {
      window.removeEventListener('brepflow:health-alert', handleHealthAlert as EventListener);
      clearInterval(interval);
    };
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  }, []);

  return {
    alerts,
    systemHealth,
    dismissAlert,
  };
}

/**
 * Hook for error monitoring
 */
export function useErrorMonitoring() {
  const [errors, setErrors] = useState<BrepFlowError[]>([]);
  const [criticalErrors, setCriticalErrors] = useState<BrepFlowError[]>([]);

  useEffect(() => {
    let errorManager: ErrorManager;

    try {
      errorManager = ErrorManager.getInstance();
    } catch (error) {
      return; // Error manager not initialized
    }

    const handleError = (error: BrepFlowError) => {
      setErrors((prev) => {
        // Add new error if not already present
        if (!prev.find((e) => e.id === error.id)) {
          return [...prev, error].slice(-20); // Keep last 20 errors
        }
        return prev;
      });

      if (error.severity === 'critical') {
        setCriticalErrors((prev) => {
          if (!prev.find((e) => e.id === error.id)) {
            return [...prev, error].slice(-5); // Keep last 5 critical errors
          }
          return prev;
        });
      }
    };

    const handleErrorResolved = (error: BrepFlowError) => {
      setErrors((prev) =>
        prev.map((e) => (e.id === error.id ? { ...e, resolvedAt: new Date() } : e))
      );
      setCriticalErrors((prev) => prev.filter((e) => e.id !== error.id));
    };

    errorManager.on('error', handleError);
    errorManager.on('errorResolved', handleErrorResolved);
    errorManager.on('criticalError', handleError);

    // Initial load
    const activeErrors = errorManager.getActiveErrors();
    setErrors(activeErrors.slice(-20));
    setCriticalErrors(activeErrors.filter((e) => e.severity === 'critical').slice(-5));

    return () => {
      errorManager.off('error', handleError);
      errorManager.off('errorResolved', handleErrorResolved);
      errorManager.off('criticalError', handleError);
    };
  }, []);

  const resolveError = useCallback((errorId: string) => {
    try {
      const errorManager = ErrorManager.getInstance();
      errorManager.resolveError(errorId);
    } catch (error) {
      logger.warn('Failed to resolve error:', error);
    }
  }, []);

  return {
    errors,
    criticalErrors,
    resolveError,
  };
}

/**
 * Hook for performance metrics
 */
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<unknown>(null);

  useEffect(() => {
    const updateMetrics = () => {
      try {
        const metricsCollector = MetricsCollector.getInstance();
        const exportedMetrics = metricsCollector.exportMetrics();
        setMetrics(exportedMetrics);
      } catch (error) {
        // Metrics collector not ready
      }
    };

    // Initial load
    updateMetrics();

    // Update every 30 seconds
    const interval = setInterval(updateMetrics, 30000);

    return () => clearInterval(interval);
  }, []);

  const recordTiming = useCallback(
    (name: string, duration: number, labels?: Record<string, string>) => {
      try {
        const metricsCollector = MetricsCollector.getInstance();
        metricsCollector.recordTiming(name, duration, labels);
      } catch (error) {
        // Metrics collector not ready
      }
    },
    []
  );

  const incrementCounter = useCallback(
    (name: string, labels?: Record<string, string>, value?: number) => {
      try {
        const metricsCollector = MetricsCollector.getInstance();
        metricsCollector.incrementCounter(name, labels, value);
      } catch (error) {
        // Metrics collector not ready
      }
    },
    []
  );

  const setGauge = useCallback((name: string, value: number, labels?: Record<string, string>) => {
    try {
      const metricsCollector = MetricsCollector.getInstance();
      metricsCollector.setGauge(name, value, labels);
    } catch (error) {
      // Metrics collector not ready
    }
  }, []);

  return {
    metrics,
    recordTiming,
    incrementCounter,
    setGauge,
  };
}

/**
 * Hook for measuring component render time
 */
export function useRenderTiming(componentName: string) {
  const { recordTiming } = usePerformanceMetrics();

  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      recordTiming('component_render_time_ms', renderTime, {
        component: componentName,
      });
    };
  }, [componentName, recordTiming]);
}

/**
 * Hook for measuring async operation timing
 */
export function useOperationTiming() {
  const { recordTiming } = usePerformanceMetrics();

  const measureAsync = useCallback(
    async <T>(
      operation: () => Promise<T>,
      operationName: string,
      labels?: Record<string, string>
    ): Promise<T> => {
      const startTime = performance.now();

      try {
        const result = await operation();
        const endTime = performance.now();
        const duration = endTime - startTime;

        recordTiming('async_operation_duration_ms', duration, {
          operation: operationName,
          status: 'success',
          ...labels,
        });

        return result;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        recordTiming('async_operation_duration_ms', duration, {
          operation: operationName,
          status: 'error',
          ...labels,
        });

        throw error;
      }
    },
    [recordTiming]
  );

  return { measureAsync };
}
