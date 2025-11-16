import { describe, it, expect } from 'vitest';
import { FabricationCNCFiveAxisPositioningNode } from './five-axis-positioning.node';
import { createTestContext } from '../test-utils';

describe('FabricationCNCFiveAxisPositioningNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      surface: undefined,
    } as any;
    const params = {
      leadAngle: 10,
      tiltAngle: 0,
    } as any;

    const result = await FabricationCNCFiveAxisPositioningNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
