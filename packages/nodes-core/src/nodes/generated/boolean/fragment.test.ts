import { describe, it, expect } from 'vitest';
import { BooleanFragmentNode } from './fragment.node';
import { createTestContext } from '../test-utils';

describe('BooleanFragmentNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shapes: undefined,
    } as any;
    const params = {} as any;

    const result = await BooleanFragmentNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
