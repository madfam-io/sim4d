import { describe, it, expect } from 'vitest';
import { SpecializedOrganicBiomimeticStructureNode } from './biomimetic-structure.node';
import { createTestContext } from '../test-utils';

describe('SpecializedOrganicBiomimeticStructureNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
    } as any;
    const params = {
      inspiration: 'bone',
      density: 0.5,
    } as any;

    const result = await SpecializedOrganicBiomimeticStructureNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
