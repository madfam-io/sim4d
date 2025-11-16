import { describe, it, expect } from 'vitest';
import { FabricationLaserTextEngravingNode } from './text-engraving.node';
import { createTestContext } from '../test-utils';

describe('FabricationLaserTextEngravingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      text: undefined,
      position: undefined,
    } as any;
    const params = {
      font: 'single-line',
      height: 10,
    } as any;

    const result = await FabricationLaserTextEngravingNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
