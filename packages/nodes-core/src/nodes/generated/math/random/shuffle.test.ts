import { describe, it, expect } from 'vitest';
import { MathRandomShuffleNode } from './shuffle.node';
import { createTestContext } from '../test-utils';

describe('MathRandomShuffleNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      list: undefined,
    } as any;
    const params = {
      seed: -1,
    } as any;

    const result = await MathRandomShuffleNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
