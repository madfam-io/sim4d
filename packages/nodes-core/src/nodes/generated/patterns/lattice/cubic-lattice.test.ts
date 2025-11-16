import { describe, it, expect } from 'vitest';
import { PatternsLatticeCubicLatticeNode } from './cubic-lattice.node';
import { createTestContext } from '../test-utils';

describe('PatternsLatticeCubicLatticeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      bounds: undefined,
    } as any;
    const params = {
      cellSize: 10,
      strutDiameter: 1,
    } as any;

    const result = await PatternsLatticeCubicLatticeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
