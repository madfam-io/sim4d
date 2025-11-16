import { describe, it, expect } from 'vitest';
import { FabricationLaserCutOrderOptimizationNode } from './cut-order-optimization.node';
import { createTestContext } from '../test-utils';

describe('FabricationLaserCutOrderOptimizationNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      paths: undefined,
    } as any;
    const params = {
      innerFirst: true,
      minimizeTravel: true,
    } as any;

    const result = await FabricationLaserCutOrderOptimizationNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
