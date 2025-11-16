import { describe, it, expect } from 'vitest';
import { FieldOperationsFieldDivergenceNode } from './field-divergence.node';
import { createTestContext } from '../test-utils';

describe('FieldOperationsFieldDivergenceNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      field: undefined,
    } as any;
    const params = {} as any;

    const result = await FieldOperationsFieldDivergenceNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
