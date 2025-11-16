import { describe, it, expect } from 'vitest';
import { FieldsAdvancedFieldMorphingNode } from './field-morphing.node';
import { createTestContext } from '../test-utils';

describe('FieldsAdvancedFieldMorphingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      factor: 0.5,
      interpolation: '"linear"',
    } as any;

    const result = await FieldsAdvancedFieldMorphingNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
