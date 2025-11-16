import { describe, it, expect } from 'vitest';
import { MathRandomRandomRangeNode } from './random-range.node';
import { createTestContext } from '../test-utils';

describe('MathRandomRandomRangeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      min: undefined,
      max: undefined,
    } as any;
    const params = {
      seed: -1,
    } as any;

    const result = await MathRandomRandomRangeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
