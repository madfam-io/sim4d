import { describe, it, expect } from 'vitest';
import { FieldOperationsFieldSubtractNode } from './field-subtract.node';
import { createTestContext } from '../test-utils';

describe('FieldOperationsFieldSubtractNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      fieldA: undefined,
      fieldB: undefined,
    } as any;
    const params = {} as any;

    const result = await FieldOperationsFieldSubtractNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
