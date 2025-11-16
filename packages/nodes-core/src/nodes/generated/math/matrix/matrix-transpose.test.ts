import { describe, it, expect } from 'vitest';
import { MathMatrixMatrixTransposeNode } from './matrix-transpose.node';
import { createTestContext } from '../test-utils';

describe('MathMatrixMatrixTransposeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      matrix: undefined,
    } as any;
    const params = {} as any;

    const result = await MathMatrixMatrixTransposeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
