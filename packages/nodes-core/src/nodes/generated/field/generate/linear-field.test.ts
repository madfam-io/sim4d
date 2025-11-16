import { describe, it, expect } from 'vitest';
import { FieldGenerateLinearFieldNode } from './linear-field.node';
import { createTestContext } from '../test-utils';

describe('FieldGenerateLinearFieldNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      bounds: undefined,
    } as any;
    const params = {
      direction: [1, 0, 0],
      min: 0,
      max: 1,
    } as any;

    const result = await FieldGenerateLinearFieldNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
