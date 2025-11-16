import { describe, it, expect } from 'vitest';
import { ArchitectureDoorsSingleDoorNode } from './single-door.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureDoorsSingleDoorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      position: undefined,
    } as any;
    const params = {
      width: 900,
      height: 2100,
      thickness: 45,
      swing: 'right',
      opening: 0,
    } as any;

    const result = await ArchitectureDoorsSingleDoorNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
