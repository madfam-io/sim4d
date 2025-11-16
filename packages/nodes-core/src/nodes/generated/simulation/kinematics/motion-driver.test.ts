import { describe, it, expect } from 'vitest';
import { SimulationKinematicsMotionDriverNode } from './motion-driver.node';
import { createTestContext } from '../test-utils';

describe('SimulationKinematicsMotionDriverNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      joint: undefined,
    } as any;
    const params = {
      motionType: 'constant',
      velocity: 1,
      acceleration: 0,
      period: 1,
    } as any;

    const result = await SimulationKinematicsMotionDriverNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
