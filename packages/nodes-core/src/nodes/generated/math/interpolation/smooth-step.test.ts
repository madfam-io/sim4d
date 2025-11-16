import { describe, it, expect } from 'vitest';
import { MathInterpolationSmoothStepNode } from './smooth-step.node';
import { createTestContext } from '../test-utils';

describe('MathInterpolationSmoothStepNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      edge0: undefined,
      edge1: undefined,
      x: undefined,
    } as any;
    const params = {} as any;

    const result = await MathInterpolationSmoothStepNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
