import { describe, it, expect } from 'vitest';
import { FabricationLaserKerfBendingNode } from './kerf-bending.node';
import { createTestContext } from '../test-utils';

describe('FabricationLaserKerfBendingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      bendZone: undefined,
    } as any;
    const params = {
      bendRadius: 50,
      materialThickness: 3,
      kerfWidth: 0.15,
    } as any;

    const result = await FabricationLaserKerfBendingNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
