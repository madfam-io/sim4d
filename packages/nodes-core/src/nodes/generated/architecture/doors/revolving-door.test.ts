import { describe, it, expect } from 'vitest';
import { ArchitectureDoorsRevolvingDoorNode } from './revolving-door.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureDoorsRevolvingDoorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      diameter: 2000,
      wings: 4,
      rotation: 0,
    } as any;

    const result = await ArchitectureDoorsRevolvingDoorNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
