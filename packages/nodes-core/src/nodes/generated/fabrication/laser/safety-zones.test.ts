import { describe, it, expect } from 'vitest';
import { FabricationLaserSafetyZonesNode } from './safety-zones.node';
import { createTestContext } from '../test-utils';

describe('FabricationLaserSafetyZonesNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      workArea: undefined,
    } as any;
    const params = {
      margin: 5,
    } as any;

    const result = await FabricationLaserSafetyZonesNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
