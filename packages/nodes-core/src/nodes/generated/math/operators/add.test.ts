import { describe, it, expect } from 'vitest';
import { MathOperatorsAddNode } from './add.node';
import { createTestContext } from '../test-utils';

describe('MathOperatorsAddNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      a: undefined,
      b: undefined,
    } as any;
    const params = {} as any;

    const result = await MathOperatorsAddNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
