import { describe, it, expect } from 'vitest';
import { AnalysisIntersectionCurveCurveIntersectionNode } from './curve-curve-intersection.node';
import { createTestContext } from '../test-utils';

describe('AnalysisIntersectionCurveCurveIntersectionNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      curve1: undefined,
      curve2: undefined,
    } as any;
    const params = {
      tolerance: 0.01,
      extendCurves: false,
    } as any;

    const result = await AnalysisIntersectionCurveCurveIntersectionNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
