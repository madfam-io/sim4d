import { describe, it, expect } from 'vitest';
import { AssemblyJointsScrewNode } from './screw.node';
import { createTestContext } from '../test-utils';

describe('AssemblyJointsScrewNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      part1: undefined,
      part2: undefined,
      axis: undefined,
    } as any;
    const params = {
      pitch: 1,
    } as any;

    const result = await AssemblyJointsScrewNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
