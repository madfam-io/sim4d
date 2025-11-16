import { describe, it, expect } from 'vitest';
import { FieldDeformFieldScaleNode } from './field-scale.node';
import { createTestContext } from '../test-utils';

describe('FieldDeformFieldScaleNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      geometry: undefined,
      field: undefined,
    } as any;
    const params = {
      minScale: 0.5,
      maxScale: 2,
    } as any;

    const result = await FieldDeformFieldScaleNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
