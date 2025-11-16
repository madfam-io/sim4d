import { describe, it, expect } from 'vitest';
import { ArchitectureFloorsRadiantFloorNode } from './radiant-floor.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureFloorsRadiantFloorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      floorArea: undefined,
    } as any;
    const params = {
      pipeSpacing: 200,
      pipeDialeter: 16,
      zoneCount: 1,
    } as any;

    const result = await ArchitectureFloorsRadiantFloorNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
