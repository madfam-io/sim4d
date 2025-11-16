import { describe, it, expect } from 'vitest';
import { FieldsAnalysisFieldPotentialNode } from './field-potential.node';
import { createTestContext } from '../test-utils';

describe('FieldsAnalysisFieldPotentialNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      referencePoint: '[0, 0, 0]',
    } as any;

    const result = await FieldsAnalysisFieldPotentialNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
