import { describe, it, expect } from 'vitest';
import { AssemblyJointsSphericalNode } from './spherical.node';
import { createTestContext } from '../test-utils';

describe('AssemblyJointsSphericalNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      part1: undefined,
      part2: undefined,
      center: undefined,
    } as any;
    const params = {
      coneAngle: 45,
    } as any;

    const result = await AssemblyJointsSphericalNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
