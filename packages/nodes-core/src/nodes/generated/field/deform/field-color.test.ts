import { describe, it, expect } from 'vitest';
import { FieldDeformFieldColorNode } from './field-color.node';
import { createTestContext } from '../test-utils';

describe('FieldDeformFieldColorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      mesh: undefined,
      field: undefined,
    } as any;
    const params = {
      gradient: 'rainbow',
    } as any;

    const result = await FieldDeformFieldColorNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
