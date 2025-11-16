import { describe, it, expect } from 'vitest';
import { MeshFilesExport3MFNode } from './export3-mf.node';
import { createTestContext } from '../test-utils';

describe('MeshFilesExport3MFNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      mesh: undefined,
    } as any;
    const params = {
      includeColors: true,
      includeMaterials: true,
      includeMetadata: true,
    } as any;

    const result = await MeshFilesExport3MFNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
