import { describe, it, expect } from 'vitest';
import { MathTrigonometryHyperbolicSineNode } from './hyperbolic-sine.node';
import { createTestContext } from '../test-utils';

describe('MathTrigonometryHyperbolicSineNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      value: undefined,
    } as any;
    const params = {} as any;

    const result = await MathTrigonometryHyperbolicSineNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
