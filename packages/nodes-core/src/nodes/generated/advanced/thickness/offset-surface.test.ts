import { describe, it, expect } from 'vitest';
import { AdvancedThicknessOffsetSurfaceNode } from './offset-surface.node';
import { createTestContext } from '../test-utils';

describe('AdvancedThicknessOffsetSurfaceNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
    } as any;
    const params = {
      offset: 5,
      fillGaps: true,
      extend: false,
    } as any;

    const result = await AdvancedThicknessOffsetSurfaceNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
