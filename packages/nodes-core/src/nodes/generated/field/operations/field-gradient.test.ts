import { describe, it, expect } from 'vitest';
import { FieldOperationsFieldGradientNode } from './field-gradient.node';
import { createTestContext } from '../test-utils';

describe('FieldOperationsFieldGradientNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      field: undefined,
    } as any;
    const params = {} as any;

    const result = await FieldOperationsFieldGradientNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
