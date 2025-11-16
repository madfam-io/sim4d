import { describe, it, expect } from 'vitest';
import { AssemblyJointsRevoluteNode } from './revolute.node';
import { createTestContext } from '../test-utils';

describe('AssemblyJointsRevoluteNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      part1: undefined,
      part2: undefined,
      axis: undefined,
    } as any;
    const params = {
      minAngle: -180,
      maxAngle: 180,
    } as any;

    const result = await AssemblyJointsRevoluteNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
