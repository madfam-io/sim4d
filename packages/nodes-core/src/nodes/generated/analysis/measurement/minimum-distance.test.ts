import { describe, it, expect } from 'vitest';
import { MinimumDistanceNode } from './minimumdistance.node';
import { createTestContext } from './../../test-utils';

describe('MinimumDistanceNode', () => {
  it('should create MinimumDistance', async () => {
    const context = createTestContext();
    const inputs = {
      shape1: null,
      shape2: null,
    };
    const params = {};

    const result = await MinimumDistanceNode.evaluate(context, inputs, params);

    expect(result).toBeDefined();
    expect(result.distance).toBeDefined();
    expect(result.point1).toBeDefined();
    expect(result.point2).toBeDefined();
  });
});
