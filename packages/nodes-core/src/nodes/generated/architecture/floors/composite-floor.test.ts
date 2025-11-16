import { describe, it, expect } from 'vitest';
import { ArchitectureFloorsCompositeFloorNode } from './composite-floor.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureFloorsCompositeFloorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      floorOutline: undefined,
      beams: undefined,
    } as any;
    const params = {
      deckType: '3-inch',
      concreteThickness: 100,
    } as any;

    const result = await ArchitectureFloorsCompositeFloorNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
