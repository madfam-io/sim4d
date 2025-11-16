import { describe, it, expect } from 'vitest';
import { MathMatrixMatrixMultiplyNode } from './matrix-multiply.node';
import { createTestContext } from '../test-utils';

describe('MathMatrixMatrixMultiplyNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      a: undefined,
      b: undefined,
    } as any;
    const params = {} as any;

    const result = await MathMatrixMatrixMultiplyNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
