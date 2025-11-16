import { describe, it, expect } from 'vitest';
import { SpecializedLatticeConformLatticeNode } from './conform-lattice.node';
import { createTestContext } from '../test-utils';

describe('SpecializedLatticeConformLatticeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      targetShape: undefined,
      latticePattern: undefined,
    } as any;
    const params = {
      conformType: 'volume',
      cellSize: 10,
    } as any;

    const result = await SpecializedLatticeConformLatticeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
