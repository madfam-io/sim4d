import { describe, it, expect } from 'vitest';
import { SketchCurvesSplineNode } from './spline.node';
import { createTestContext } from '../test-utils';

describe('SketchCurvesSplineNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      points: undefined,
    } as any;
    const params = {
      degree: 3,
      closed: false,
      smooth: true,
    } as any;

    const result = await SketchCurvesSplineNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
