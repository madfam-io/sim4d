import { describe, it, expect } from 'vitest';
import { FieldsAnalysisFieldCirculationNode } from './field-circulation.node';
import { createTestContext } from '../test-utils';

describe('FieldsAnalysisFieldCirculationNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      curve: undefined,
    } as any;
    const params = {} as any;

    const result = await FieldsAnalysisFieldCirculationNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
