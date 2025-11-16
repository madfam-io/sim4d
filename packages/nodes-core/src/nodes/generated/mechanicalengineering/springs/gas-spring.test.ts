import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringSpringsGasSpringNode } from './gas-spring.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringSpringsGasSpringNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      mountPoint: undefined,
    } as any;
    const params = {
      cylinderDiameter: 20,
      strokeLength: 100,
      extendedLength: 250,
      rodDiameter: 8,
    } as any;

    const result = await MechanicalEngineeringSpringsGasSpringNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
