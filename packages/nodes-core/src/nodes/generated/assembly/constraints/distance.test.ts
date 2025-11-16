import { describe, it, expect } from 'vitest';
import { AssemblyConstraintsDistanceNode } from './distance.node';
import { createTestContext } from '../test-utils';

describe('AssemblyConstraintsDistanceNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      entity1: undefined,
      entity2: undefined,
    } as any;
    const params = {
      distance: 10,
      minimum: false,
    } as any;

    const result = await AssemblyConstraintsDistanceNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
