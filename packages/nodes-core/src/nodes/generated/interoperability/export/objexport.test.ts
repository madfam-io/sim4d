import { describe, it, expect } from 'vitest';
import { InteroperabilityExportOBJExportNode } from './objexport.node';
import { createTestContext } from '../test-utils';

describe('InteroperabilityExportOBJExportNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      meshes: undefined,
      filePath: undefined,
    } as any;
    const params = {
      includeNormals: true,
      includeTexCoords: false,
      smoothing: true,
    } as any;

    const result = await InteroperabilityExportOBJExportNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
