import { describe, it, expect } from 'vitest';
import { MathComplexComplexAddNode } from './complex-add.node';
import { createTestContext } from '../test-utils';

describe('MathComplexComplexAddNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      a: undefined,
      b: undefined,
    } as any;
    const params = {} as any;

    const result = await MathComplexComplexAddNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
