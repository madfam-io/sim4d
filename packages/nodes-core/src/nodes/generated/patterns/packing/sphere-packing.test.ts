import { describe, it, expect } from 'vitest';
import { PatternsPackingSpherePackingNode } from './sphere-packing.node';
import { createTestContext } from '../test-utils';

describe('PatternsPackingSpherePackingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      container: undefined,
      radius: undefined,
    } as any;
    const params = {
      packingType: 'hexagonal',
    } as any;

    const result = await PatternsPackingSpherePackingNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
