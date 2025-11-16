import { describe, it, expect } from 'vitest';
import { ArchitectureDoorsSlidingDoorNode } from './sliding-door.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureDoorsSlidingDoorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      opening: undefined,
    } as any;
    const params = {
      panelCount: 2,
      panelWidth: 900,
      openingPercent: 0,
    } as any;

    const result = await ArchitectureDoorsSlidingDoorNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
