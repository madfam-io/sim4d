import { describe, it, expect } from 'vitest';
import { MathTrigonometryTangentNode } from './tangent.node';
import { createTestContext } from '../test-utils';

describe('MathTrigonometryTangentNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      angle: undefined,
    } as any;
    const params = {
      angleUnit: 'radians',
    } as any;

    const result = await MathTrigonometryTangentNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
