import { describe, it, expect } from 'vitest';
import { MeshFilesImportSTLNode } from './import-stl.node';
import { createTestContext } from '../test-utils';

describe('MeshFilesImportSTLNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      fileData: undefined,
    } as any;
    const params = {
      units: 'mm',
      validate: true,
    } as any;

    const result = await MeshFilesImportSTLNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
