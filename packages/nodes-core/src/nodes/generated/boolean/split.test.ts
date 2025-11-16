import { describe, it, expect } from 'vitest';
import { BooleanSplitNode } from './split.node';
import { createTestContext } from '../test-utils';

describe('BooleanSplitNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shapes: undefined,
      tools: undefined,
    } as any;
    const params = {
      keepAll: true,
    } as any;

    const result = await BooleanSplitNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
