import { describe, it, expect } from 'vitest';
import { FieldDeformFieldRotateNode } from './field-rotate.node';
import { createTestContext } from '../test-utils';

describe('FieldDeformFieldRotateNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      geometry: undefined,
      field: undefined,
    } as any;
    const params = {
      maxAngle: 180,
    } as any;

    const result = await FieldDeformFieldRotateNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
