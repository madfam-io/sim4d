import { describe, it, expect } from 'vitest';
import { ArchitectureStairsStraightStairNode } from './straight-stair.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureStairsStraightStairNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      startPoint: undefined,
    } as any;
    const params = {
      totalRise: 3000,
      treadDepth: 280,
      riserHeight: 175,
      width: 1200,
    } as any;

    const result = await ArchitectureStairsStraightStairNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
