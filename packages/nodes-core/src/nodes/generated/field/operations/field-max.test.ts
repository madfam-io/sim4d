import { describe, it, expect } from 'vitest';
import { FieldOperationsFieldMaxNode } from './field-max.node';
import { createTestContext } from '../test-utils';

describe('FieldOperationsFieldMaxNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      fields: undefined,
    } as any;
    const params = {} as any;

    const result = await FieldOperationsFieldMaxNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
