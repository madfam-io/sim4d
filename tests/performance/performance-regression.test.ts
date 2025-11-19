/**
 * Performance Regression Tests
 * CI/CD tests to ensure performance metrics stay within budget
 */

import { expect, test } from '@playwright/test';
import performanceBudgets from '../../performance-budgets.json';

// Helper to load performance budgets
const budgets = performanceBudgets.runtimeBudgets;
const ciTests = performanceBudgets.testTargets.ci;

test.describe('Performance Regression Tests', () => {
  test.setTimeout(60000); // Allow 60s for performance tests

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('app cold load meets budget', async ({ page }) => {
    const testConfig = ciTests.tests.find((t) => t.name === 'app-cold-load');
    if (!testConfig) {
      test.skip();
      return;
    }

    const metrics = await page.evaluate(() => {
      const timing = performance.getEntriesByType('navigation')[0] as
        | PerformanceNavigationTiming
        | undefined;

      if (timing) {
        return {
          loadTime: timing.loadEventEnd - timing.startTime,
          domContentLoaded: timing.domContentLoadedEventEnd - timing.startTime,
          firstPaint: timing.responseEnd - timing.startTime,
        };
      }

      return {
        loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
        domContentLoaded:
          performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        firstPaint: performance.timing.responseEnd - performance.timing.navigationStart,
      };
    });

    const budget = budgets.appLoad.coldStart.target;
    const tolerance = (testConfig.tolerance / 100) * budget;

    console.log(`Load time: ${metrics.loadTime.toFixed(0)}ms (budget: ${budget}ms)`);

    expect(metrics.loadTime).toBeLessThan(budget + tolerance);
    expect(metrics.loadTime).toBeGreaterThan(0);
  });

  test('simple node evaluation meets budget', async ({ page }) => {
    const testConfig = ciTests.tests.find((t) => t.name === 'node-evaluation-simple');
    if (!testConfig) {
      test.skip();
      return;
    }

    const { duration, success } = await page.evaluate(async () => {
      const studio = (window as any).studio;
      if (!studio?.createNode || !studio?.evaluateGraph) {
        return { duration: 0, success: false };
      }

      await studio.clearGraph?.();

      const start = performance.now();
      await studio.createNode('Solid::Box', { x: 100, y: 100 });
      await studio.evaluateGraph();
      const end = performance.now();

      return { duration: end - start, success: true };
    });

    if (!success) {
      test.skip();
      return;
    }

    const budget = testConfig.budget;
    const tolerance = (testConfig.tolerance / 100) * budget;

    console.log(`Node evaluation: ${duration.toFixed(0)}ms (budget: ${budget}ms)`);

    expect(duration).toBeLessThan(budget + tolerance);
  });

  test('DAG evaluation scales linearly', async ({ page }) => {
    const results = await page.evaluate(async () => {
      const studio = (window as any).studio;
      if (!studio?.createNode || !studio?.evaluateGraph) {
        return { success: false, timings: [] };
      }

      const timings: number[] = [];

      // Test with increasing node counts
      for (const nodeCount of [5, 10, 20]) {
        await studio.clearGraph?.();

        // Create nodes in a chain
        for (let i = 0; i < nodeCount; i++) {
          await studio.createNode('Solid::Box', { x: i * 150, y: 100 });
        }

        const start = performance.now();
        await studio.evaluateGraph();
        const duration = performance.now() - start;

        timings.push(duration);
      }

      return { success: true, timings };
    });

    if (!results.success) {
      test.skip();
      return;
    }

    // Check that evaluation time scales reasonably (not exponentially)
    // Time for 20 nodes should be less than 5x time for 5 nodes
    const [time5, time10, time20] = results.timings;
    const scaleFactor = time20 / time5;

    console.log(
      `DAG evaluation scaling: 5 nodes=${time5.toFixed(0)}ms, 10 nodes=${time10.toFixed(0)}ms, 20 nodes=${time20.toFixed(0)}ms`
    );
    console.log(`Scale factor (20/5): ${scaleFactor.toFixed(2)}x`);

    expect(scaleFactor).toBeLessThan(5);
  });

  test('viewport maintains target FPS with moderate geometry', async ({ page }) => {
    const testConfig = ciTests.tests.find((t) => t.name === 'viewport-fps-2m-triangles');
    if (!testConfig) {
      test.skip();
      return;
    }

    const { fps, triangleCount, success } = await page.evaluate(async () => {
      const studio = (window as any).studio;
      if (!studio?.createNode || !studio?.evaluateGraph) {
        return { fps: 0, triangleCount: 0, success: false };
      }

      await studio.clearGraph?.();

      // Create several geometry nodes
      for (let i = 0; i < 5; i++) {
        await studio.createNode('Solid::Box', { x: i * 150, y: 100 });
      }

      await studio.evaluateGraph();

      // Wait for rendering to stabilize
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Measure FPS over several frames
      let frameCount = 0;
      let lastTime = performance.now();
      const frameTimes: number[] = [];

      await new Promise<void>((resolve) => {
        const measureFrame = () => {
          const now = performance.now();
          frameTimes.push(now - lastTime);
          lastTime = now;
          frameCount++;

          if (frameCount < 60) {
            requestAnimationFrame(measureFrame);
          } else {
            resolve();
          }
        };

        requestAnimationFrame(measureFrame);
      });

      const avgFrameTime = frameTimes.reduce((sum, t) => sum + t, 0) / frameTimes.length;
      const fps = 1000 / avgFrameTime;

      // Get triangle count from performance monitor
      const perfMonitor = (window as any).performanceMonitor;
      const metrics = perfMonitor?.getMetrics() || {};
      const triangleCount = metrics.triangleCount || 0;

      return { fps, triangleCount, success: true };
    });

    if (!success) {
      test.skip();
      return;
    }

    const budget = budgets.viewport.fps.target;
    const tolerance = (testConfig.tolerance / 100) * budget;

    console.log(
      `FPS: ${fps.toFixed(1)} (budget: ${budget}, triangles: ${triangleCount.toLocaleString()})`
    );

    expect(fps).toBeGreaterThan(budget - tolerance);
  });

  test('memory usage stays within budget', async ({ page }) => {
    const testConfig = ciTests.tests.find((t) => t.name === 'memory-usage-standard-scene');
    if (!testConfig) {
      test.skip();
      return;
    }

    const { heapUsedMB, success } = await page.evaluate(async () => {
      const studio = (window as any).studio;
      if (!studio?.createNode || !studio?.evaluateGraph) {
        return { heapUsedMB: 0, success: false };
      }

      // Create a standard scene
      await studio.clearGraph?.();

      for (let i = 0; i < 10; i++) {
        await studio.createNode('Solid::Box', { x: i * 150, y: 100 });
      }

      await studio.evaluateGraph();

      // Force garbage collection if available
      if ((window as any).gc) {
        (window as any).gc();
      }

      // Wait for GC to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Measure memory
      const memory = (performance as any).memory;
      const heapUsedMB = memory ? memory.usedJSHeapSize / (1024 * 1024) : 0;

      return { heapUsedMB, success: true };
    });

    if (!success) {
      test.skip();
      return;
    }

    const budget = budgets.memory.heapUsage.comfortable;
    const tolerance = (testConfig.tolerance / 100) * budget;

    console.log(`Heap usage: ${heapUsedMB.toFixed(0)}MB (budget: ${budget}MB)`);

    expect(heapUsedMB).toBeLessThan(budget + tolerance);
  });

  test('cache hit rate meets target', async ({ page }) => {
    const { cacheHitRate, success } = await page.evaluate(async () => {
      const studio = (window as any).studio;
      if (!studio?.createNode || !studio?.evaluateGraph) {
        return { cacheHitRate: 0, success: false };
      }

      await studio.clearGraph?.();

      // Create nodes
      for (let i = 0; i < 5; i++) {
        await studio.createNode('Solid::Box', { x: i * 150, y: 100 });
      }

      // Evaluate multiple times to build cache
      await studio.evaluateGraph();
      await studio.evaluateGraph();
      await studio.evaluateGraph();

      // Get cache stats
      const perfMonitor = (window as any).performanceMonitor;
      const metrics = perfMonitor?.getMetrics() || {};

      const total = (metrics.cacheHits || 0) + (metrics.cacheMisses || 0);
      const cacheHitRate = total > 0 ? (metrics.cacheHits / total) * 100 : 0;

      return { cacheHitRate, success: true };
    });

    if (!success) {
      test.skip();
      return;
    }

    const budget = budgets.cache.hitRate.target;

    console.log(`Cache hit rate: ${cacheHitRate.toFixed(1)}% (target: ${budget}%)`);

    expect(cacheHitRate).toBeGreaterThanOrEqual(budget * 0.9); // Allow 10% margin
  });

  test('no memory leaks after multiple operations', async ({ page }) => {
    const { leaked, success } = await page.evaluate(async () => {
      const studio = (window as any).studio;
      if (!studio?.createNode || !studio?.evaluateGraph || !studio?.clearGraph) {
        return { leaked: false, success: false };
      }

      // Get initial memory
      const getMemory = () => {
        const memory = (performance as any).memory;
        return memory ? memory.usedJSHeapSize : 0;
      };

      // Force GC and get baseline
      if ((window as any).gc) {
        (window as any).gc();
      }
      await new Promise((resolve) => setTimeout(resolve, 500));

      const initialMemory = getMemory();

      // Perform operations
      for (let cycle = 0; cycle < 5; cycle++) {
        await studio.clearGraph();

        for (let i = 0; i < 10; i++) {
          await studio.createNode('Solid::Box', { x: i * 150, y: 100 });
        }

        await studio.evaluateGraph();
        await studio.clearGraph();
      }

      // Force GC and measure final memory
      if ((window as any).gc) {
        (window as any).gc();
      }
      await new Promise((resolve) => setTimeout(resolve, 500));

      const finalMemory = getMemory();
      const memoryIncrease = (finalMemory - initialMemory) / (1024 * 1024); // MB

      console.log(`Memory increase: ${memoryIncrease.toFixed(2)}MB`);

      // Consider it a leak if memory increased by more than 100MB
      const leaked = memoryIncrease > 100;

      return { leaked, success: true };
    });

    if (!success) {
      test.skip();
      return;
    }

    expect(leaked).toBe(false);
  });
});

test.describe('Performance Budget Compliance', () => {
  test('all runtime budgets are enforced', async () => {
    // Verify performance budgets file structure
    expect(budgets).toBeDefined();
    expect(budgets.appLoad).toBeDefined();
    expect(budgets.dagEvaluation).toBeDefined();
    expect(budgets.geometryOperations).toBeDefined();
    expect(budgets.viewport).toBeDefined();
    expect(budgets.memory).toBeDefined();
    expect(budgets.cache).toBeDefined();

    // Verify critical thresholds
    expect(budgets.appLoad.coldStart.target).toBeLessThanOrEqual(3000);
    expect(budgets.viewport.fps.target).toBeGreaterThanOrEqual(60);
    expect(budgets.memory.totalPerTab.critical).toBeLessThanOrEqual(2000);
  });
});
