import { describe, it, expect } from 'vitest';
import { FeaturesHolesCountersinkHoleNode } from './countersink-hole.node';
import { createTestContext } from '../test-utils';

describe('FeaturesHolesCountersinkHoleNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      solid: undefined,
      position: undefined,
    } as any;
    const params = {
      holeDiameter: 6.5,
      countersinkDiameter: 12,
      angle: '90',
      depth: -1,
    } as any;

    const result = await FeaturesHolesCountersinkHoleNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
