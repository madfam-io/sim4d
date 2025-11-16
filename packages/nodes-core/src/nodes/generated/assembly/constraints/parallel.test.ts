import { describe, it, expect } from 'vitest';
import { AssemblyConstraintsParallelNode } from './parallel.node';
import { createTestContext } from '../test-utils';

describe('AssemblyConstraintsParallelNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      entity1: undefined,
      entity2: undefined,
    } as any;
    const params = {
      offset: 0,
      flip: false,
    } as any;

    const result = await AssemblyConstraintsParallelNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
