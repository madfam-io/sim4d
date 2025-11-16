import { describe, it, expect } from 'vitest';
import { PatternsLatticeTPMSLatticeNode } from './tpmslattice.node';
import { createTestContext } from '../test-utils';

describe('PatternsLatticeTPMSLatticeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      bounds: undefined,
    } as any;
    const params = {
      type: 'gyroid',
      period: 10,
      thickness: 1,
    } as any;

    const result = await PatternsLatticeTPMSLatticeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
