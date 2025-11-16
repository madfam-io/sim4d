import { describe, it, expect } from 'vitest';
import { FieldOperationsFieldMultiplyNode } from './field-multiply.node';
import { createTestContext } from '../test-utils';

describe('FieldOperationsFieldMultiplyNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      fieldA: undefined,
      fieldB: undefined,
    } as any;
    const params = {} as any;

    const result = await FieldOperationsFieldMultiplyNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
