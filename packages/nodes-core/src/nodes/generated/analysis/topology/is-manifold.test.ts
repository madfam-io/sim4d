import { describe, it, expect } from 'vitest';
import { IsManifoldNode } from './ismanifold.node';
import { createTestContext } from './../../test-utils';

describe('IsManifoldNode', () => {
  it('should create IsManifold', async () => {
    const context = createTestContext();
    const inputs = {
      shape: null,
    };
    const params = {};

    const result = await IsManifoldNode.evaluate(context, inputs, params);

    expect(result).toBeDefined();
    expect(result.isManifold).toBeDefined();
    expect(result.nonManifoldEdges).toBeDefined();
    expect(result.nonManifoldVertices).toBeDefined();
  });
});
