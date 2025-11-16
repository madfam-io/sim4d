import { describe, it, expect } from 'vitest';
import { MathComplexComplexPhaseNode } from './complex-phase.node';
import { createTestContext } from '../test-utils';

describe('MathComplexComplexPhaseNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      complex: undefined,
    } as any;
    const params = {} as any;

    const result = await MathComplexComplexPhaseNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
