import { describe, it, expect } from 'vitest';
import { PatternsFractalsPeanoCurveNode } from './peano-curve.node';
import { createTestContext } from '../test-utils';

describe('PatternsFractalsPeanoCurveNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      bounds: undefined,
    } as any;
    const params = {
      order: 3,
    } as any;

    const result = await PatternsFractalsPeanoCurveNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
