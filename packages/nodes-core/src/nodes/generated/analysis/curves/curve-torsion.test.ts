import { describe, it, expect } from 'vitest';
import { AnalysisCurvesCurveTorsionNode } from './curve-torsion.node';
import { createTestContext } from '../test-utils';

describe('AnalysisCurvesCurveTorsionNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      curve: undefined,
    } as any;
    const params = {
      samples: 100,
      scale: 1,
      showGraph: true,
    } as any;

    const result = await AnalysisCurvesCurveTorsionNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
