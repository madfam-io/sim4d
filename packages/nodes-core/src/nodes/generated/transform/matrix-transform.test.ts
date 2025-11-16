import { describe, it, expect } from 'vitest';
import { TransformMatrixTransformNode } from './matrix-transform.node';
import { createTestContext } from '../test-utils';

describe('TransformMatrixTransformNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
      matrix: undefined,
    } as any;
    const params = {} as any;

    const result = await TransformMatrixTransformNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
