import { describe, it, expect } from 'vitest';
import { MathLogarithmicNaturalLogNode } from './natural-log.node';
import { createTestContext } from '../test-utils';

describe('MathLogarithmicNaturalLogNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      value: undefined,
    } as any;
    const params = {} as any;

    const result = await MathLogarithmicNaturalLogNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
