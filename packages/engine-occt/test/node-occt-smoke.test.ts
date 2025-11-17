// @vitest-environment node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { IntegratedGeometryAPI } from '../src/integrated-geometry-api';
import { createProductionSafeConfig } from '../src/production-safety';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const wasmDir = path.resolve(__dirname, '../wasm');

const requiredArtifacts = ['occt-core.node.mjs', 'occt-core.node.wasm'];

describe('Node OCCT smoke', () => {
  let api: IntegratedGeometryAPI | null = null;

  beforeAll(async () => {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- Test file, checking WASM artifacts
    const missing = requiredArtifacts.filter((file) => !fs.existsSync(path.join(wasmDir, file)));

    if (missing.length > 0) {
      const message = [
        'Real OCCT artifacts are missing for Node smoke test.',
        `Expected files in ${wasmDir}: ${missing.join(', ')}`,
        'Run "pnpm run build:wasm" before executing the test suite.',
      ].join('\n');
      throw new Error(message);
    }

    const config = createProductionSafeConfig({
      enableRealOCCT: true,
      enablePerformanceMonitoring: false,
      enableMemoryManagement: false,
      enableErrorRecovery: false,
      workerPoolConfig: undefined,
      memoryConfig: undefined,
    });

    api = new IntegratedGeometryAPI(config);
  }, 30_000);

  afterAll(async () => {
    if (api) {
      await api.shutdown();
    }
  });

  it('executes real geometry without mock fallback', async () => {
    if (!api) {
      throw new Error('Geometry API not initialized');
    }

    const boxResult = await api.invoke('MAKE_BOX', {
      center: { x: 0, y: 0, z: 0 },
      width: 10,
      height: 5,
      depth: 7,
    });

    expect(boxResult.success).toBe(true);
    expect(boxResult.fallbackUsed).toBe(false);
    expect(boxResult.result?.id).toBeTruthy();

    const tessellation = await api.tessellate(boxResult.result!, 0.2);

    expect(tessellation.success).toBe(true);
    expect(tessellation.fallbackUsed).toBe(false);
    expect(tessellation.result).toBeDefined();
    expect(tessellation.result?.positions.length ?? 0).toBeGreaterThan(0);
    expect(tessellation.result?.indices.length ?? 0).toBeGreaterThan(0);
  }, 60_000);
});
