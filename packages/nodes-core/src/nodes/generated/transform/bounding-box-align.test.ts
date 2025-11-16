import { describe, it, expect } from 'vitest';
import { TransformBoundingBoxAlignNode } from './bounding-box-align.node';
import { createTestContext } from '../test-utils';

describe('TransformBoundingBoxAlignNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
    } as any;
    const params = {
      alignToOrigin: true,
      alignCorner: 'min',
    } as any;

    const result = await TransformBoundingBoxAlignNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
