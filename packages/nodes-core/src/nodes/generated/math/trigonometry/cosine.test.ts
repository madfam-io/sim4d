import { describe, it, expect } from 'vitest';
import { MathTrigonometryCosineNode } from './cosine.node';
import { createTestContext } from '../test-utils';

describe('MathTrigonometryCosineNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      angle: undefined,
    } as any;
    const params = {
      angleUnit: 'radians',
    } as any;

    const result = await MathTrigonometryCosineNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
