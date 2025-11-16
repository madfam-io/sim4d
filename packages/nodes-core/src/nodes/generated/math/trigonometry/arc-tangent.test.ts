import { describe, it, expect } from 'vitest';
import { MathTrigonometryArcTangentNode } from './arc-tangent.node';
import { createTestContext } from '../test-utils';

describe('MathTrigonometryArcTangentNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      value: undefined,
    } as any;
    const params = {
      angleUnit: 'radians',
    } as any;

    const result = await MathTrigonometryArcTangentNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
