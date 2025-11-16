import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringFastenersClampingCollarNode } from './clamping-collar.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringFastenersClampingCollarNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      position: undefined,
    } as any;
    const params = {
      shaftDiameter: 10,
      outerDiameter: 20,
      width: 8,
      clampType: 'set-screw',
    } as any;

    const result = await MechanicalEngineeringFastenersClampingCollarNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
