// @vitest-environment node

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import fs from 'node:fs';
import { promises as fsp } from 'node:fs';
import path from 'path';
import os from 'os';

const graphFixture = path.resolve('packages/examples/graphs/simple-box.bflow.json');

const geometryInvoke = vi.fn(async (operation: string) => {
  if (operation === 'HEALTH_CHECK') {
    return { success: true, result: { healthy: true } };
  }

  if (operation.startsWith('EXPORT_')) {
    return `# ${operation} CONTENT`;
  }

  return { success: true, result: { id: 'mock-shape' } };
});

vi.mock('@sim4d/engine-core', () => ({
  GraphManager: class {
    private graph: any;

    constructor(graph: any) {
      this.graph = graph;
    }

    getDirtyNodes() {
      return new Set((this.graph.nodes ?? []).map((node: any) => node.id));
    }

    getGraph() {
      return this.graph;
    }
  },
  DAGEngine: class {
    private summary: any = null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(_: any) {}

    async evaluate(graph: any) {
      (graph.nodes ?? []).forEach((node: any, index: number) => {
        node.outputs = node.outputs || {};
        node.outputs.shapes = [{ id: `shape-${index}`, type: 'solid' }];
      });

      const count = (graph.nodes ?? []).length;
      this.summary = {
        sampleCount: count,
        successCount: count,
        failureCount: 0,
        averageMs: 12,
        p50Ms: 10,
        p95Ms: 15,
        maxMs: 20,
        slowNodes: [],
        categoryBreakdown: {},
      };
    }

    getEvaluationSummary() {
      return (
        this.summary ?? {
          sampleCount: 0,
          successCount: 0,
          failureCount: 0,
          averageMs: 0,
          p50Ms: 0,
          p95Ms: 0,
          maxMs: 0,
          slowNodes: [],
          categoryBreakdown: {},
        }
      );
    }
  },
  GeometryAPIFactory: {
    getAPI: vi.fn(async () => ({
      invoke: geometryInvoke,
    })),
  },
  GeometryEvaluationError: class GeometryEvaluationError extends Error {
    constructor(message: string) {
      super(message);
      this.nodeId = 'demo';
      this.nodeType = 'Solid::Box';
    }
    nodeId: string;
    nodeType: string;
  },
}));

vi.mock('@sim4d/nodes-core', () => ({
  registerCoreNodes: vi.fn(),
}));

type RenderCommandModule = typeof import('../../packages/cli/src/commands/render');

describe('CLI integration', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sim4d-cli-'));
  let renderCommand: RenderCommandModule['renderCommand'];

  beforeAll(async () => {
    await fsp.mkdir(tempDir, { recursive: true });
    ({ renderCommand } = await import('../../packages/cli/src/commands/render'));
  });

  afterAll(async () => {
    await fsp.rm(tempDir, { recursive: true, force: true });
  });

  it('renders a graph and produces manifest using real geometry pipeline stubs', async () => {
    await renderCommand.parseAsync(
      [graphFixture, '--out', tempDir, '--export', 'step', '--manifest'],
      { from: 'user' }
    );

    const stepFile = path.join(tempDir, 'output.step');
    const manifestFile = path.join(tempDir, 'manifest.json');

    expect(await pathExists(stepFile)).toBe(true);
    expect(await pathExists(manifestFile)).toBe(true);

    const manifest = await readJson(manifestFile);
    expect(manifest.graph).toBe(path.basename(graphFixture));
    expect(Array.isArray(manifest.exports)).toBe(true);
    expect(manifest.exports.length).toBeGreaterThan(0);
  });
});

async function pathExists(filepath: string): Promise<boolean> {
  try {
    await fsp.access(filepath);
    return true;
  } catch {
    return false;
  }
}

async function readJson<T = any>(filepath: string): Promise<T> {
  const contents = await fsp.readFile(filepath, 'utf8');
  return JSON.parse(contents) as T;
}
