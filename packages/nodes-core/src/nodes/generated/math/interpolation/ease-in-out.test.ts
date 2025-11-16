import { describe, it, expect } from 'vitest';
import { MathInterpolationEaseInOutNode } from './ease-in-out.node';
import { createTestContext } from '../test-utils';

describe('MathInterpolationEaseInOutNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      t: undefined,
    } as any;
    const params = {
      power: 2,
    } as any;

    const result = await MathInterpolationEaseInOutNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
