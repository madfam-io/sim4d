import { describe, it, expect } from 'vitest';
import { MathInterpolationSpringInterpNode } from './spring-interp.node';
import { createTestContext } from '../test-utils';

describe('MathInterpolationSpringInterpNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      current: undefined,
      target: undefined,
      velocity: undefined,
      deltaTime: undefined,
    } as any;
    const params = {
      stiffness: 100,
      damping: 10,
    } as any;

    const result = await MathInterpolationSpringInterpNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
