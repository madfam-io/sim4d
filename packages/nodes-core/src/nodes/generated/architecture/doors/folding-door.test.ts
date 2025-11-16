import { describe, it, expect } from 'vitest';
import { ArchitectureDoorsFoldingDoorNode } from './folding-door.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureDoorsFoldingDoorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      opening: undefined,
    } as any;
    const params = {
      panels: 4,
      foldDirection: 'left',
    } as any;

    const result = await ArchitectureDoorsFoldingDoorNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
