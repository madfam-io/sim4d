import { describe, it, expect } from 'vitest';
import { ArchitectureWallsFireWallNode } from './fire-wall.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureWallsFireWallNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      path: undefined,
    } as any;
    const params = {
      fireRating: '2-hour',
      thickness: 250,
    } as any;

    const result = await ArchitectureWallsFireWallNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
