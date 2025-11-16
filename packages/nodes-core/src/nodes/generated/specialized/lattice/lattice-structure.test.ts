import { describe, it, expect } from 'vitest';
import { SpecializedLatticeLatticeStructureNode } from './lattice-structure.node';
import { createTestContext } from '../test-utils';

describe('SpecializedLatticeLatticeStructureNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      boundingShape: undefined,
    } as any;
    const params = {
      cellType: 'cubic',
      cellSize: 10,
      strutDiameter: 1,
      porosity: 0.7,
    } as any;

    const result = await SpecializedLatticeLatticeStructureNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
