import { describe, it, expect } from 'vitest';
import { TransformMoveNode } from './move.node';
import { createTestContext } from '../test-utils';

describe('TransformMoveNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
    } as any;
    const params = {
      x: 0,
      y: 0,
      z: 0,
      copy: true,
    } as any;

    const result = await TransformMoveNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
