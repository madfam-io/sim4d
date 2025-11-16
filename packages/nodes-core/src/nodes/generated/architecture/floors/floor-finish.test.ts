import { describe, it, expect } from 'vitest';
import { ArchitectureFloorsFloorFinishNode } from './floor-finish.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureFloorsFloorFinishNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      floorArea: undefined,
    } as any;
    const params = {
      material: 'tile',
      pattern: 'straight',
    } as any;

    const result = await ArchitectureFloorsFloorFinishNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
