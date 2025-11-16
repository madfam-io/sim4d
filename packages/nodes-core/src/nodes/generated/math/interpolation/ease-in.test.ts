import { describe, it, expect } from 'vitest';
import { MathInterpolationEaseInNode } from './ease-in.node';
import { createTestContext } from '../test-utils';

describe('MathInterpolationEaseInNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      t: undefined,
    } as any;
    const params = {
      power: 2,
    } as any;

    const result = await MathInterpolationEaseInNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
