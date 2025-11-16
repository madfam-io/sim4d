import { describe, it, expect } from 'vitest';
import { MathLogarithmicExp10Node } from './exp10.node';
import { createTestContext } from '../test-utils';

describe('MathLogarithmicExp10Node', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      value: undefined,
    } as any;
    const params = {} as any;

    const result = await MathLogarithmicExp10Node.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
