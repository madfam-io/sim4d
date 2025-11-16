import { describe, it, expect } from 'vitest';
import { MathRoundingRoundNode } from './round.node';
import { createTestContext } from '../test-utils';

describe('MathRoundingRoundNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      value: undefined,
    } as any;
    const params = {} as any;

    const result = await MathRoundingRoundNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
