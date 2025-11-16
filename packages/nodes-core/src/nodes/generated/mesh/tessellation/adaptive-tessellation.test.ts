import { describe, it, expect } from 'vitest';
import { MeshTessellationAdaptiveTessellationNode } from './adaptive-tessellation.node';
import { createTestContext } from '../test-utils';

describe('MeshTessellationAdaptiveTessellationNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
    } as any;
    const params = {
      minEdgeLength: 0.1,
      maxEdgeLength: 10,
      curvatureFactor: 1,
    } as any;

    const result = await MeshTessellationAdaptiveTessellationNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
