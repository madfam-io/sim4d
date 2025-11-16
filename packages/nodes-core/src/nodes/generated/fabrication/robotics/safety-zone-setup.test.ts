import { describe, it, expect } from 'vitest';
import { FabricationRoboticsSafetyZoneSetupNode } from './safety-zone-setup.node';
import { createTestContext } from '../test-utils';

describe('FabricationRoboticsSafetyZoneSetupNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      zones: undefined,
    } as any;
    const params = {
      zoneType: 'slow',
      responseTime: 0.5,
    } as any;

    const result = await FabricationRoboticsSafetyZoneSetupNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
