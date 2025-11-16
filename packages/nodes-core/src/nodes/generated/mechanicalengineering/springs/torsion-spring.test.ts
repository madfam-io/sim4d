import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringSpringsTorsionSpringNode } from './torsion-spring.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringSpringsTorsionSpringNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      wireDiameter: 2,
      coilDiameter: 20,
      coils: 5,
      legLength: 30,
      legAngle: 90,
    } as any;

    const result = await MechanicalEngineeringSpringsTorsionSpringNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
