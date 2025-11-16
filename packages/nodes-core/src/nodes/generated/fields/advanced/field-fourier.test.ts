import { describe, it, expect } from 'vitest';
import { FieldsAdvancedFieldFourierNode } from './field-fourier.node';
import { createTestContext } from '../test-utils';

describe('FieldsAdvancedFieldFourierNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      direction: '"forward"',
    } as any;

    const result = await FieldsAdvancedFieldFourierNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
