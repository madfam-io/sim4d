import { describe, it, expect } from 'vitest';
import { MathLogarithmicLogBaseNode } from './log-base.node';
import { createTestContext } from '../test-utils';

describe('MathLogarithmicLogBaseNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      value: undefined,
      base: undefined,
    } as any;
    const params = {} as any;

    const result = await MathLogarithmicLogBaseNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
