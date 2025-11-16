import { describe, it, expect } from 'vitest';
import { FabricationRoboticsAdditiveManufacturingNode } from './additive-manufacturing.node';
import { createTestContext } from '../test-utils';

describe('FabricationRoboticsAdditiveManufacturingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      printPaths: undefined,
    } as any;
    const params = {
      nozzleSize: 4,
      layerHeight: 2,
    } as any;

    const result = await FabricationRoboticsAdditiveManufacturingNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
