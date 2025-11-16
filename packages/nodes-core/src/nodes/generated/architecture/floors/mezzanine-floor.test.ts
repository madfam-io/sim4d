import { describe, it, expect } from 'vitest';
import { ArchitectureFloorsMezzanineFloorNode } from './mezzanine-floor.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureFloorsMezzanineFloorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      mezzanineOutline: undefined,
    } as any;
    const params = {
      structureType: 'steel',
      clearHeight: 2400,
    } as any;

    const result = await ArchitectureFloorsMezzanineFloorNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
