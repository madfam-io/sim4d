import { describe, it, expect } from 'vitest';
import { InteroperabilityImportThreeMFImportNode } from './three-mfimport.node';
import { createTestContext } from '../test-utils';

describe('InteroperabilityImportThreeMFImportNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      filePath: undefined,
    } as any;
    const params = {
      loadTextures: true,
      loadMaterials: true,
      units: 'auto',
    } as any;

    const result = await InteroperabilityImportThreeMFImportNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
