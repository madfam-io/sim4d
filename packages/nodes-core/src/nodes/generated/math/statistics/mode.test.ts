import { describe, it, expect } from 'vitest';
import { MathStatisticsModeNode } from './mode.node';
import { createTestContext } from '../test-utils';

describe('MathStatisticsModeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      values: undefined,
    } as any;
    const params = {} as any;

    const result = await MathStatisticsModeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
