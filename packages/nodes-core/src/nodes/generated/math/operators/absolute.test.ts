import { describe, it, expect } from 'vitest';
import { MathOperatorsAbsoluteNode } from './absolute.node';
import { createTestContext } from '../test-utils';

describe('MathOperatorsAbsoluteNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      value: undefined,
    } as any;
    const params = {} as any;

    const result = await MathOperatorsAbsoluteNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
