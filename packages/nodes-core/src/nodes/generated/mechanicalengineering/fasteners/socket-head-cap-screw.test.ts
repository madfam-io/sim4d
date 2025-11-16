import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringFastenersSocketHeadCapScrewNode } from './socket-head-cap-screw.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringFastenersSocketHeadCapScrewNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      position: undefined,
    } as any;
    const params = {
      diameter: 'M5',
      length: 16,
      socketSize: 4,
      headDiameter: 8.5,
    } as any;

    const result = await MechanicalEngineeringFastenersSocketHeadCapScrewNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
