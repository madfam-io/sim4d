import { describe, it, expect } from 'vitest';
import { AnalysisCurvesCurveAreaMomentsNode } from './curve-area-moments.node';
import { createTestContext } from '../test-utils';

describe('AnalysisCurvesCurveAreaMomentsNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      curve: undefined,
    } as any;
    const params = {
      precision: 0.01,
      showCentroid: true,
    } as any;

    const result = await AnalysisCurvesCurveAreaMomentsNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
