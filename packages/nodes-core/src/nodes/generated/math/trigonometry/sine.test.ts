import { describe, it, expect } from 'vitest';
import { MathTrigonometrySineNode } from './sine.node';
import { createTestContext } from '../test-utils';

describe('MathTrigonometrySineNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      angle: undefined,
    } as any;
    const params = {
      angleUnit: 'radians',
    } as any;

    const result = await MathTrigonometrySineNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
