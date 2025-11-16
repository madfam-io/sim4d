import { describe, it, expect } from 'vitest';
import { SpecializedOptimizationLightweightStructureNode } from './lightweight-structure.node';
import { createTestContext } from '../test-utils';

describe('SpecializedOptimizationLightweightStructureNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      solid: undefined,
    } as any;
    const params = {
      targetWeight: 0.5,
      structureType: 'hybrid',
    } as any;

    const result = await SpecializedOptimizationLightweightStructureNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
