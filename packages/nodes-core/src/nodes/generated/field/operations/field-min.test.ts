import { describe, it, expect } from 'vitest';
import { FieldOperationsFieldMinNode } from './field-min.node';
import { createTestContext } from '../test-utils';

describe('FieldOperationsFieldMinNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      fields: undefined,
    } as any;
    const params = {} as any;

    const result = await FieldOperationsFieldMinNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
