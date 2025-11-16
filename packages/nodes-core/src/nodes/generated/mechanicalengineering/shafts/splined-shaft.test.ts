import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringShaftsSplinedShaftNode } from './splined-shaft.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringShaftsSplinedShaftNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      majorDiameter: 25,
      minorDiameter: 22,
      splineCount: 6,
      length: 50,
    } as any;

    const result = await MechanicalEngineeringShaftsSplinedShaftNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
