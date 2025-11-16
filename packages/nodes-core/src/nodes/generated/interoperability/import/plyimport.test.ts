import { describe, it, expect } from 'vitest';
import { InteroperabilityImportPLYImportNode } from './plyimport.node';
import { createTestContext } from '../test-utils';

describe('InteroperabilityImportPLYImportNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      filePath: undefined,
    } as any;
    const params = {
      loadColors: true,
      loadNormals: true,
      scaleFactor: 1,
    } as any;

    const result = await InteroperabilityImportPLYImportNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
