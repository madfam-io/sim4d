import { describe, it, expect } from 'vitest';
import { FieldsAnalysisFieldAverageNode } from './field-average.node';
import { createTestContext } from '../test-utils';

describe('FieldsAnalysisFieldAverageNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      sampleCount: 1000,
    } as any;

    const result = await FieldsAnalysisFieldAverageNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
