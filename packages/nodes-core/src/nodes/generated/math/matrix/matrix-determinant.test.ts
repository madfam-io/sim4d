import { describe, it, expect } from 'vitest';
import { MathMatrixMatrixDeterminantNode } from './matrix-determinant.node';
import { createTestContext } from '../test-utils';

describe('MathMatrixMatrixDeterminantNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      matrix: undefined,
    } as any;
    const params = {} as any;

    const result = await MathMatrixMatrixDeterminantNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
