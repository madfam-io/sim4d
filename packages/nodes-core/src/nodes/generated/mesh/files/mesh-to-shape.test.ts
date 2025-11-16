import { describe, it, expect } from 'vitest';
import { MeshFilesMeshToShapeNode } from './mesh-to-shape.node';
import { createTestContext } from '../test-utils';

describe('MeshFilesMeshToShapeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      mesh: undefined,
    } as any;
    const params = {
      tolerance: 0.01,
      sewFaces: true,
    } as any;

    const result = await MeshFilesMeshToShapeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
