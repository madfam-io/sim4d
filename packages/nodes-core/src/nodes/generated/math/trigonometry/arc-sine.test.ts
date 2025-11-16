import { describe, it, expect } from 'vitest';
import { MathTrigonometryArcSineNode } from './arc-sine.node';
import { createTestContext } from '../test-utils';

describe('MathTrigonometryArcSineNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      value: undefined,
    } as any;
    const params = {
      angleUnit: 'radians',
    } as any;

    const result = await MathTrigonometryArcSineNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
