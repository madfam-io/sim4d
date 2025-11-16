import { describe, it, expect } from 'vitest';
import { Fabrication3DPrintingWipeTowerNode } from './wipe-tower.node';
import { createTestContext } from '../test-utils';

describe('Fabrication3DPrintingWipeTowerNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      printHeight: undefined,
    } as any;
    const params = {
      towerWidth: 60,
      wipeVolume: 15,
    } as any;

    const result = await Fabrication3DPrintingWipeTowerNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
