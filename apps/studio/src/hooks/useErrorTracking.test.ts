import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useErrorTracking } from './useErrorTracking';

describe('useErrorTracking', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useErrorTracking());

    expect(result.current.errors.size).toBe(0);
    expect(result.current.hasErrors).toBe(false);
    expect(result.current.errorCount).toBe(0);
  });

  describe('addError', () => {
    it('adds an error and returns an ID', () => {
      const { result } = renderHook(() => useErrorTracking());

      let errorId: string;
      act(() => {
        errorId = result.current.addError({
          message: 'Test error',
          source: 'node',
          severity: 'error',
          nodeId: 'node1',
        });
      });

      expect(errorId!).toMatch(/^error_\d+_[a-z0-9]+$/);
      expect(result.current.errors.size).toBe(1);
      expect(result.current.hasErrors).toBe(true);
      expect(result.current.errorCount).toBe(1);

      const addedError = result.current.errors.get(errorId!);
      expect(addedError).toEqual({
        id: errorId,
        message: 'Test error',
        source: 'node',
        severity: 'error',
        nodeId: 'node1',
        timestamp: expect.any(Date),
      });
    });

    it('generates unique IDs for each error', () => {
      const { result } = renderHook(() => useErrorTracking());

      let id1: string, id2: string;
      act(() => {
        id1 = result.current.addError({
          message: 'Error 1',
          source: 'system',
          severity: 'error',
        });
        id2 = result.current.addError({
          message: 'Error 2',
          source: 'user',
          severity: 'warning',
        });
      });

      expect(id1).not.toBe(id2);
      expect(result.current.errors.size).toBe(2);
    });

    it('adds errors with different sources and severities', () => {
      const { result } = renderHook(() => useErrorTracking());

      const testCases = [
        { source: 'node' as const, severity: 'error' as const },
        { source: 'evaluation' as const, severity: 'warning' as const },
        { source: 'system' as const, severity: 'info' as const },
        { source: 'user' as const, severity: 'error' as const },
      ];

      act(() => {
        testCases.forEach((testCase, index) => {
          result.current.addError({
            message: `Test message ${index}`,
            source: testCase.source,
            severity: testCase.severity,
          });
        });
      });

      expect(result.current.errors.size).toBe(4);

      const errors = Array.from(result.current.errors.values());
      testCases.forEach((testCase, index) => {
        const error = errors.find((e) => e.message === `Test message ${index}`);
        expect(error?.source).toBe(testCase.source);
        expect(error?.severity).toBe(testCase.severity);
      });
    });

    it('includes optional details and nodeId', () => {
      const { result } = renderHook(() => useErrorTracking());

      let errorId: string;
      act(() => {
        errorId = result.current.addError({
          message: 'Detailed error',
          source: 'evaluation',
          severity: 'error',
          nodeId: 'specific-node',
          details: { stack: 'Error stack trace', code: 500 },
        });
      });

      const error = result.current.errors.get(errorId!);
      expect(error?.nodeId).toBe('specific-node');
      expect(error?.details).toEqual({ stack: 'Error stack trace', code: 500 });
    });

    it('auto-removes warnings after 10 seconds', () => {
      const { result } = renderHook(() => useErrorTracking());

      let warningId: string;
      act(() => {
        warningId = result.current.addError({
          message: 'Warning message',
          source: 'system',
          severity: 'warning',
        });
      });

      expect(result.current.errors.has(warningId!)).toBe(true);

      // Fast-forward 10 seconds
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(result.current.errors.has(warningId!)).toBe(false);
      expect(result.current.errors.size).toBe(0);
    });

    it('auto-removes info messages after 10 seconds', () => {
      const { result } = renderHook(() => useErrorTracking());

      let infoId: string;
      act(() => {
        infoId = result.current.addError({
          message: 'Info message',
          source: 'user',
          severity: 'info',
        });
      });

      expect(result.current.errors.has(infoId!)).toBe(true);

      // Fast-forward 10 seconds
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(result.current.errors.has(infoId!)).toBe(false);
    });

    it('does not auto-remove errors', () => {
      const { result } = renderHook(() => useErrorTracking());

      let errorId: string;
      act(() => {
        errorId = result.current.addError({
          message: 'Persistent error',
          source: 'node',
          severity: 'error',
        });
      });

      expect(result.current.errors.has(errorId!)).toBe(true);

      // Fast-forward 15 seconds (more than auto-remove time)
      act(() => {
        vi.advanceTimersByTime(15000);
      });

      // Error should still be there
      expect(result.current.errors.has(errorId!)).toBe(true);
      expect(result.current.errors.size).toBe(1);
    });

    it('handles multiple auto-remove timers correctly', () => {
      const { result } = renderHook(() => useErrorTracking());

      let warningId: string, infoId: string, errorId: string;
      act(() => {
        warningId = result.current.addError({
          message: 'Warning',
          source: 'system',
          severity: 'warning',
        });
        infoId = result.current.addError({
          message: 'Info',
          source: 'user',
          severity: 'info',
        });
        errorId = result.current.addError({
          message: 'Error',
          source: 'node',
          severity: 'error',
        });
      });

      expect(result.current.errors.size).toBe(3);

      // Fast-forward 10 seconds
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      // Only error should remain
      expect(result.current.errors.has(warningId!)).toBe(false);
      expect(result.current.errors.has(infoId!)).toBe(false);
      expect(result.current.errors.has(errorId!)).toBe(true);
      expect(result.current.errors.size).toBe(1);
    });
  });

  describe('removeError', () => {
    it('removes a specific error by ID', () => {
      const { result } = renderHook(() => useErrorTracking());

      let errorId1: string, errorId2: string;
      act(() => {
        errorId1 = result.current.addError({
          message: 'Error 1',
          source: 'node',
          severity: 'error',
        });
        errorId2 = result.current.addError({
          message: 'Error 2',
          source: 'system',
          severity: 'warning',
        });
      });

      expect(result.current.errors.size).toBe(2);

      act(() => {
        result.current.removeError(errorId1!);
      });

      expect(result.current.errors.size).toBe(1);
      expect(result.current.errors.has(errorId1!)).toBe(false);
      expect(result.current.errors.has(errorId2!)).toBe(true);
    });

    it('handles removing non-existent error gracefully', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        result.current.addError({
          message: 'Test error',
          source: 'node',
          severity: 'error',
        });
      });

      expect(result.current.errors.size).toBe(1);

      // Try to remove non-existent error
      act(() => {
        result.current.removeError('non-existent-id');
      });

      // Should not affect existing errors
      expect(result.current.errors.size).toBe(1);
    });

    it('cancels auto-removal when manually removed', () => {
      const { result } = renderHook(() => useErrorTracking());

      let warningId: string;
      act(() => {
        warningId = result.current.addError({
          message: 'Warning to remove',
          source: 'system',
          severity: 'warning',
        });
      });

      // Manually remove before auto-removal
      act(() => {
        result.current.removeError(warningId!);
      });

      expect(result.current.errors.has(warningId!)).toBe(false);

      // Fast-forward past auto-removal time
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      // Should remain removed (no issues with the timer)
      expect(result.current.errors.has(warningId!)).toBe(false);
      expect(result.current.errors.size).toBe(0);
    });
  });

  describe('clearErrors', () => {
    it('removes all errors', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        result.current.addError({
          message: 'Error 1',
          source: 'node',
          severity: 'error',
        });
        result.current.addError({
          message: 'Warning 1',
          source: 'system',
          severity: 'warning',
        });
        result.current.addError({
          message: 'Info 1',
          source: 'user',
          severity: 'info',
        });
      });

      expect(result.current.errors.size).toBe(3);
      expect(result.current.hasErrors).toBe(true);

      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.errors.size).toBe(0);
      expect(result.current.hasErrors).toBe(false);
      expect(result.current.errorCount).toBe(0);
    });

    it('clears errors even with pending auto-removal timers', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        result.current.addError({
          message: 'Warning with timer',
          source: 'system',
          severity: 'warning',
        });
      });

      expect(result.current.errors.size).toBe(1);

      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.errors.size).toBe(0);

      // Fast-forward past auto-removal time to ensure no issues
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(result.current.errors.size).toBe(0);
    });
  });

  describe('getErrorsForNode', () => {
    it('returns errors for a specific node', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        result.current.addError({
          message: 'Node 1 Error 1',
          source: 'node',
          severity: 'error',
          nodeId: 'node1',
        });
        result.current.addError({
          message: 'Node 1 Error 2',
          source: 'evaluation',
          severity: 'warning',
          nodeId: 'node1',
        });
        result.current.addError({
          message: 'Node 2 Error',
          source: 'node',
          severity: 'error',
          nodeId: 'node2',
        });
        result.current.addError({
          message: 'System Error',
          source: 'system',
          severity: 'error',
          // No nodeId
        });
      });

      const node1Errors = result.current.getErrorsForNode('node1');
      const node2Errors = result.current.getErrorsForNode('node2');
      const node3Errors = result.current.getErrorsForNode('node3');

      expect(node1Errors).toHaveLength(2);
      expect(node1Errors[0].message).toBe('Node 1 Error 1');
      expect(node1Errors[1].message).toBe('Node 1 Error 2');

      expect(node2Errors).toHaveLength(1);
      expect(node2Errors[0].message).toBe('Node 2 Error');

      expect(node3Errors).toHaveLength(0);
    });

    it('returns empty array for node with no errors', () => {
      const { result } = renderHook(() => useErrorTracking());

      const nodeErrors = result.current.getErrorsForNode('non-existent-node');
      expect(nodeErrors).toHaveLength(0);
      expect(Array.isArray(nodeErrors)).toBe(true);
    });

    it('updates when errors are added or removed', () => {
      const { result } = renderHook(() => useErrorTracking());

      let errorId: string;
      act(() => {
        errorId = result.current.addError({
          message: 'Node error',
          source: 'node',
          severity: 'error',
          nodeId: 'test-node',
        });
      });

      expect(result.current.getErrorsForNode('test-node')).toHaveLength(1);

      act(() => {
        result.current.removeError(errorId!);
      });

      expect(result.current.getErrorsForNode('test-node')).toHaveLength(0);
    });
  });

  describe('computed properties', () => {
    it('hasErrors reflects current state', () => {
      const { result } = renderHook(() => useErrorTracking());

      expect(result.current.hasErrors).toBe(false);

      let errorId: string;
      act(() => {
        errorId = result.current.addError({
          message: 'Test error',
          source: 'node',
          severity: 'error',
        });
      });

      expect(result.current.hasErrors).toBe(true);

      act(() => {
        result.current.removeError(errorId!);
      });

      expect(result.current.hasErrors).toBe(false);
    });

    it('errorCount reflects current state', () => {
      const { result } = renderHook(() => useErrorTracking());

      expect(result.current.errorCount).toBe(0);

      act(() => {
        result.current.addError({
          message: 'Error 1',
          source: 'node',
          severity: 'error',
        });
        result.current.addError({
          message: 'Error 2',
          source: 'system',
          severity: 'warning',
        });
      });

      expect(result.current.errorCount).toBe(2);

      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.errorCount).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('handles empty message', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        result.current.addError({
          message: '',
          source: 'system',
          severity: 'info',
        });
      });

      expect(result.current.errors.size).toBe(1);
      const error = Array.from(result.current.errors.values())[0];
      expect(error.message).toBe('');
    });

    it('handles special characters in message', () => {
      const { result } = renderHook(() => useErrorTracking());

      const specialMessage = 'Error with symbols: !@#$%^&*()_+{}|:"<>?[]\\;\',./ 中文 🚀';
      act(() => {
        result.current.addError({
          message: specialMessage,
          source: 'user',
          severity: 'error',
        });
      });

      const error = Array.from(result.current.errors.values())[0];
      expect(error.message).toBe(specialMessage);
    });

    it('handles complex details object', () => {
      const { result } = renderHook(() => useErrorTracking());

      const complexDetails = {
        nested: { object: { with: 'data' } },
        array: [1, 2, 3],
        null_value: null,
        undefined_value: undefined,
        boolean: true,
        number: 42,
      };

      act(() => {
        result.current.addError({
          message: 'Complex error',
          source: 'evaluation',
          severity: 'error',
          details: complexDetails,
        });
      });

      const error = Array.from(result.current.errors.values())[0];
      expect(error.details).toEqual(complexDetails);
    });
  });
});
