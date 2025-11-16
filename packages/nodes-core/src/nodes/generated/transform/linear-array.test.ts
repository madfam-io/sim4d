import { describe, it, expect } from 'vitest';
import { TransformLinearArrayNode } from './linear-array.node';
import { createTestContext } from '../test-utils';

describe('TransformLinearArrayNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
    } as any;
    const params = {
      count: 5,
      spacingX: 100,
      spacingY: 0,
      spacingZ: 0,
      merge: false,
    } as any;

    const result = await TransformLinearArrayNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
