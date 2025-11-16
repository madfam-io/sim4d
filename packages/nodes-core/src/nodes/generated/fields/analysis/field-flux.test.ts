import { describe, it, expect } from 'vitest';
import { FieldsAnalysisFieldFluxNode } from './field-flux.node';
import { createTestContext } from '../test-utils';

describe('FieldsAnalysisFieldFluxNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      surface: undefined,
    } as any;
    const params = {} as any;

    const result = await FieldsAnalysisFieldFluxNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
