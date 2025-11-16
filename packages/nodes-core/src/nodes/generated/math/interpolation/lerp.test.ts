import { describe, it, expect } from 'vitest';
import { MathInterpolationLerpNode } from './lerp.node';
import { createTestContext } from '../test-utils';

describe('MathInterpolationLerpNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      a: undefined,
      b: undefined,
      t: undefined,
    } as any;
    const params = {} as any;

    const result = await MathInterpolationLerpNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
