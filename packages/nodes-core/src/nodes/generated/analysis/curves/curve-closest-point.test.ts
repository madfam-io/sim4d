import { describe, it, expect } from 'vitest';
import { AnalysisCurvesCurveClosestPointNode } from './curve-closest-point.node';
import { createTestContext } from '../test-utils';

describe('AnalysisCurvesCurveClosestPointNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      curve: undefined,
      point: undefined,
    } as any;
    const params = {
      tolerance: 0.01,
      showConnection: true,
    } as any;

    const result = await AnalysisCurvesCurveClosestPointNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
