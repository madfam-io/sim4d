import { describe, it, expect } from 'vitest';
import { PatternsLatticeOctetLatticeNode } from './octet-lattice.node';
import { createTestContext } from '../test-utils';

describe('PatternsLatticeOctetLatticeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      bounds: undefined,
    } as any;
    const params = {
      cellSize: 10,
      strutDiameter: 1,
    } as any;

    const result = await PatternsLatticeOctetLatticeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
