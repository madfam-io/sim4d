import { describe, it, expect } from 'vitest';
import { MeshFilesImportPLYNode } from './import-ply.node';
import { createTestContext } from '../test-utils';

describe('MeshFilesImportPLYNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      fileData: undefined,
    } as any;
    const params = {
      importColors: true,
      importProperties: true,
    } as any;

    const result = await MeshFilesImportPLYNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
