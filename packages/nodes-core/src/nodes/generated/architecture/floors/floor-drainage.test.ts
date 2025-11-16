import { describe, it, expect } from 'vitest';
import { ArchitectureFloorsFloorDrainageNode } from './floor-drainage.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureFloorsFloorDrainageNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      floorBoundary: undefined,
      drainLocations: undefined,
    } as any;
    const params = {
      slope: 0.01,
      drainType: 'point',
    } as any;

    const result = await ArchitectureFloorsFloorDrainageNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
