import { describe, it, expect } from 'vitest';
import { AnalysisCurvesCurveConvexHullNode } from './curve-convex-hull.node';
import { createTestContext } from '../test-utils';

describe('AnalysisCurvesCurveConvexHullNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      curve: undefined,
    } as any;
    const params = {
      samples: 100,
    } as any;

    const result = await AnalysisCurvesCurveConvexHullNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
