import { describe, it, expect } from 'vitest';
import { MathComplexComplexMagnitudeNode } from './complex-magnitude.node';
import { createTestContext } from '../test-utils';

describe('MathComplexComplexMagnitudeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      complex: undefined,
    } as any;
    const params = {} as any;

    const result = await MathComplexComplexMagnitudeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
