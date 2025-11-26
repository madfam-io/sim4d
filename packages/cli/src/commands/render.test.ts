import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { GraphInstance } from '@sim4d/types';

import { collectShapeHandles, exportFormat } from './render.ts';

const baseGraph: GraphInstance = {
  version: '0.1.0',
  units: 'mm',
  tolerance: 0.001,
  nodes: [
    {
      id: 'node-1',
      type: 'Transform::LinearPattern',
      inputs: {},
      outputs: {
        shapes: [
          { id: 'shape-1', type: 'solid', hash: 'deadbeef' },
          { id: 'shape-2', type: 'solid' },
        ],
      },
      params: {},
    },
    {
      id: 'node-2',
      type: 'Surface::ProjectCurve',
      inputs: {},
      outputs: {
        result: { id: 'shape-3', type: 'surface' },
      },
      params: {},
    },
  ],
  edges: [],
};

const createTempDir = async () => {
  const dir = await fs.mkdtemp(path.join(tmpdir(), 'sim4d-render-'));
  return dir;
};

afterEach(async () => {
  vi.restoreAllMocks();
});

describe('collectShapeHandles', () => {
  it('collects unique shape handles from graph outputs', () => {
    const handles = collectShapeHandles(baseGraph);
    const ids = handles.map((handle) =>
      typeof handle.handle === 'string' ? handle.handle : handle.handle.id
    );

    expect(ids).toEqual(['shape-1', 'shape-2', 'shape-3']);
    expect(new Set(ids).size).toBe(3);
  });
});

describe('exportFormat', () => {
  it('writes STEP files for each detected shape', async () => {
    const tempDir = await createTempDir();
    const geometryAPI = {
      invoke: vi.fn(
        async (operation: string, { shape }: { shape: any }) =>
          `${operation}:${typeof shape === 'string' ? shape : shape.id}`
      ),
    };

    const shapes = collectShapeHandles(baseGraph);
    try {
      const results = await exportFormat(
        baseGraph,
        'step',
        tempDir,
        { hash: true },
        geometryAPI,
        shapes
      );

      expect(results).toHaveLength(shapes.length);
      for (const record of results) {
        const file = await fs.readFile(record.filepath, 'utf8');
        expect(file).toContain('EXPORT_STEP');
      }
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  it('continues exporting when individual shapes fail', async () => {
    const tempDir = await createTempDir();
    const geometryAPI = {
      invoke: vi.fn(async (operation: string, { shape }: { shape: any }) => {
        if ((typeof shape === 'string' ? shape : shape.id) === 'shape-2') {
          throw new Error('failing shape');
        }
        return `${operation}:${typeof shape === 'string' ? shape : shape.id}`;
      }),
    };

    const shapes = collectShapeHandles(baseGraph);
    try {
      const results = await exportFormat(baseGraph, 'stl', tempDir, {}, geometryAPI, shapes);

      expect(results.length).toBe(shapes.length - 1);
      expect(geometryAPI.invoke).toHaveBeenCalled();
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });
});
