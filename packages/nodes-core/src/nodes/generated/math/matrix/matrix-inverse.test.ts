import { describe, it, expect } from 'vitest';
import { MathMatrixMatrixInverseNode } from './matrix-inverse.node';
import { createTestContext } from '../test-utils';

describe('MathMatrixMatrixInverseNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      matrix: undefined,
    } as any;
    const params = {} as any;

    const result = await MathMatrixMatrixInverseNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
