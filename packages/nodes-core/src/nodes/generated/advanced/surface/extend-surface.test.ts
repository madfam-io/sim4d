import { describe, it, expect } from 'vitest';
import { AdvancedSurfaceExtendSurfaceNode } from './extend-surface.node';
import { createTestContext } from '../test-utils';

describe('AdvancedSurfaceExtendSurfaceNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      surface: undefined,
      edges: undefined,
    } as any;
    const params = {
      extensionLength: 10,
      extensionType: 'natural',
    } as any;

    const result = await AdvancedSurfaceExtendSurfaceNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
