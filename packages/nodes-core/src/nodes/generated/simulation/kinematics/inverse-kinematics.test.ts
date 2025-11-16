import { describe, it, expect } from 'vitest';
import { SimulationKinematicsInverseKinematicsNode } from './inverse-kinematics.node';
import { createTestContext } from '../test-utils';

describe('SimulationKinematicsInverseKinematicsNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      mechanism: undefined,
      targetPose: undefined,
    } as any;
    const params = {
      solver: 'jacobian',
      maxIterations: 100,
      tolerance: 0.001,
    } as any;

    const result = await SimulationKinematicsInverseKinematicsNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
