import { describe, it, expect } from 'vitest';
import { FieldsAnalysisFieldDivergenceAnalysisNode } from './field-divergence-analysis.node';
import { createTestContext } from '../test-utils';

describe('FieldsAnalysisFieldDivergenceAnalysisNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {} as any;

    const result = await FieldsAnalysisFieldDivergenceAnalysisNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
