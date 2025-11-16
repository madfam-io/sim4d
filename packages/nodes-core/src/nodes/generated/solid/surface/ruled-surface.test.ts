import { describe, it, expect } from 'vitest';
import { SolidSurfaceRuledSurfaceNode } from './ruled-surface.node';
import { createTestContext } from '../test-utils';

describe('SolidSurfaceRuledSurfaceNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      curve1: undefined,
      curve2: undefined,
    } as any;
    const params = {} as any;

    const result = await SolidSurfaceRuledSurfaceNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
