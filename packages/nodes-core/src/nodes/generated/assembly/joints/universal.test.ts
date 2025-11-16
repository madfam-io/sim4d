import { describe, it, expect } from 'vitest';
import { AssemblyJointsUniversalNode } from './universal.node';
import { createTestContext } from '../test-utils';

describe('AssemblyJointsUniversalNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      part1: undefined,
      part2: undefined,
      center: undefined,
    } as any;
    const params = {} as any;

    const result = await AssemblyJointsUniversalNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
