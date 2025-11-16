import { describe, it, expect } from 'vitest';
import { ArchitectureWallsParapetWallNode } from './parapet-wall.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureWallsParapetWallNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      roofEdge: undefined,
    } as any;
    const params = {
      height: 1000,
      coping: true,
      copingOverhang: 50,
    } as any;

    const result = await ArchitectureWallsParapetWallNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
