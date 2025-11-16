import { describe, it, expect } from 'vitest';
import { FieldOperationsFieldLaplacianNode } from './field-laplacian.node';
import { createTestContext } from '../test-utils';

describe('FieldOperationsFieldLaplacianNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      field: undefined,
    } as any;
    const params = {} as any;

    const result = await FieldOperationsFieldLaplacianNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
