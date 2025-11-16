import { describe, it, expect } from 'vitest';
import { MathInterpolationBezierInterpNode } from './bezier-interp.node';
import { createTestContext } from '../test-utils';

describe('MathInterpolationBezierInterpNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      points: undefined,
      t: undefined,
    } as any;
    const params = {} as any;

    const result = await MathInterpolationBezierInterpNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
