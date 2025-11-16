import { describe, it, expect } from 'vitest';
import { FieldOperationsFieldAddNode } from './field-add.node';
import { createTestContext } from '../test-utils';

describe('FieldOperationsFieldAddNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      fieldA: undefined,
      fieldB: undefined,
    } as any;
    const params = {} as any;

    const result = await FieldOperationsFieldAddNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
