import { describe, it, expect } from 'vitest';
import { MathTrigonometryArcCosineNode } from './arc-cosine.node';
import { createTestContext } from '../test-utils';

describe('MathTrigonometryArcCosineNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      value: undefined,
    } as any;
    const params = {
      angleUnit: 'radians',
    } as any;

    const result = await MathTrigonometryArcCosineNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
