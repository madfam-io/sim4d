import { describe, it, expect } from 'vitest';
import { SketchCurvesBezierCurveNode } from './bezier-curve.node';
import { createTestContext } from '../test-utils';

describe('SketchCurvesBezierCurveNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      controlPoints: undefined,
    } as any;
    const params = {} as any;

    const result = await SketchCurvesBezierCurveNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
