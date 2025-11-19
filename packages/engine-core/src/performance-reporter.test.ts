/**
 * Tests for Performance Reporter
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  PerformanceReporter,
  ConsolePerformanceExporter,
  JSONPerformanceExporter,
  type PerformanceMetrics,
} from './performance-reporter';

describe('PerformanceReporter', () => {
  let reporter: PerformanceReporter;
  let mockMetrics: PerformanceMetrics;

  beforeEach(() => {
    reporter = new PerformanceReporter(1000, []);
    mockMetrics = {
      evaluationTime: 100,
      renderTime: 16,
      workerTime: 50,
      heapUsed: 100 * 1024 * 1024, // 100MB
      heapTotal: 200 * 1024 * 1024,
      wasmMemory: 50 * 1024 * 1024,
      nodeCount: 10,
      edgeCount: 15,
      dirtyNodes: 2,
      cacheHits: 80,
      cacheMisses: 20,
      shapeCount: 5,
      triangleCount: 1000,
      vertexCount: 500,
      fps: 60,
      frameTime: 16,
      drawCalls: 10,
    };
  });

  describe('metrics recording', () => {
    it('should record metrics', () => {
      reporter.recordMetrics(mockMetrics);
      const report = reporter.generateReport();

      expect(report.metrics).toEqual(mockMetrics);
    });

    it('should compute aggregates from multiple metrics', () => {
      reporter.recordMetrics(mockMetrics);
      reporter.recordMetrics({ ...mockMetrics, evaluationTime: 200 });
      reporter.recordMetrics({ ...mockMetrics, evaluationTime: 150 });

      const report = reporter.generateReport();

      expect(report.aggregates.avgEvaluationTime).toBe(150);
      expect(report.aggregates.maxEvaluationTime).toBe(200);
      expect(report.aggregates.totalCacheHits).toBe(240);
      expect(report.aggregates.totalCacheMisses).toBe(60);
      expect(report.aggregates.cacheHitRate).toBe(0.8);
    });

    it('should limit metrics history to 1000 entries', () => {
      for (let i = 0; i < 1500; i++) {
        reporter.recordMetrics(mockMetrics);
      }

      const report = reporter.generateReport();
      // Should keep only last 1000
      expect(report.aggregates.totalCacheHits).toBe(80 * 1000);
    });
  });

  describe('threshold violations', () => {
    it('should detect evaluation time violations', () => {
      reporter.recordMetrics({ ...mockMetrics, evaluationTime: 2500 });
      const report = reporter.generateReport();

      expect(report.thresholdViolations.length).toBe(1);
      expect(report.thresholdViolations[0].metric).toBe('evaluationTime');
      expect(report.thresholdViolations[0].severity).toBe('critical');
    });

    it('should detect FPS violations', () => {
      reporter.recordMetrics({ ...mockMetrics, fps: 8 });
      const report = reporter.generateReport();

      expect(report.thresholdViolations.length).toBe(1);
      expect(report.thresholdViolations[0].metric).toBe('fps');
      expect(report.thresholdViolations[0].severity).toBe('critical');
    });

    it('should detect memory violations', () => {
      reporter.recordMetrics({ ...mockMetrics, heapUsed: 2100 * 1024 * 1024 }); // 2.1GB
      const report = reporter.generateReport();

      expect(report.thresholdViolations.length).toBe(1);
      expect(report.thresholdViolations[0].metric).toBe('heapUsed');
      expect(report.thresholdViolations[0].severity).toBe('critical');
    });

    it('should detect multiple severity levels', () => {
      reporter.recordMetrics({ ...mockMetrics, evaluationTime: 600 }); // warning
      reporter.recordMetrics({ ...mockMetrics, evaluationTime: 1200 }); // error
      reporter.recordMetrics({ ...mockMetrics, evaluationTime: 2500 }); // critical

      const report = reporter.generateReport();

      expect(report.thresholdViolations.length).toBe(3);
      expect(report.thresholdViolations.map((v) => v.severity)).toContain('warning');
      expect(report.thresholdViolations.map((v) => v.severity)).toContain('error');
      expect(report.thresholdViolations.map((v) => v.severity)).toContain('critical');
    });

    it('should clear violations after export', async () => {
      reporter.recordMetrics({ ...mockMetrics, evaluationTime: 2500 });

      let report = reporter.generateReport();
      expect(report.thresholdViolations.length).toBe(1);

      await reporter.exportReport();

      report = reporter.generateReport();
      expect(report.thresholdViolations.length).toBe(0);
    });
  });

  describe('report generation', () => {
    it('should generate report with correct structure', () => {
      reporter.recordMetrics(mockMetrics);
      const report = reporter.generateReport();

      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('duration');
      expect(report).toHaveProperty('metrics');
      expect(report).toHaveProperty('aggregates');
      expect(report).toHaveProperty('thresholdViolations');
    });

    it('should handle empty metrics history', () => {
      const report = reporter.generateReport();

      expect(report.aggregates.avgEvaluationTime).toBe(0);
      expect(report.aggregates.maxEvaluationTime).toBe(0);
      expect(report.aggregates.cacheHitRate).toBe(0);
    });
  });

  describe('exporters', () => {
    it('should export report using registered exporters', async () => {
      const mockExporter = {
        export: vi.fn().mockResolvedValue(undefined),
      };

      reporter.addExporter(mockExporter);
      reporter.recordMetrics(mockMetrics);

      await reporter.exportReport();

      expect(mockExporter.export).toHaveBeenCalledTimes(1);
      expect(mockExporter.export).toHaveBeenCalledWith(
        expect.objectContaining({
          metrics: mockMetrics,
        })
      );
    });

    it('should handle exporter failures gracefully', async () => {
      const failingExporter = {
        export: vi.fn().mockRejectedValue(new Error('Export failed')),
      };

      reporter.addExporter(failingExporter);
      reporter.recordMetrics(mockMetrics);

      // Should not throw
      await expect(reporter.exportReport()).resolves.toBeUndefined();
    });
  });

  describe('auto export', () => {
    it('should export reports at regular intervals', async () => {
      vi.useFakeTimers();

      const mockExporter = {
        export: vi.fn().mockResolvedValue(undefined),
      };

      const intervalReporter = new PerformanceReporter(1000, [mockExporter]);
      intervalReporter.startAutoExport();

      intervalReporter.recordMetrics(mockMetrics);

      // Fast-forward time
      await vi.advanceTimersByTimeAsync(1000);

      expect(mockExporter.export).toHaveBeenCalled();

      intervalReporter.stopAutoExport();
      vi.useRealTimers();
    });

    it('should stop auto export', async () => {
      vi.useFakeTimers();

      const mockExporter = {
        export: vi.fn().mockResolvedValue(undefined),
      };

      const intervalReporter = new PerformanceReporter(1000, [mockExporter]);
      intervalReporter.startAutoExport();
      intervalReporter.stopAutoExport();

      // Fast-forward time
      await vi.advanceTimersByTimeAsync(2000);

      expect(mockExporter.export).not.toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('reset', () => {
    it('should clear metrics and violations', () => {
      reporter.recordMetrics(mockMetrics);
      reporter.recordMetrics({ ...mockMetrics, evaluationTime: 2500 });

      let report = reporter.generateReport();
      expect(report.thresholdViolations.length).toBeGreaterThan(0);

      reporter.reset();

      report = reporter.generateReport();
      expect(report.thresholdViolations.length).toBe(0);
      expect(report.aggregates.totalCacheHits).toBe(0);
    });
  });
});

describe('ConsolePerformanceExporter', () => {
  it('should export report to console', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
    const consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});

    const exporter = new ConsolePerformanceExporter();
    await exporter.export({
      timestamp: Date.now(),
      duration: 1000,
      metrics: {} as PerformanceMetrics,
      aggregates: {} as any,
      thresholdViolations: [],
    });

    expect(consoleGroupSpy).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    expect(consoleGroupEndSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
    consoleGroupSpy.mockRestore();
    consoleGroupEndSpy.mockRestore();
  });
});

describe('JSONPerformanceExporter', () => {
  it('should export report to endpoint', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;

    const exporter = new JSONPerformanceExporter('https://example.com/metrics');
    await exporter.export({
      timestamp: Date.now(),
      duration: 1000,
      metrics: {} as PerformanceMetrics,
      aggregates: {} as any,
      thresholdViolations: [],
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com/metrics',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('should handle fetch errors gracefully', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    global.fetch = mockFetch;
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const exporter = new JSONPerformanceExporter('https://example.com/metrics');
    await exporter.export({
      timestamp: Date.now(),
      duration: 1000,
      metrics: {} as PerformanceMetrics,
      aggregates: {} as any,
      thresholdViolations: [],
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
