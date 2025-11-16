import { describe, it, expect } from 'vitest';
import { MathOperatorsSquareRootNode } from './square-root.node';
import { createTestContext } from '../test-utils';

describe('MathOperatorsSquareRootNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      value: undefined,
    } as any;
    const params = {} as any;

    const result = await MathOperatorsSquareRootNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
