import { describe, it, expect } from 'vitest';
import { FieldOperationsFieldClampNode } from './field-clamp.node';
import { createTestContext } from '../test-utils';

describe('FieldOperationsFieldClampNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      field: undefined,
    } as any;
    const params = {
      min: 0,
      max: 1,
    } as any;

    const result = await FieldOperationsFieldClampNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
