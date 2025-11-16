import { describe, it, expect } from 'vitest';
import { FieldOperationsFieldCurlNode } from './field-curl.node';
import { createTestContext } from '../test-utils';

describe('FieldOperationsFieldCurlNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      field: undefined,
    } as any;
    const params = {} as any;

    const result = await FieldOperationsFieldCurlNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
