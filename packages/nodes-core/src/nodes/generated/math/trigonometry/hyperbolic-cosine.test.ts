import { describe, it, expect } from 'vitest';
import { MathTrigonometryHyperbolicCosineNode } from './hyperbolic-cosine.node';
import { createTestContext } from '../test-utils';

describe('MathTrigonometryHyperbolicCosineNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      value: undefined,
    } as any;
    const params = {} as any;

    const result = await MathTrigonometryHyperbolicCosineNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
