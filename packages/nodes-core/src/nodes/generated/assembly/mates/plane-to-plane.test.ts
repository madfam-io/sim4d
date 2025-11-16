import { describe, it, expect } from 'vitest';
import { AssemblyMatesPlaneToPlaneNode } from './plane-to-plane.node';
import { createTestContext } from '../test-utils';

describe('AssemblyMatesPlaneToPlaneNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      plane1: undefined,
      plane2: undefined,
    } as any;
    const params = {
      distance: 0,
      parallel: true,
    } as any;

    const result = await AssemblyMatesPlaneToPlaneNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
