import { describe, it, expect } from 'vitest';
import { FieldOperationsFieldBlendNode } from './field-blend.node';
import { createTestContext } from '../test-utils';

describe('FieldOperationsFieldBlendNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      fieldA: undefined,
      fieldB: undefined,
      factor: undefined,
    } as any;
    const params = {
      mode: 'linear',
    } as any;

    const result = await FieldOperationsFieldBlendNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
