import { describe, it, expect } from 'vitest';
import { AssemblyPatternsBillOfMaterialsNode } from './bill-of-materials.node';
import { createTestContext } from '../test-utils';

describe('AssemblyPatternsBillOfMaterialsNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      assembly: undefined,
    } as any;
    const params = {
      includeSubAssemblies: true,
      groupIdentical: true,
    } as any;

    const result = await AssemblyPatternsBillOfMaterialsNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
