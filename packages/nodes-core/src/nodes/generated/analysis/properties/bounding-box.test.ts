import { describe, it, expect } from 'vitest';
import { BoundingBoxNode } from './bounding-box.node';
import { createTestContext } from './../../test-utils';

describe('BoundingBoxNode', () => {
  it('should create BoundingBox', async () => {
    const context = createTestContext();
    const inputs = {
      shape: null,
    };
    const params = {};

    const result = await BoundingBoxNode.evaluate(context, inputs, params);

    expect(result).toBeDefined();
    expect(result.min).toBeDefined();
    expect(result.max).toBeDefined();
    expect(result.center).toBeDefined();
    expect(result.dimensions).toBeDefined();
  });
});
