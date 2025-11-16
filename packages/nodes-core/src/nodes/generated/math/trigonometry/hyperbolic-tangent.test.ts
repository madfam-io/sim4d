import { describe, it, expect } from 'vitest';
import { MathTrigonometryHyperbolicTangentNode } from './hyperbolic-tangent.node';
import { createTestContext } from '../test-utils';

describe('MathTrigonometryHyperbolicTangentNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      value: undefined,
    } as any;
    const params = {} as any;

    const result = await MathTrigonometryHyperbolicTangentNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
