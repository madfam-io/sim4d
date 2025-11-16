import { describe, it, expect } from 'vitest';
import { MeshFilesImportOBJNode } from './import-obj.node';
import { createTestContext } from '../test-utils';

describe('MeshFilesImportOBJNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      fileData: undefined,
    } as any;
    const params = {
      importMaterials: true,
      importTextures: false,
    } as any;

    const result = await MeshFilesImportOBJNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
