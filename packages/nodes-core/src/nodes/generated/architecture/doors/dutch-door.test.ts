import { describe, it, expect } from 'vitest';
import { ArchitectureDoorsDutchDoorNode } from './dutch-door.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureDoorsDutchDoorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      opening: undefined,
    } as any;
    const params = {
      splitHeight: 1050,
      topOpen: false,
      bottomOpen: false,
    } as any;

    const result = await ArchitectureDoorsDutchDoorNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
