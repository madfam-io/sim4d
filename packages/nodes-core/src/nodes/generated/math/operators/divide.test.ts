import { describe, it, expect } from 'vitest';
import { MathOperatorsDivideNode } from './divide.node';
import { createTestContext } from '../test-utils';

describe('MathOperatorsDivideNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      a: undefined,
      b: undefined,
    } as any;
    const params = {} as any;

    const result = await MathOperatorsDivideNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
