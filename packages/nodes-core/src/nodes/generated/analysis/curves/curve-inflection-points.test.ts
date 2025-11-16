import { describe, it, expect } from 'vitest';
import { AnalysisCurvesCurveInflectionPointsNode } from './curve-inflection-points.node';
import { createTestContext } from '../test-utils';

describe('AnalysisCurvesCurveInflectionPointsNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      curve: undefined,
    } as any;
    const params = {
      tolerance: 0.01,
      markPoints: true,
    } as any;

    const result = await AnalysisCurvesCurveInflectionPointsNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
