import { describe, it, expect } from 'vitest';
import { SimulationKinematicsForwardKinematicsNode } from './forward-kinematics.node';
import { createTestContext } from '../test-utils';

describe('SimulationKinematicsForwardKinematicsNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      mechanism: undefined,
      jointValues: undefined,
    } as any;
    const params = {
      timeStep: 0.01,
      duration: 1,
    } as any;

    const result = await SimulationKinematicsForwardKinematicsNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
