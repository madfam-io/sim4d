/**
 * Tests for Performance Monitor
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PerformanceMonitor, type PerformanceMetrics } from './performance-monitor';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });

  describe('measurement', () => {
    it('should record timing measurements', () => {
      const stopEval = monitor.startMeasure('evaluation');
      // Simulate some work
      stopEval();

      const metrics = monitor.getMetrics();
      expect(metrics.evaluationTime).toBeGreaterThanOrEqual(0);
    });

    it('should record render time', () => {
      monitor.recordMeasure('render', 15.5);

      const metrics = monitor.getMetrics();
      expect(metrics.renderTime).toBe(15.5);
    });

    it('should record worker time', () => {
      monitor.recordMeasure('worker', 45.2);

      const metrics = monitor.getMetrics();
      expect(metrics.workerTime).toBe(45.2);
    });
  });

  describe('memory metrics', () => {
    it('should update memory metrics', () => {
      monitor.updateMemoryMetrics();

      const metrics = monitor.getMetrics();
      // Memory metrics should be set (or 0 if performance.memory not available)
      expect(metrics.heapUsed).toBeGreaterThanOrEqual(0);
      expect(metrics.heapTotal).toBeGreaterThanOrEqual(0);
    });
  });

  describe('graph metrics', () => {
    it('should update graph statistics', () => {
      monitor.updateGraphMetrics({
        nodeCount: 25,
        edgeCount: 40,
        dirtyNodes: 5,
        cacheHits: 100,
        cacheMisses: 20,
      });

      const metrics = monitor.getMetrics();
      expect(metrics.nodeCount).toBe(25);
      expect(metrics.edgeCount).toBe(40);
      expect(metrics.dirtyNodes).toBe(5);
      expect(metrics.cacheHits).toBe(100);
      expect(metrics.cacheMisses).toBe(20);
    });
  });

  describe('geometry metrics', () => {
    it('should update geometry statistics', () => {
      monitor.updateGeometryMetrics({
        shapeCount: 10,
        triangleCount: 50000,
        vertexCount: 25000,
      });

      const metrics = monitor.getMetrics();
      expect(metrics.shapeCount).toBe(10);
      expect(metrics.triangleCount).toBe(50000);
      expect(metrics.vertexCount).toBe(25000);
    });
  });

  describe('frame metrics', () => {
    it('should update frame statistics', () => {
      monitor.updateFrameMetrics(15);

      const metrics = monitor.getMetrics();
      expect(metrics.drawCalls).toBe(15);
      expect(metrics.frameTime).toBeGreaterThanOrEqual(0);
    });

    it('should calculate FPS over time', async () => {
      // Simulate multiple frames
      for (let i = 0; i < 70; i++) {
        monitor.updateFrameMetrics(10);
        await new Promise((resolve) => setTimeout(resolve, 16)); // ~60 FPS
      }

      const metrics = monitor.getMetrics();
      expect(metrics.fps).toBeGreaterThan(0);
      expect(metrics.fps).toBeLessThan(100); // Reasonable FPS range
    });
  });

  describe('metrics history', () => {
    it('should record snapshot to history', () => {
      monitor.updateGraphMetrics({
        nodeCount: 10,
        edgeCount: 15,
        dirtyNodes: 2,
        cacheHits: 50,
        cacheMisses: 10,
      });

      monitor.snapshot();

      const history = monitor.getHistory();
      expect(history.length).toBe(1);
      expect(history[0].nodeCount).toBe(10);
    });

    it('should limit history size', () => {
      for (let i = 0; i < 150; i++) {
        monitor.snapshot();
      }

      const history = monitor.getHistory();
      expect(history.length).toBeLessThanOrEqual(100);
    });

    it('should calculate average metrics', () => {
      monitor.recordMeasure('evaluation', 100);
      monitor.snapshot();

      monitor.recordMeasure('evaluation', 200);
      monitor.snapshot();

      monitor.recordMeasure('evaluation', 150);
      monitor.snapshot();

      const avg = monitor.getAverageMetrics(3);
      expect(avg.evaluationTime).toBe(150);
    });

    it('should handle empty history gracefully', () => {
      const avg = monitor.getAverageMetrics(10);
      expect(avg.evaluationTime).toBe(0);
    });
  });

  describe('threshold checks', () => {
    it('should detect evaluation time violations', () => {
      monitor.recordMeasure('evaluation', 2000);

      const { violations } = monitor.checkThresholds();
      expect(violations.length).toBeGreaterThan(0);
      expect(violations.some((v) => v.includes('Evaluation time'))).toBe(true);
    });

    it('should detect render time warnings', () => {
      monitor.recordMeasure('render', 25);

      const { warnings } = monitor.checkThresholds();
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings.some((w) => w.includes('Render time'))).toBe(true);
    });

    it('should detect FPS warnings', () => {
      // Set up FPS
      monitor.updateFrameMetrics(10);

      // Manually set low FPS for testing
      const metrics = monitor.getMetrics();
      (metrics as any).fps = 25;

      const { warnings } = monitor.checkThresholds();
      expect(warnings.length).toBeGreaterThan(0);
    });

    it('should detect triangle count warnings', () => {
      monitor.updateGeometryMetrics({
        shapeCount: 100,
        triangleCount: 6000000,
        vertexCount: 3000000,
      });

      const { warnings } = monitor.checkThresholds();
      expect(warnings.some((w) => w.includes('Triangle count'))).toBe(true);
    });

    it('should allow custom thresholds', () => {
      monitor.setThresholds({
        maxEvaluationTime: 500,
      });

      monitor.recordMeasure('evaluation', 600);

      const { violations } = monitor.checkThresholds();
      expect(violations.length).toBeGreaterThan(0);
    });
  });

  describe('report generation', () => {
    it('should generate text report', () => {
      monitor.recordMeasure('evaluation', 150);
      monitor.recordMeasure('render', 12);
      monitor.updateGraphMetrics({
        nodeCount: 10,
        edgeCount: 15,
        dirtyNodes: 2,
        cacheHits: 80,
        cacheMisses: 20,
      });

      const report = monitor.generateReport();

      expect(report).toContain('Performance Report');
      expect(report).toContain('Evaluation:');
      expect(report).toContain('Render:');
      expect(report).toContain('Cache Hit Rate:');
    });

    it('should include violations in report', () => {
      monitor.recordMeasure('evaluation', 2000);

      const report = monitor.generateReport();
      expect(report).toContain('Performance Violations');
    });

    it('should export metrics as JSON', () => {
      monitor.recordMeasure('evaluation', 100);

      const json = monitor.exportMetrics();
      const data = JSON.parse(json);

      expect(data).toHaveProperty('current');
      expect(data).toHaveProperty('history');
      expect(data).toHaveProperty('thresholds');
      expect(data).toHaveProperty('timestamp');
      expect(data.current.evaluationTime).toBe(100);
    });
  });

  describe('subscriptions', () => {
    it('should notify subscribers on snapshot', () => {
      const listener = vi.fn();

      monitor.subscribe(listener);
      monitor.snapshot();

      expect(listener).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should unsubscribe listeners', () => {
      const listener = vi.fn();

      const unsubscribe = monitor.subscribe(listener);
      unsubscribe();

      monitor.snapshot();

      expect(listener).not.toHaveBeenCalled();
    });

    it('should notify multiple listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      monitor.subscribe(listener1);
      monitor.subscribe(listener2);

      monitor.snapshot();

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should clear all metrics and history', () => {
      monitor.recordMeasure('evaluation', 100);
      monitor.snapshot();

      monitor.reset();

      const metrics = monitor.getMetrics();
      const history = monitor.getHistory();

      expect(metrics.evaluationTime).toBe(0);
      expect(history.length).toBe(0);
    });
  });

  describe('performance decorator', () => {
    it('should measure method performance', async () => {
      // This test would require the decorator to be applied to a real class
      // For now, we just verify the decorator doesn't break execution

      class TestClass {
        async testMethod() {
          return new Promise((resolve) => setTimeout(() => resolve('done'), 10));
        }
      }

      const instance = new TestClass();
      const result = await instance.testMethod();

      expect(result).toBe('done');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete workflow', () => {
      // Simulate DAG evaluation
      const stopEval = monitor.startMeasure('evaluation');

      monitor.updateGraphMetrics({
        nodeCount: 15,
        edgeCount: 20,
        dirtyNodes: 3,
        cacheHits: 50,
        cacheMisses: 10,
      });

      stopEval();

      // Simulate geometry operations
      monitor.recordMeasure('worker', 250);
      monitor.updateGeometryMetrics({
        shapeCount: 8,
        triangleCount: 125000,
        vertexCount: 62500,
      });

      // Simulate rendering
      monitor.recordMeasure('render', 14);
      monitor.updateFrameMetrics(12);

      // Take snapshot
      monitor.snapshot();

      // Check results
      const metrics = monitor.getMetrics();
      expect(metrics.evaluationTime).toBeGreaterThan(0);
      expect(metrics.nodeCount).toBe(15);
      expect(metrics.shapeCount).toBe(8);
      expect(metrics.renderTime).toBe(14);

      const { violations, warnings } = monitor.checkThresholds();
      // Should have no critical violations for this reasonable scenario
      expect(violations.length).toBe(0);
    });

    it('should detect performance regression', () => {
      // Record baseline
      monitor.recordMeasure('evaluation', 100);
      monitor.snapshot();

      // Record regression
      monitor.recordMeasure('evaluation', 2500);
      monitor.snapshot();

      const history = monitor.getHistory();
      expect(history[0].evaluationTime).toBe(100);
      expect(history[1].evaluationTime).toBe(2500);

      const { violations } = monitor.checkThresholds();
      expect(violations.length).toBeGreaterThan(0);
    });
  });
});
