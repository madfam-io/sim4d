import { describe, it, expect } from 'vitest';
import { ArchitectureStairsStairNosingNode } from './stair-nosing.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureStairsStairNosingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      treadEdges: undefined,
    } as any;
    const params = {
      projection: 25,
      material: 'aluminum',
    } as any;

    const result = await ArchitectureStairsStairNosingNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
