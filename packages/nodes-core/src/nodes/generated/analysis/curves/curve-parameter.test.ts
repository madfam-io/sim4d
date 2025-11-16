import { describe, it, expect } from 'vitest';
import { AnalysisCurvesCurveParameterNode } from './curve-parameter.node';
import { createTestContext } from '../test-utils';

describe('AnalysisCurvesCurveParameterNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      curve: undefined,
    } as any;
    const params = {
      samples: 50,
      showParameter: true,
    } as any;

    const result = await AnalysisCurvesCurveParameterNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
