import { describe, it, expect } from 'vitest';
import { ArchitectureStairsSpiralStairNode } from './spiral-stair.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureStairsSpiralStairNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      centerPoint: undefined,
    } as any;
    const params = {
      diameter: 2000,
      totalRise: 3000,
      rotation: 360,
      centerPole: true,
    } as any;

    const result = await ArchitectureStairsSpiralStairNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
