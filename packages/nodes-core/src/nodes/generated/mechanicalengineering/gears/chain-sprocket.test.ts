import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringGearsChainSprocketNode } from './chain-sprocket.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringGearsChainSprocketNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      chainPitch: 12.7,
      teeth: 18,
      rollerDiameter: 7.92,
      width: 7.85,
    } as any;

    const result = await MechanicalEngineeringGearsChainSprocketNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
