import { describe, it, expect } from 'vitest';
import { AnalysisCurvesCurveSpiralNode } from './curve-spiral.node';
import { createTestContext } from '../test-utils';

describe('AnalysisCurvesCurveSpiralNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      curve: undefined,
    } as any;
    const params = {
      tolerance: 0.01,
      showCenter: true,
    } as any;

    const result = await AnalysisCurvesCurveSpiralNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
