import { describe, it, expect } from 'vitest';
import { FabricationLaserAirAssistNode } from './air-assist.node';
import { createTestContext } from '../test-utils';

describe('FabricationLaserAirAssistNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      material: undefined,
    } as any;
    const params = {
      pressure: 20,
      nozzleType: 'standard',
    } as any;

    const result = await FabricationLaserAirAssistNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
