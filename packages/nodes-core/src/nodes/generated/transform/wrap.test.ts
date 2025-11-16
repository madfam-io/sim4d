import { describe, it, expect } from 'vitest';
import { TransformWrapNode } from './wrap.node';
import { createTestContext } from '../test-utils';

describe('TransformWrapNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
    } as any;
    const params = {
      type: 'cylinder',
      radius: 50,
      angle: 360,
    } as any;

    const result = await TransformWrapNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
