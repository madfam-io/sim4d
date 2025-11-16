import { describe, it, expect } from 'vitest';
import { ArchitectureWallsRetainingWallNode } from './retaining-wall.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureWallsRetainingWallNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      path: undefined,
    } as any;
    const params = {
      height: 2000,
      baseThickness: 400,
      batter: 10,
    } as any;

    const result = await ArchitectureWallsRetainingWallNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
