import { describe, it, expect } from 'vitest';
import { FeaturesHolesCounterboreHoleNode } from './counterbore-hole.node';
import { createTestContext } from '../test-utils';

describe('FeaturesHolesCounterboreHoleNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      solid: undefined,
      position: undefined,
    } as any;
    const params = {
      holeDiameter: 6.5,
      counterbore: 11,
      cbDepth: 6,
      holeDepth: -1,
    } as any;

    const result = await FeaturesHolesCounterboreHoleNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
