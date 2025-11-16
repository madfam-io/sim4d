import { describe, it, expect } from 'vitest';
import { FieldsAnalysisFieldHistogramNode } from './field-histogram.node';
import { createTestContext } from '../test-utils';

describe('FieldsAnalysisFieldHistogramNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      bins: 20,
    } as any;

    const result = await FieldsAnalysisFieldHistogramNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
