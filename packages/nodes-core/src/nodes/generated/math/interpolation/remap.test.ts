import { describe, it, expect } from 'vitest';
import { MathInterpolationRemapNode } from './remap.node';
import { createTestContext } from '../test-utils';

describe('MathInterpolationRemapNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      value: undefined,
      fromMin: undefined,
      fromMax: undefined,
      toMin: undefined,
      toMax: undefined,
    } as any;
    const params = {} as any;

    const result = await MathInterpolationRemapNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
