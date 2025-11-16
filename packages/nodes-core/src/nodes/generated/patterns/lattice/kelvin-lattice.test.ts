import { describe, it, expect } from 'vitest';
import { PatternsLatticeKelvinLatticeNode } from './kelvin-lattice.node';
import { createTestContext } from '../test-utils';

describe('PatternsLatticeKelvinLatticeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      bounds: undefined,
    } as any;
    const params = {
      cellSize: 10,
      wallThickness: 0.5,
    } as any;

    const result = await PatternsLatticeKelvinLatticeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
