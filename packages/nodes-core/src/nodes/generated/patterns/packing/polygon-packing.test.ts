import { describe, it, expect } from 'vitest';
import { PatternsPackingPolygonPackingNode } from './polygon-packing.node';
import { createTestContext } from '../test-utils';

describe('PatternsPackingPolygonPackingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      container: undefined,
      polygons: undefined,
    } as any;
    const params = {
      rotations: true,
      angleStep: 90,
    } as any;

    const result = await PatternsPackingPolygonPackingNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
