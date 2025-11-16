import { describe, it, expect } from 'vitest';
import { MathRoundingTruncateNode } from './truncate.node';
import { createTestContext } from '../test-utils';

describe('MathRoundingTruncateNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      value: undefined,
    } as any;
    const params = {} as any;

    const result = await MathRoundingTruncateNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
