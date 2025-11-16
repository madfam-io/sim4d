import { describe, it, expect } from 'vitest';
import { BooleanXORNode } from './xor.node';
import { createTestContext } from '../test-utils';

describe('BooleanXORNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shapes: undefined,
    } as any;
    const params = {
      keepOriginals: false,
      fuzzyValue: 1e-7,
    } as any;

    const result = await BooleanXORNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
