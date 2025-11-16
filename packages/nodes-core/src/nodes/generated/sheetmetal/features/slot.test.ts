import { describe, it, expect } from 'vitest';
import { SheetMetalFeaturesSlotNode } from './slot.node';
import { createTestContext } from '../test-utils';

describe('SheetMetalFeaturesSlotNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      sheet: undefined,
      edge: undefined,
      position: undefined,
    } as any;
    const params = {
      slotWidth: 20,
      slotDepth: 10,
      clearance: 0.2,
    } as any;

    const result = await SheetMetalFeaturesSlotNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
