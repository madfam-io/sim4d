import { describe, it, expect } from 'vitest';
import { MathTrigonometryArcTangent2Node } from './arc-tangent2.node';
import { createTestContext } from '../test-utils';

describe('MathTrigonometryArcTangent2Node', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      y: undefined,
      x: undefined,
    } as any;
    const params = {
      angleUnit: 'radians',
    } as any;

    const result = await MathTrigonometryArcTangent2Node.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
