import { describe, it, expect } from 'vitest';
import { AssemblyJointsPlanarNode } from './planar.node';
import { createTestContext } from '../test-utils';

describe('AssemblyJointsPlanarNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      part1: undefined,
      part2: undefined,
      plane: undefined,
    } as any;
    const params = {} as any;

    const result = await AssemblyJointsPlanarNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
