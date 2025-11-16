import { describe, it, expect } from 'vitest';
import { PatternsLatticeDiamondLatticeNode } from './diamond-lattice.node';
import { createTestContext } from '../test-utils';

describe('PatternsLatticeDiamondLatticeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      bounds: undefined,
    } as any;
    const params = {
      cellSize: 10,
      strutDiameter: 1,
    } as any;

    const result = await PatternsLatticeDiamondLatticeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
