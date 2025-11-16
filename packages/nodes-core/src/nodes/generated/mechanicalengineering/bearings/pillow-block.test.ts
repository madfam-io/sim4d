import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringBearingsPillowBlockNode } from './pillow-block.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringBearingsPillowBlockNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      position: undefined,
    } as any;
    const params = {
      shaftDiameter: 20,
      mountingHoles: 2,
      baseWidth: 80,
      height: 50,
    } as any;

    const result = await MechanicalEngineeringBearingsPillowBlockNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
