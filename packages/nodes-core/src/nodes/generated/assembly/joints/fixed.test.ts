import { describe, it, expect } from 'vitest';
import { AssemblyJointsFixedNode } from './fixed.node';
import { createTestContext } from '../test-utils';

describe('AssemblyJointsFixedNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      part1: undefined,
      part2: undefined,
    } as any;
    const params = {} as any;

    const result = await AssemblyJointsFixedNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
