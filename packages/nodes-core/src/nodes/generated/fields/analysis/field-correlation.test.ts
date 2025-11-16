import { describe, it, expect } from 'vitest';
import { FieldsAnalysisFieldCorrelationNode } from './field-correlation.node';
import { createTestContext } from '../test-utils';

describe('FieldsAnalysisFieldCorrelationNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      sampleCount: 1000,
    } as any;

    const result = await FieldsAnalysisFieldCorrelationNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
