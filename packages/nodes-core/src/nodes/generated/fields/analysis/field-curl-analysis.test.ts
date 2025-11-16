import { describe, it, expect } from 'vitest';
import { FieldsAnalysisFieldCurlAnalysisNode } from './field-curl-analysis.node';
import { createTestContext } from '../test-utils';

describe('FieldsAnalysisFieldCurlAnalysisNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {} as any;

    const result = await FieldsAnalysisFieldCurlAnalysisNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
