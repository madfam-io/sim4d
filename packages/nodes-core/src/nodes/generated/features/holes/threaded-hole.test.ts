import { describe, it, expect } from 'vitest';
import { FeaturesHolesThreadedHoleNode } from './threaded-hole.node';
import { createTestContext } from '../test-utils';

describe('FeaturesHolesThreadedHoleNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      solid: undefined,
      position: undefined,
    } as any;
    const params = {
      threadSize: 'M6',
      pitch: 1,
      depth: 20,
      threadClass: '6H',
    } as any;

    const result = await FeaturesHolesThreadedHoleNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
