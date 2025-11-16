import { describe, it, expect } from 'vitest';
import { MathRandomRandomNode } from './random.node';
import { createTestContext } from '../test-utils';

describe('MathRandomRandomNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      seed: -1,
    } as any;

    const result = await MathRandomRandomNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
