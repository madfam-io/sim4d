import { describe, it, expect } from 'vitest';
import { IntersectionNode } from './intersection.node';
import { createTestContext } from './../../test-utils';

describe('IntersectionNode', () => {
  it('should create Intersection', async () => {
    const context = createTestContext();
    const inputs = {
      shape1: null,
      shape2: null,
    };
    const params = {};

    const result = await IntersectionNode.evaluate(context, inputs, params);

    expect(result).toBeDefined();
    expect(result.intersects).toBeDefined();
    expect(result.intersection).toBeDefined();
  });
});
