import { describe, it, expect } from 'vitest';
import { SurfaceAreaNode } from './surfacearea.node';
import { createTestContext } from './../../test-utils';

describe('SurfaceAreaNode', () => {
  it('should create SurfaceArea', async () => {
    const context = createTestContext();
    const inputs = {
      shape: null,
    };
    const params = {};

    const result = await SurfaceAreaNode.evaluate(context, inputs, params);

    expect(result).toBeDefined();
    expect(result.area).toBeDefined();
  });
});
