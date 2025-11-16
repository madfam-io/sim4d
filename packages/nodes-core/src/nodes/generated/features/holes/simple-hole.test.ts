import { describe, it, expect } from 'vitest';
import { FeaturesHolesSimpleHoleNode } from './simple-hole.node';
import { createTestContext } from '../test-utils';

describe('FeaturesHolesSimpleHoleNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      solid: undefined,
      position: undefined,
    } as any;
    const params = {
      diameter: 10,
      depth: -1,
    } as any;

    const result = await FeaturesHolesSimpleHoleNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
