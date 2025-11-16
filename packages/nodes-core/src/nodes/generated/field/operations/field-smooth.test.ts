import { describe, it, expect } from 'vitest';
import { FieldOperationsFieldSmoothNode } from './field-smooth.node';
import { createTestContext } from '../test-utils';

describe('FieldOperationsFieldSmoothNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      field: undefined,
    } as any;
    const params = {
      iterations: 3,
      factor: 0.5,
    } as any;

    const result = await FieldOperationsFieldSmoothNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
