import { describe, it, expect } from 'vitest';
import { IOExchangeImportGLTFNode } from './import-gltf.node';
import { createTestContext } from '../test-utils';

describe('IOExchangeImportGLTFNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      fileData: undefined,
    } as any;
    const params = {
      importAnimations: false,
      importMaterials: true,
    } as any;

    const result = await IOExchangeImportGLTFNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
