import { describe, it, expect } from 'vitest';
import { MeshFilesExportOBJNode } from './export-obj.node';
import { createTestContext } from '../test-utils';

describe('MeshFilesExportOBJNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      mesh: undefined,
    } as any;
    const params = {
      exportNormals: true,
      exportUVs: false,
    } as any;

    const result = await MeshFilesExportOBJNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
