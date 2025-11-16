import { describe, it, expect } from 'vitest';
import { ArchitectureFloorsFloorExpansionJointNode } from './floor-expansion-joint.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureFloorsFloorExpansionJointNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      jointPath: undefined,
    } as any;
    const params = {
      jointWidth: 25,
      sealantDepth: 10,
    } as any;

    const result = await ArchitectureFloorsFloorExpansionJointNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
