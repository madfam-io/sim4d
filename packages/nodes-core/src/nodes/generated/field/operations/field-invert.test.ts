import { describe, it, expect } from 'vitest';
import { FieldOperationsFieldInvertNode } from './field-invert.node';
import { createTestContext } from '../test-utils';

describe('FieldOperationsFieldInvertNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      field: undefined,
    } as any;
    const params = {} as any;

    const result = await FieldOperationsFieldInvertNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
