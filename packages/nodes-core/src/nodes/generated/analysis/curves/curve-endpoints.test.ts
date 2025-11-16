import { describe, it, expect } from 'vitest';
import { AnalysisCurvesCurveEndpointsNode } from './curve-endpoints.node';
import { createTestContext } from '../test-utils';

describe('AnalysisCurvesCurveEndpointsNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      curve: undefined,
    } as any;
    const params = {
      tangentLength: 10,
      showTangents: true,
    } as any;

    const result = await AnalysisCurvesCurveEndpointsNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
