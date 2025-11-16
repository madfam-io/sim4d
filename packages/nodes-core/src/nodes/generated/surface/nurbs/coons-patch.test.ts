import { describe, it, expect } from 'vitest';
import { SurfaceNURBSCoonsPatchNode } from './coons-patch.node';
import { createTestContext } from '../test-utils';

describe('SurfaceNURBSCoonsPatchNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      edge1: undefined,
      edge2: undefined,
      edge3: undefined,
      edge4: undefined,
    } as any;
    const params = {} as any;

    const result = await SurfaceNURBSCoonsPatchNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
