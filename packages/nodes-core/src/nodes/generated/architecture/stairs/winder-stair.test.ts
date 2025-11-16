import { describe, it, expect } from 'vitest';
import { ArchitectureStairsWinderStairNode } from './winder-stair.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureStairsWinderStairNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      path: undefined,
    } as any;
    const params = {
      winderCount: 3,
      turnAngle: 90,
    } as any;

    const result = await ArchitectureStairsWinderStairNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
