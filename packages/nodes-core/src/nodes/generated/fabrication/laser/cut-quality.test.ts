import { describe, it, expect } from 'vitest';
import { FabricationLaserCutQualityNode } from './cut-quality.node';
import { createTestContext } from '../test-utils';

describe('FabricationLaserCutQualityNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      material: undefined,
    } as any;
    const params = {
      speed: 20,
      power: 80,
    } as any;

    const result = await FabricationLaserCutQualityNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
