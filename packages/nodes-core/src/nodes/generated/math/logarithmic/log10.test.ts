import { describe, it, expect } from 'vitest';
import { MathLogarithmicLog10Node } from './log10.node';
import { createTestContext } from '../test-utils';

describe('MathLogarithmicLog10Node', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      value: undefined,
    } as any;
    const params = {} as any;

    const result = await MathLogarithmicLog10Node.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
