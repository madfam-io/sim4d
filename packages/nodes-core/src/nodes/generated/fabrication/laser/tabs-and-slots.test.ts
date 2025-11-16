import { describe, it, expect } from 'vitest';
import { FabricationLaserTabsAndSlotsNode } from './tabs-and-slots.node';
import { createTestContext } from '../test-utils';

describe('FabricationLaserTabsAndSlotsNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      edges: undefined,
    } as any;
    const params = {
      tabWidth: 10,
      tabDepth: 5,
      clearance: 0.1,
    } as any;

    const result = await FabricationLaserTabsAndSlotsNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
