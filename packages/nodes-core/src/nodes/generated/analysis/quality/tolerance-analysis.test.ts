import { describe, it, expect } from 'vitest';
import { AnalysisQualityToleranceAnalysisNode } from './tolerance-analysis.node';
import { createTestContext } from '../test-utils';

describe('AnalysisQualityToleranceAnalysisNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      measured: undefined,
      nominal: undefined,
    } as any;
    const params = {
      nominalTolerance: 0.1,
      showDeviations: true,
    } as any;

    const result = await AnalysisQualityToleranceAnalysisNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
