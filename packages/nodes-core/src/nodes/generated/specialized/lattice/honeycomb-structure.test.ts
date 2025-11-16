import { describe, it, expect } from 'vitest';
import { SpecializedLatticeHoneycombStructureNode } from './honeycomb-structure.node';
import { createTestContext } from '../test-utils';

describe('SpecializedLatticeHoneycombStructureNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
    } as any;
    const params = {
      cellSize: 5,
      wallThickness: 0.5,
      fillDensity: 0.3,
    } as any;

    const result = await SpecializedLatticeHoneycombStructureNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
