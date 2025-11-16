import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringFastenersHexBoltNode } from './hex-bolt.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringFastenersHexBoltNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      position: undefined,
    } as any;
    const params = {
      diameter: 'M6',
      length: 20,
      threadPitch: 1,
      headHeight: 4,
    } as any;

    const result = await MechanicalEngineeringFastenersHexBoltNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
