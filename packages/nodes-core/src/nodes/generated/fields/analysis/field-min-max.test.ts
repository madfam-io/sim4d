import { describe, it, expect } from 'vitest';
import { FieldsAnalysisFieldMinMaxNode } from './field-min-max.node';
import { createTestContext } from '../test-utils';

describe('FieldsAnalysisFieldMinMaxNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {} as any;

    const result = await FieldsAnalysisFieldMinMaxNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
