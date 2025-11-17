import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Performance Test: Viewport FPS (Frames Per Second)
 * Target: ≥ 60 FPS for scenes with ≤ 2M triangles
 *
 * Measures rendering performance under various loads
 */

const FPS_TARGET = 60;
const FPS_MINIMUM = 50; // Absolute minimum acceptable
const FPS_WARNING = 55; // Warning threshold

interface FPSMeasurement {
  averageFPS: number;
  minFPS: number;
  maxFPS: number;
  frameCount: number;
  duration: number;
  triangleCount: number;
}

test.describe('Viewport FPS Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('[data-testid="viewport"]', { timeout: 10000 });
  });

  test('viewport FPS with empty scene', async ({ page }) => {
    const fps = await measureViewportFPS(page, 5000, 0);

    console.log(`\n🎨 Empty Scene FPS:`);
    console.log(`   Average: ${fps.averageFPS.toFixed(1)} FPS`);
    console.log(`   Min: ${fps.minFPS.toFixed(1)} FPS`);
    console.log(`   Max: ${fps.maxFPS.toFixed(1)} FPS`);
    console.log(`   Target: ${FPS_TARGET} FPS`);

    await storeMetric('viewport_fps_empty', fps.averageFPS);

    // Empty scene should easily hit 60 FPS
    expect(fps.averageFPS).toBeGreaterThanOrEqual(FPS_TARGET);
  });

  test('viewport FPS with simple geometry (1K triangles)', async ({ page }) => {
    // Create simple box geometry
    await page.evaluate(() => {
      const event = new CustomEvent('test:create-box', {
        detail: { width: 10, height: 10, depth: 10 },
      });
      window.dispatchEvent(event);
    });

    // Wait for geometry to load
    await page.waitForTimeout(1000);

    const fps = await measureViewportFPS(page, 5000, 1000);

    console.log(`\n🎨 Simple Geometry FPS (1K triangles):`);
    console.log(`   Average: ${fps.averageFPS.toFixed(1)} FPS`);
    console.log(`   Min: ${fps.minFPS.toFixed(1)} FPS`);
    console.log(`   Target: ${FPS_TARGET} FPS`);

    await storeMetric('viewport_fps_1k', fps.averageFPS);

    expect(fps.averageFPS).toBeGreaterThanOrEqual(FPS_TARGET);
  });

  test('viewport FPS with moderate geometry (100K triangles)', async ({ page }) => {
    // Load moderate complexity model
    await page.evaluate(() => {
      const event = new CustomEvent('test:load-model', {
        detail: { complexity: 'moderate', triangles: 100000 },
      });
      window.dispatchEvent(event);
    });

    await page.waitForTimeout(2000);

    const fps = await measureViewportFPS(page, 5000, 100000);

    console.log(`\n🎨 Moderate Geometry FPS (100K triangles):`);
    console.log(`   Average: ${fps.averageFPS.toFixed(1)} FPS`);
    console.log(`   Min: ${fps.minFPS.toFixed(1)} FPS`);
    console.log(
      `   Status: ${fps.averageFPS >= FPS_TARGET ? '✅' : fps.averageFPS >= FPS_MINIMUM ? '⚠️' : '❌'}`
    );

    await storeMetric('viewport_fps_100k', fps.averageFPS);

    expect(fps.averageFPS).toBeGreaterThanOrEqual(FPS_MINIMUM);

    if (fps.averageFPS < FPS_WARNING) {
      console.warn(
        `⚠️  Warning: FPS ${fps.averageFPS.toFixed(1)} below warning threshold ${FPS_WARNING}`
      );
    }
  });

  test('viewport FPS at target load (2M triangles)', async ({ page }) => {
    // Load target complexity model
    await page.evaluate(() => {
      const event = new CustomEvent('test:load-model', {
        detail: { complexity: 'high', triangles: 2000000 },
      });
      window.dispatchEvent(event);
    });

    await page.waitForTimeout(3000);

    const fps = await measureViewportFPS(page, 10000, 2000000);

    console.log(`\n🎨 Target Load FPS (2M triangles):`);
    console.log(`   Average: ${fps.averageFPS.toFixed(1)} FPS`);
    console.log(`   Min: ${fps.minFPS.toFixed(1)} FPS`);
    console.log(`   Max: ${fps.maxFPS.toFixed(1)} FPS`);
    console.log(`   Target: ${FPS_TARGET} FPS`);
    console.log(`   Status: ${fps.averageFPS >= FPS_TARGET ? '✅ PASS' : '❌ FAIL'}`);

    await storeMetric('viewport_fps_2m', fps.averageFPS);

    // At target load, should maintain 60 FPS
    expect(fps.averageFPS).toBeGreaterThanOrEqual(FPS_TARGET);
  });

  test('viewport FPS during camera rotation', async ({ page }) => {
    // Load moderate geometry
    await page.evaluate(() => {
      const event = new CustomEvent('test:load-model', {
        detail: { complexity: 'moderate', triangles: 100000 },
      });
      window.dispatchEvent(event);
    });

    await page.waitForTimeout(2000);

    // Start measuring FPS
    const fpsPromise = measureViewportFPS(page, 5000, 100000);

    // Simulate camera rotation
    await page.evaluate(() => {
      const viewport = document.querySelector('[data-testid="viewport"]') as HTMLElement;
      if (viewport) {
        // Simulate drag for rotation
        const rect = viewport.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;

        viewport.dispatchEvent(
          new MouseEvent('mousedown', {
            clientX: startX,
            clientY: startY,
            bubbles: true,
          })
        );

        // Simulate rotation movement
        for (let i = 0; i < 50; i++) {
          viewport.dispatchEvent(
            new MouseEvent('mousemove', {
              clientX: startX + i * 4,
              clientY: startY + i * 2,
              bubbles: true,
            })
          );
        }

        viewport.dispatchEvent(
          new MouseEvent('mouseup', {
            clientX: startX + 200,
            clientY: startY + 100,
            bubbles: true,
          })
        );
      }
    });

    const fps = await fpsPromise;

    console.log(`\n🎨 FPS During Camera Rotation:`);
    console.log(`   Average: ${fps.averageFPS.toFixed(1)} FPS`);
    console.log(`   Min: ${fps.minFPS.toFixed(1)} FPS`);

    await storeMetric('viewport_fps_rotation', fps.averageFPS);

    // During interaction, acceptable to drop slightly
    expect(fps.averageFPS).toBeGreaterThanOrEqual(FPS_MINIMUM);
  });

  test('viewport memory usage', async ({ page }) => {
    // Load target complexity
    await page.evaluate(() => {
      const event = new CustomEvent('test:load-model', {
        detail: { complexity: 'high', triangles: 2000000 },
      });
      window.dispatchEvent(event);
    });

    await page.waitForTimeout(3000);

    const memoryUsage = await page.evaluate(() => {
      if ((performance as any).memory) {
        const memory = (performance as any).memory;
        return {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        };
      }
      return null;
    });

    if (memoryUsage) {
      const usedMB = memoryUsage.usedJSHeapSize / 1024 / 1024;
      const totalMB = memoryUsage.totalJSHeapSize / 1024 / 1024;
      const limitMB = memoryUsage.jsHeapSizeLimit / 1024 / 1024;

      console.log(`\n💾 Viewport Memory Usage:`);
      console.log(`   Used: ${usedMB.toFixed(1)} MB`);
      console.log(`   Total: ${totalMB.toFixed(1)} MB`);
      console.log(`   Limit: ${limitMB.toFixed(1)} MB`);
      console.log(`   Target: <2000 MB`);

      await storeMetric('viewport_memory_mb', usedMB);

      // Memory ceiling: 1.5-2.0 GB per tab
      expect(usedMB).toBeLessThan(2000);
    }
  });

  test('FPS regression check', async ({ page }) => {
    // Load moderate geometry
    await page.evaluate(() => {
      const event = new CustomEvent('test:load-model', {
        detail: { complexity: 'moderate', triangles: 100000 },
      });
      window.dispatchEvent(event);
    });

    await page.waitForTimeout(2000);

    const currentFPS = await measureViewportFPS(page, 5000, 100000);
    const baseline = await getBaselineMetric('viewport_fps_100k');

    if (baseline && baseline > 0) {
      const regressionPercent = ((baseline - currentFPS.averageFPS) / baseline) * 100;

      console.log(`\n📉 FPS Regression Analysis:`);
      console.log(`   Baseline: ${baseline.toFixed(1)} FPS`);
      console.log(`   Current: ${currentFPS.averageFPS.toFixed(1)} FPS`);
      console.log(
        `   Change: ${regressionPercent > 0 ? '-' : '+'}${Math.abs(regressionPercent).toFixed(2)}%`
      );

      // Allow 10% FPS degradation
      const minimumAcceptable = baseline * 0.9;

      if (currentFPS.averageFPS < minimumAcceptable) {
        console.error(
          `❌ FPS regression detected: ${currentFPS.averageFPS.toFixed(1)} < ${minimumAcceptable.toFixed(1)}`
        );
      }

      expect(currentFPS.averageFPS).toBeGreaterThanOrEqual(minimumAcceptable);
    } else {
      console.log('ℹ️  No baseline found, establishing baseline');
      await setBaselineMetric('viewport_fps_100k', currentFPS.averageFPS);
    }
  });
});

// Utility function to measure FPS
async function measureViewportFPS(
  page: any,
  durationMs: number,
  triangleCount: number
): Promise<FPSMeasurement> {
  return await page
    .evaluate(async (duration: number) => {
      return new Promise<FPSMeasurement>((resolve) => {
        const frames: number[] = [];
        let lastTime = performance.now();
        let frameCount = 0;

        function measureFrame() {
          const currentTime = performance.now();
          const deltaTime = currentTime - lastTime;

          if (deltaTime > 0) {
            const fps = 1000 / deltaTime;
            frames.push(fps);
            frameCount++;
          }

          lastTime = currentTime;

          if (currentTime - startTime < duration) {
            requestAnimationFrame(measureFrame);
          } else {
            // Calculate statistics
            const averageFPS = frames.reduce((sum, fps) => sum + fps, 0) / frames.length;
            const minFPS = Math.min(...frames);
            const maxFPS = Math.max(...frames);

            resolve({
              averageFPS,
              minFPS,
              maxFPS,
              frameCount,
              duration: currentTime - startTime,
              triangleCount: 0, // Will be set by caller
            });
          }
        }

        const startTime = performance.now();
        requestAnimationFrame(measureFrame);
      });
    }, durationMs)
    .then((result) => ({
      ...result,
      triangleCount,
    }));
}

// Import utility functions from app-load.perf.test.ts
async function storeMetric(name: string, value: number): Promise<void> {
  const metricsDir = path.join(process.cwd(), 'performance-metrics');
  const metricsFile = path.join(metricsDir, `${name}.json`);

  if (!fs.existsSync(metricsDir)) {
    fs.mkdirSync(metricsDir, { recursive: true });
  }

  let metrics: Array<{ timestamp: string; value: number }> = [];

  if (fs.existsSync(metricsFile)) {
    const data = fs.readFileSync(metricsFile, 'utf8');
    metrics = JSON.parse(data);
  }

  metrics.push({
    timestamp: new Date().toISOString(),
    value,
  });

  if (metrics.length > 100) {
    metrics = metrics.slice(-100);
  }

  fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));
}

async function getBaselineMetric(name: string): Promise<number | null> {
  const metricsFile = path.join(process.cwd(), 'performance-metrics', `${name}.json`);

  if (!fs.existsSync(metricsFile)) {
    return null;
  }

  const data = fs.readFileSync(metricsFile, 'utf8');
  const metrics: Array<{ timestamp: string; value: number }> = JSON.parse(data);

  if (metrics.length === 0) {
    return null;
  }

  const recent = metrics
    .slice(-10)
    .map((m) => m.value)
    .sort((a, b) => a - b);
  return recent[Math.floor(recent.length / 2)];
}

async function setBaselineMetric(name: string, value: number): Promise<void> {
  const baselineFile = path.join(process.cwd(), 'performance-metrics', 'baselines.json');

  let baselines: Record<string, number> = {};

  if (fs.existsSync(baselineFile)) {
    const data = fs.readFileSync(baselineFile, 'utf8');
    baselines = JSON.parse(data);
  }

  baselines[name] = value;

  fs.writeFileSync(baselineFile, JSON.stringify(baselines, null, 2));
}
