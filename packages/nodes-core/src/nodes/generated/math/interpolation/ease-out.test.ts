import { describe, it, expect } from 'vitest';
import { MathInterpolationEaseOutNode } from './ease-out.node';
import { createTestContext } from '../test-utils';

describe('MathInterpolationEaseOutNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      t: undefined,
    } as any;
    const params = {
      power: 2,
    } as any;

    const result = await MathInterpolationEaseOutNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
