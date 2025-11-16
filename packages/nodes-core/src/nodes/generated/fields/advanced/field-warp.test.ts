import { describe, it, expect } from 'vitest';
import { FieldsAdvancedFieldWarpNode } from './field-warp.node';
import { createTestContext } from '../test-utils';

describe('FieldsAdvancedFieldWarpNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      deformation: undefined,
    } as any;
    const params = {
      strength: 1,
    } as any;

    const result = await FieldsAdvancedFieldWarpNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
