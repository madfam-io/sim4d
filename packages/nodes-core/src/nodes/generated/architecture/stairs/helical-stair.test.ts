import { describe, it, expect } from 'vitest';
import { ArchitectureStairsHelicalStairNode } from './helical-stair.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureStairsHelicalStairNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      centerPoint: undefined,
    } as any;
    const params = {
      innerRadius: 500,
      outerRadius: 1500,
      totalRise: 3000,
    } as any;

    const result = await ArchitectureStairsHelicalStairNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
