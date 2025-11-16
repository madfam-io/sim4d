import { useState, useCallback } from 'react';

export interface ErrorInfo {
  id: string;
  message: string;
  timestamp: Date;
  source: 'node' | 'evaluation' | 'system' | 'user';
  nodeId?: string;
  severity: 'error' | 'warning' | 'info';
  details?: any;
}

export interface ErrorTracker {
  errors: Map<string, ErrorInfo>;
  addError: (error: Omit<ErrorInfo, 'id' | 'timestamp'>) => string;
  removeError: (id: string) => void;
  clearErrors: () => void;
  getErrorsForNode: (nodeId: string) => ErrorInfo[];
  hasErrors: boolean;
  errorCount: number;
}

export function useErrorTracking(): ErrorTracker {
  const [errors, setErrors] = useState<Map<string, ErrorInfo>>(new Map());

  const addError = useCallback((errorData: Omit<ErrorInfo, 'id' | 'timestamp'>): string => {
    const id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const error: ErrorInfo = {
      ...errorData,
      id,
      timestamp: new Date(),
    };

    setErrors((prev) => new Map(prev.set(id, error)));

    // Auto-remove warnings and info after 10 seconds
    if (error.severity !== 'error') {
      setTimeout(() => {
        setErrors((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
      }, 10000);
    }

    return id;
  }, []);

  const removeError = useCallback((id: string) => {
    setErrors((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors(new Map());
  }, []);

  const getErrorsForNode = useCallback(
    (nodeId: string): ErrorInfo[] => {
      return Array.from(errors.values()).filter((error) => error.nodeId === nodeId);
    },
    [errors]
  );

  return {
    errors,
    addError,
    removeError,
    clearErrors,
    getErrorsForNode,
    hasErrors: errors.size > 0,
    errorCount: errors.size,
  };
}
