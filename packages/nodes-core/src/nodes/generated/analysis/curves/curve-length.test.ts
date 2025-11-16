import { describe, it, expect } from 'vitest';
import { AnalysisCurvesCurveLengthNode } from './curve-length.node';
import { createTestContext } from '../test-utils';

describe('AnalysisCurvesCurveLengthNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      curve: undefined,
    } as any;
    const params = {
      tolerance: 0.01,
      segments: 100,
    } as any;

    const result = await AnalysisCurvesCurveLengthNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
