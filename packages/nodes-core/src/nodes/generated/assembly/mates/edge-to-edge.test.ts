import { describe, it, expect } from 'vitest';
import { AssemblyMatesEdgeToEdgeNode } from './edge-to-edge.node';
import { createTestContext } from '../test-utils';

describe('AssemblyMatesEdgeToEdgeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      edge1: undefined,
      edge2: undefined,
    } as any;
    const params = {
      alignment: 'aligned',
    } as any;

    const result = await AssemblyMatesEdgeToEdgeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
