import { describe, it, expect } from 'vitest';
import { ArchitectureStairsLShapedStairNode } from './lshaped-stair.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureStairsLShapedStairNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      startPoint: undefined,
    } as any;
    const params = {
      totalRise: 3000,
      landingSize: 1200,
      turnDirection: 'right',
    } as any;

    const result = await ArchitectureStairsLShapedStairNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
