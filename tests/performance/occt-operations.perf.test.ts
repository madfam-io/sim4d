import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Performance Test: OCCT Operations Timing
 * Target: Boolean operations < 1s p95 for parts < 50k faces
 *
 * Measures OCCT WASM geometry operations performance
 */

const BOOLEAN_TARGET_MS = 1000; // < 1s p95
const EXTRUSION_TARGET_MS = 500;
const FILLET_TARGET_MS = 2000;
const STEP_EXPORT_TARGET_MS = 5000;

test.describe('OCCT Operations Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('[data-testid="viewport"]', { timeout: 10000 });

    // Wait for WASM worker to be ready
    await page.waitForFunction(() => (window as any).__WASM_READY__ === true, { timeout: 10000 });
  });

  test('Boolean union operation performance', async ({ page }) => {
    // Create two boxes and perform union
    const result = await page.evaluate(async () => {
      const geomAPI = (window as any).__GEOMETRY_API__;
      if (!geomAPI) return null;

      const opStart = performance.now();

      // Create first box
      const box1 = await geomAPI.createBox({
        width: 10,
        height: 10,
        depth: 10,
        position: { x: 0, y: 0, z: 0 },
      });

      // Create second box (overlapping)
      const box2 = await geomAPI.createBox({
        width: 10,
        height: 10,
        depth: 10,
        position: { x: 5, y: 0, z: 0 },
      });

      // Perform union
      const union = await geomAPI.booleanUnion(box1, box2);

      const opEnd = performance.now();

      return {
        duration: opEnd - opStart,
        faceCount: union?.faceCount || 0,
        success: !!union,
      };
    });

    if (!result) {
      throw new Error('Geometry API not available');
    }

    console.log(`\n🔧 Boolean Union Performance:`);
    console.log(`   Duration: ${result.duration.toFixed(0)}ms`);
    console.log(`   Face Count: ${result.faceCount}`);
    console.log(`   Target: ${BOOLEAN_TARGET_MS}ms`);
    console.log(`   Status: ${result.duration <= BOOLEAN_TARGET_MS ? '✅ PASS' : '❌ FAIL'}`);

    await storeMetric('occt_boolean_union_ms', result.duration);

    expect(result.success).toBe(true);
    expect(result.duration).toBeLessThanOrEqual(BOOLEAN_TARGET_MS);
  });

  test('Boolean subtraction operation performance', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const geomAPI = (window as any).__GEOMETRY_API__;
      if (!geomAPI) return null;

      const opStart = performance.now();

      // Create larger box
      const box = await geomAPI.createBox({
        width: 20,
        height: 20,
        depth: 20,
        position: { x: 0, y: 0, z: 0 },
      });

      // Create sphere
      const sphere = await geomAPI.createSphere({
        radius: 8,
        position: { x: 0, y: 0, z: 0 },
      });

      // Perform subtraction (box - sphere)
      const subtraction = await geomAPI.booleanSubtract(box, sphere);

      const opEnd = performance.now();

      return {
        duration: opEnd - opStart,
        faceCount: subtraction?.faceCount || 0,
        success: !!subtraction,
      };
    });

    if (!result) {
      throw new Error('Geometry API not available');
    }

    console.log(`\n🔧 Boolean Subtraction Performance:`);
    console.log(`   Duration: ${result.duration.toFixed(0)}ms`);
    console.log(`   Face Count: ${result.faceCount}`);
    console.log(`   Target: ${BOOLEAN_TARGET_MS}ms`);
    console.log(`   Status: ${result.duration <= BOOLEAN_TARGET_MS ? '✅ PASS' : '❌ FAIL'}`);

    await storeMetric('occt_boolean_subtract_ms', result.duration);

    expect(result.success).toBe(true);
    expect(result.duration).toBeLessThanOrEqual(BOOLEAN_TARGET_MS);
  });

  test('Boolean intersection operation performance', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const geomAPI = (window as any).__GEOMETRY_API__;
      if (!geomAPI) return null;

      const opStart = performance.now();

      // Create cylinder
      const cylinder = await geomAPI.createCylinder({
        radius: 10,
        height: 20,
        position: { x: 0, y: 0, z: 0 },
      });

      // Create box
      const box = await geomAPI.createBox({
        width: 15,
        height: 15,
        depth: 15,
        position: { x: 0, y: 0, z: 0 },
      });

      // Perform intersection
      const intersection = await geomAPI.booleanIntersect(cylinder, box);

      const opEnd = performance.now();

      return {
        duration: opEnd - opStart,
        faceCount: intersection?.faceCount || 0,
        success: !!intersection,
      };
    });

    if (!result) {
      throw new Error('Geometry API not available');
    }

    console.log(`\n🔧 Boolean Intersection Performance:`);
    console.log(`   Duration: ${result.duration.toFixed(0)}ms`);
    console.log(`   Face Count: ${result.faceCount}`);
    console.log(`   Target: ${BOOLEAN_TARGET_MS}ms`);

    await storeMetric('occt_boolean_intersect_ms', result.duration);

    expect(result.success).toBe(true);
    expect(result.duration).toBeLessThanOrEqual(BOOLEAN_TARGET_MS);
  });

  test('Extrusion operation performance', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const geomAPI = (window as any).__GEOMETRY_API__;
      if (!geomAPI) return null;

      const opStart = performance.now();

      // Create 2D profile (rectangle)
      const profile = await geomAPI.createRectangleProfile({
        width: 10,
        height: 5,
      });

      // Extrude profile
      const extrusion = await geomAPI.extrude(profile, {
        distance: 20,
      });

      const opEnd = performance.now();

      return {
        duration: opEnd - opStart,
        faceCount: extrusion?.faceCount || 0,
        success: !!extrusion,
      };
    });

    if (!result) {
      throw new Error('Geometry API not available');
    }

    console.log(`\n🔧 Extrusion Performance:`);
    console.log(`   Duration: ${result.duration.toFixed(0)}ms`);
    console.log(`   Face Count: ${result.faceCount}`);
    console.log(`   Target: ${EXTRUSION_TARGET_MS}ms`);
    console.log(`   Status: ${result.duration <= EXTRUSION_TARGET_MS ? '✅ PASS' : '❌ FAIL'}`);

    await storeMetric('occt_extrusion_ms', result.duration);

    expect(result.success).toBe(true);
    expect(result.duration).toBeLessThanOrEqual(EXTRUSION_TARGET_MS);
  });

  test('Fillet operation performance', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const geomAPI = (window as any).__GEOMETRY_API__;
      if (!geomAPI) return null;

      const opStart = performance.now();

      // Create box
      const box = await geomAPI.createBox({
        width: 20,
        height: 20,
        depth: 20,
        position: { x: 0, y: 0, z: 0 },
      });

      // Apply fillets to all 12 edges (radius 2)
      const filleted = await geomAPI.filletEdges(box, {
        radius: 2,
        edges: 'all', // All edges
      });

      const opEnd = performance.now();

      return {
        duration: opEnd - opStart,
        faceCount: filleted?.faceCount || 0,
        success: !!filleted,
      };
    });

    if (!result) {
      throw new Error('Geometry API not available');
    }

    console.log(`\n🔧 Fillet Performance:`);
    console.log(`   Duration: ${result.duration.toFixed(0)}ms`);
    console.log(`   Face Count: ${result.faceCount}`);
    console.log(`   Target: ${FILLET_TARGET_MS}ms`);
    console.log(`   Status: ${result.duration <= FILLET_TARGET_MS ? '✅ PASS' : '❌ FAIL'}`);

    await storeMetric('occt_fillet_ms', result.duration);

    expect(result.success).toBe(true);
    expect(result.duration).toBeLessThanOrEqual(FILLET_TARGET_MS);
  });

  test('STEP export performance', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const geomAPI = (window as any).__GEOMETRY_API__;
      if (!geomAPI) return null;

      // Create moderately complex model
      const box1 = await geomAPI.createBox({
        width: 20,
        height: 20,
        depth: 20,
        position: { x: 0, y: 0, z: 0 },
      });

      const cylinder = await geomAPI.createCylinder({
        radius: 5,
        height: 30,
        position: { x: 0, y: 0, z: -5 },
      });

      const combined = await geomAPI.booleanSubtract(box1, cylinder);

      const opStart = performance.now();

      // Export to STEP
      const stepData = await geomAPI.exportSTEP(combined);

      const opEnd = performance.now();

      return {
        duration: opEnd - opStart,
        dataSize: stepData?.length || 0,
        success: !!stepData && stepData.length > 0,
      };
    });

    if (!result) {
      throw new Error('Geometry API not available');
    }

    console.log(`\n🔧 STEP Export Performance:`);
    console.log(`   Duration: ${result.duration.toFixed(0)}ms`);
    console.log(`   Data Size: ${(result.dataSize / 1024).toFixed(1)}KB`);
    console.log(`   Target: ${STEP_EXPORT_TARGET_MS}ms`);
    console.log(`   Status: ${result.duration <= STEP_EXPORT_TARGET_MS ? '✅ PASS' : '❌ FAIL'}`);

    await storeMetric('occt_step_export_ms', result.duration);

    expect(result.success).toBe(true);
    expect(result.duration).toBeLessThanOrEqual(STEP_EXPORT_TARGET_MS);
  });

  test('STL export performance', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const geomAPI = (window as any).__GEOMETRY_API__;
      if (!geomAPI) return null;

      // Create sphere
      const sphere = await geomAPI.createSphere({
        radius: 15,
        position: { x: 0, y: 0, z: 0 },
      });

      const opStart = performance.now();

      // Export to STL
      const stlData = await geomAPI.exportSTL(sphere, {
        linearDeflection: 0.1,
        angularDeflection: 0.5,
      });

      const opEnd = performance.now();

      return {
        duration: opEnd - opStart,
        dataSize: stlData?.length || 0,
        success: !!stlData && stlData.length > 0,
      };
    });

    if (!result) {
      throw new Error('Geometry API not available');
    }

    console.log(`\n🔧 STL Export Performance:`);
    console.log(`   Duration: ${result.duration.toFixed(0)}ms`);
    console.log(`   Data Size: ${(result.dataSize / 1024).toFixed(1)}KB`);
    console.log(`   Target: ${STEP_EXPORT_TARGET_MS}ms`);

    await storeMetric('occt_stl_export_ms', result.duration);

    expect(result.success).toBe(true);
    expect(result.duration).toBeLessThanOrEqual(STEP_EXPORT_TARGET_MS);
  });

  test('Complex boolean chain performance', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const geomAPI = (window as any).__GEOMETRY_API__;
      if (!geomAPI) return null;

      const opStart = performance.now();

      // Create base box
      let shape = await geomAPI.createBox({
        width: 30,
        height: 30,
        depth: 30,
        position: { x: 0, y: 0, z: 0 },
      });

      // Subtract multiple cylinders (like drilling holes)
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const x = Math.cos(angle) * 10;
        const y = Math.sin(angle) * 10;

        const cylinder = await geomAPI.createCylinder({
          radius: 3,
          height: 40,
          position: { x, y, z: -5 },
        });

        shape = await geomAPI.booleanSubtract(shape, cylinder);
      }

      const opEnd = performance.now();

      return {
        duration: opEnd - opStart,
        faceCount: shape?.faceCount || 0,
        success: !!shape,
      };
    });

    if (!result) {
      throw new Error('Geometry API not available');
    }

    console.log(`\n🔧 Complex Boolean Chain Performance:`);
    console.log(`   Duration: ${result.duration.toFixed(0)}ms`);
    console.log(`   Operations: 1 box + 4 cylinders + 4 subtractions`);
    console.log(`   Face Count: ${result.faceCount}`);
    console.log(`   Target: ${BOOLEAN_TARGET_MS * 4}ms (4 operations)`);

    await storeMetric('occt_boolean_chain_ms', result.duration);

    expect(result.success).toBe(true);
    expect(result.duration).toBeLessThanOrEqual(BOOLEAN_TARGET_MS * 4);
  });

  test('OCCT operations regression check', async ({ page }) => {
    // Run a standard boolean operation
    const result = await page.evaluate(async () => {
      const geomAPI = (window as any).__GEOMETRY_API__;
      if (!geomAPI) return null;

      const opStart = performance.now();

      const box = await geomAPI.createBox({
        width: 10,
        height: 10,
        depth: 10,
        position: { x: 0, y: 0, z: 0 },
      });

      const sphere = await geomAPI.createSphere({
        radius: 7,
        position: { x: 0, y: 0, z: 0 },
      });

      const result = await geomAPI.booleanUnion(box, sphere);

      const opEnd = performance.now();

      return {
        duration: opEnd - opStart,
        success: !!result,
      };
    });

    if (!result) {
      throw new Error('Geometry API not available');
    }

    const baseline = await getBaselineMetric('occt_boolean_union_ms');

    if (baseline && baseline > 0) {
      const regressionPercent = ((result.duration - baseline) / baseline) * 100;

      console.log(`\n📉 OCCT Operations Regression Analysis:`);
      console.log(`   Baseline: ${baseline.toFixed(0)}ms`);
      console.log(`   Current: ${result.duration.toFixed(0)}ms`);
      console.log(`   Change: ${regressionPercent > 0 ? '+' : ''}${regressionPercent.toFixed(2)}%`);

      // Allow 10% performance degradation
      const maximumAcceptable = baseline * 1.1;

      if (result.duration > maximumAcceptable) {
        console.error(
          `❌ Performance regression: ${result.duration.toFixed(0)}ms > ${maximumAcceptable.toFixed(0)}ms`
        );
      }

      expect(result.duration).toBeLessThanOrEqual(maximumAcceptable);
    } else {
      console.log('ℹ️  No baseline found, establishing baseline');
      await setBaselineMetric('occt_boolean_union_ms', result.duration);
    }
  });
});

// Utility functions (same as in app-load.perf.test.ts)
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
