import { expect, test } from '@playwright/test';
import {
  bootstrapStudio,
  clearAuditErrors,
  ensureCanvasReady,
  getAuditErrors,
} from '../utils/studio-helpers';

test.describe('Performance Benchmarks', () => {
  test.beforeEach(async ({ page }) => {
    await bootstrapStudio(page);
    await ensureCanvasReady(page, 10000);
    await clearAuditErrors(page);
  });

  test('initial load completes within 3s', async ({ page }) => {
    const metrics = await page.evaluate(() => {
      const timing = performance.getEntriesByType('navigation')[0] as
        | PerformanceNavigationTiming
        | undefined;
      if (timing) {
        return {
          domContentLoaded: timing.domContentLoadedEventEnd - timing.startTime,
          load: timing.loadEventEnd - timing.startTime,
        };
      }

      const legacy = performance.timing;
      return {
        domContentLoaded: legacy.domContentLoadedEventEnd - legacy.navigationStart,
        load: legacy.loadEventEnd - legacy.navigationStart,
      };
    });

    expect(metrics.domContentLoaded).toBeGreaterThan(0);
    expect(metrics.load).toBeGreaterThan(0);
    expect(metrics.domContentLoaded).toBeLessThan(2000);
    expect(metrics.load).toBeLessThan(3000);
  });

  test('node creation stays within interactive budget', async ({ page }) => {
    const { duration } = await page.evaluate(async () => {
      const studio = (window as any).studio;
      if (!studio?.createNode) {
        throw new Error('Studio createNode API not available');
      }

      await studio.clearGraph?.();

      const start = performance.now();
      await studio.createNode('Solid::Box', { x: 220, y: 160 });
      const end = performance.now();

      return { duration: end - start };
    });

    expect(duration).toBeLessThan(150);
    expect(await getAuditErrors(page)).toEqual([]);
  });

  test('graph evaluation completes without errors', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const studio = (window as any).studio;
      if (!studio?.evaluateGraph) {
        throw new Error('Studio evaluateGraph API not available');
      }

      await studio.clearGraph?.();
      await studio.createNode?.('Solid::Box', { x: 220, y: 160 });

      const start = performance.now();
      await studio.evaluateGraph();
      const duration = performance.now() - start;

      const errors: string[] = (window as any).__errors ?? [];
      return { duration, errors };
    });

    expect(result.duration).toBeLessThan(500);
    expect(result.errors).toEqual([]);
    expect(await getAuditErrors(page)).toEqual([]);
  });
});
