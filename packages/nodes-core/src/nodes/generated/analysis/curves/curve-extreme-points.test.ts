import { describe, it, expect } from 'vitest';
import { AnalysisCurvesCurveExtremePointsNode } from './curve-extreme-points.node';
import { createTestContext } from '../test-utils';

describe('AnalysisCurvesCurveExtremePointsNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      curve: undefined,
    } as any;
    const params = {
      axis: 'all',
      markPoints: true,
    } as any;

    const result = await AnalysisCurvesCurveExtremePointsNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
