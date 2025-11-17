import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';

/**
 * Performance Test: Application Cold Load Time
 * Target: ≤ 3.0 seconds on modern hardware
 *
 * Measures time from navigation to interactive state
 */

const COLD_LOAD_TARGET_MS = 3000;
const COLD_LOAD_WARNING_MS = 2500;
const ACCEPTABLE_DEGRADATION_PERCENT = 10; // Allow 10% degradation

test.describe('App Load Performance', () => {
  test.beforeEach(async ({ context }) => {
    // Clear all caches and storage to simulate cold load
    await context.clearCookies();
    await context.clearPermissions();
  });

  test('cold load time should be under 3.0 seconds', async ({ page }) => {
    const startTime = Date.now();

    // Navigate and wait for app to be interactive
    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle',
    });

    // Wait for critical elements to be visible
    await page.waitForSelector('[data-testid="node-editor"]', { timeout: 5000 });
    await page.waitForSelector('[data-testid="viewport"]', { timeout: 5000 });

    const loadTime = Date.now() - startTime;

    // Log performance metrics
    console.log(`\n📊 App Load Performance:`);
    console.log(`   Load Time: ${loadTime}ms`);
    console.log(`   Target: ${COLD_LOAD_TARGET_MS}ms`);
    console.log(`   Status: ${loadTime <= COLD_LOAD_TARGET_MS ? '✅ PASS' : '❌ FAIL'}`);

    // Store metrics for trend analysis
    await storeMetric('app_cold_load_ms', loadTime);

    // Check against target
    expect(loadTime).toBeLessThanOrEqual(COLD_LOAD_TARGET_MS);

    // Warning if approaching target
    if (loadTime > COLD_LOAD_WARNING_MS) {
      console.warn(
        `⚠️  Warning: Load time ${loadTime}ms approaching target ${COLD_LOAD_TARGET_MS}ms`
      );
    }
  });

  test('load time should not regress more than 10%', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle',
    });

    await page.waitForSelector('[data-testid="node-editor"]', { timeout: 5000 });
    await page.waitForSelector('[data-testid="viewport"]', { timeout: 5000 });

    const currentLoadTime = Date.now() - startTime;

    // Get baseline from previous runs
    const baseline = await getBaselineMetric('app_cold_load_ms');

    if (baseline) {
      const allowedMax = baseline * (1 + ACCEPTABLE_DEGRADATION_PERCENT / 100);
      const regressionPercent = ((currentLoadTime - baseline) / baseline) * 100;

      console.log(`\n📈 Regression Analysis:`);
      console.log(`   Baseline: ${baseline}ms`);
      console.log(`   Current: ${currentLoadTime}ms`);
      console.log(`   Change: ${regressionPercent.toFixed(2)}%`);
      console.log(`   Allowed: ${ACCEPTABLE_DEGRADATION_PERCENT}%`);

      if (regressionPercent > 0) {
        expect(currentLoadTime).toBeLessThanOrEqual(allowedMax);
      }
    } else {
      console.log('ℹ️  No baseline found, establishing baseline');
      await setBaselineMetric('app_cold_load_ms', currentLoadTime);
    }

    await storeMetric('app_cold_load_ms', currentLoadTime);
  });

  test('WASM worker initialization time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('http://localhost:5173');

    // Wait for WASM worker to initialize
    await page.waitForFunction(
      () => {
        return (window as any).__WASM_READY__ === true;
      },
      { timeout: 10000 }
    );

    const wasmInitTime = Date.now() - startTime;

    console.log(`\n🔧 WASM Worker Initialization:`);
    console.log(`   Init Time: ${wasmInitTime}ms`);
    console.log(`   Target: <2000ms`);

    await storeMetric('wasm_init_ms', wasmInitTime);

    // WASM init should be under 2 seconds
    expect(wasmInitTime).toBeLessThan(2000);
  });

  test('dev server response time', async ({ page }) => {
    const navigationStart = Date.now();

    const response = await page.goto('http://localhost:5173');

    const responseTime = Date.now() - navigationStart;
    const serverTiming = response?.headers()['server-timing'];

    console.log(`\n🌐 Server Response:`);
    console.log(`   Response Time: ${responseTime}ms`);
    console.log(`   Server Timing: ${serverTiming || 'N/A'}`);

    await storeMetric('server_response_ms', responseTime);

    // Dev server should respond in under 500ms
    expect(responseTime).toBeLessThan(500);
  });

  test('critical resource loading', async ({ page }) => {
    const metrics = await page.evaluate(() => {
      const perfEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

      return {
        jsFiles: perfEntries
          .filter((entry) => entry.name.endsWith('.js'))
          .map((entry) => ({
            name: entry.name.split('/').pop(),
            duration: entry.duration,
            size: entry.transferSize || 0,
          })),
        cssFiles: perfEntries
          .filter((entry) => entry.name.endsWith('.css'))
          .map((entry) => ({
            name: entry.name.split('/').pop(),
            duration: entry.duration,
            size: entry.transferSize || 0,
          })),
        wasmFiles: perfEntries
          .filter((entry) => entry.name.endsWith('.wasm'))
          .map((entry) => ({
            name: entry.name.split('/').pop(),
            duration: entry.duration,
            size: entry.transferSize || 0,
          })),
      };
    });

    console.log(`\n📦 Critical Resources:`);
    console.log(`   JS Files: ${metrics.jsFiles.length}`);
    console.log(`   CSS Files: ${metrics.cssFiles.length}`);
    console.log(`   WASM Files: ${metrics.wasmFiles.length}`);

    // Log slow resources
    const slowResources = [...metrics.jsFiles, ...metrics.cssFiles, ...metrics.wasmFiles].filter(
      (r) => r.duration > 1000
    );

    if (slowResources.length > 0) {
      console.warn(`\n⚠️  Slow Resources (>1s):`);
      slowResources.forEach((r) => {
        console.warn(`   ${r.name}: ${r.duration.toFixed(0)}ms (${(r.size / 1024).toFixed(0)}KB)`);
      });
    }
  });
});

// Utility functions for metrics storage and analysis

async function storeMetric(name: string, value: number): Promise<void> {
  // Store in JSON file for trend analysis
  const metricsDir = path.join(process.cwd(), 'performance-metrics');
  const metricsFile = path.join(metricsDir, `${name}.json`);

  // Ensure directory exists
  if (!fs.existsSync(metricsDir)) {
    fs.mkdirSync(metricsDir, { recursive: true });
  }

  let metrics: Array<{ timestamp: string; value: number }> = [];

  // Load existing metrics
  if (fs.existsSync(metricsFile)) {
    const data = fs.readFileSync(metricsFile, 'utf8');
    metrics = JSON.parse(data);
  }

  // Add new metric
  metrics.push({
    timestamp: new Date().toISOString(),
    value,
  });

  // Keep last 100 measurements
  if (metrics.length > 100) {
    metrics = metrics.slice(-100);
  }

  // Save updated metrics
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

  // Use median of last 10 measurements as baseline
  const recent = metrics
    .slice(-10)
    .map((m) => m.value)
    .sort((a, b) => a - b);
  const median = recent[Math.floor(recent.length / 2)];

  return median;
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
