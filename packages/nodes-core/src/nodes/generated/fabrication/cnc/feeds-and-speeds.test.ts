import { describe, it, expect } from 'vitest';
import { FabricationCNCFeedsAndSpeedsNode } from './feeds-and-speeds.node';
import { createTestContext } from '../test-utils';

describe('FabricationCNCFeedsAndSpeedsNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      material: 'aluminum',
      toolMaterial: 'carbide',
      toolDiameter: 6,
    } as any;

    const result = await FabricationCNCFeedsAndSpeedsNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
