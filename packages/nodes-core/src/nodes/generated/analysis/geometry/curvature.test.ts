import { describe, it, expect } from 'vitest';
import { CurvatureNode } from './curvature.node';
import { createTestContext } from './../../test-utils';

describe('CurvatureNode', () => {
  it('should create Curvature', async () => {
    const context = createTestContext();
    const inputs = {
      curve: null,
    };
    const params = {
      parameter: 0.5,
    };

    const result = await CurvatureNode.evaluate(context, inputs, params);

    expect(result).toBeDefined();
    expect(result.curvature).toBeDefined();
    expect(result.radius).toBeDefined();
    expect(result.center).toBeDefined();
    expect(result.normal).toBeDefined();
  });
});
