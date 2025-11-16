import { describe, it, expect } from 'vitest';
import { BooleanCompoundNode } from './compound.node';
import { createTestContext } from '../test-utils';

describe('BooleanCompoundNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shapes: undefined,
    } as any;
    const params = {} as any;

    const result = await BooleanCompoundNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
