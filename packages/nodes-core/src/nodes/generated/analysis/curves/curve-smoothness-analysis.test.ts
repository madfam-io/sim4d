import { describe, it, expect } from 'vitest';
import { AnalysisCurvesCurveSmoothnessAnalysisNode } from './curve-smoothness-analysis.node';
import { createTestContext } from '../test-utils';

describe('AnalysisCurvesCurveSmoothnessAnalysisNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      curve: undefined,
    } as any;
    const params = {
      continuityLevel: 'G2',
      tolerance: 0.01,
      showBreaks: true,
    } as any;

    const result = await AnalysisCurvesCurveSmoothnessAnalysisNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
