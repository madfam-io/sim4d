import { describe, it, expect } from 'vitest';
import { MeshFilesExportSTLNode } from './export-stl.node';
import { createTestContext } from '../test-utils';

describe('MeshFilesExportSTLNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      mesh: undefined,
    } as any;
    const params = {
      format: 'binary',
      units: 'mm',
    } as any;

    const result = await MeshFilesExportSTLNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
