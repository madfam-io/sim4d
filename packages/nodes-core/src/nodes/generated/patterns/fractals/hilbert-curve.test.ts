import { describe, it, expect } from 'vitest';
import { PatternsFractalsHilbertCurveNode } from './hilbert-curve.node';
import { createTestContext } from '../test-utils';

describe('PatternsFractalsHilbertCurveNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      bounds: undefined,
    } as any;
    const params = {
      order: 4,
      dimension: '2D',
    } as any;

    const result = await PatternsFractalsHilbertCurveNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
