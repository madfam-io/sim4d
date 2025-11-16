import { describe, it, expect } from 'vitest';
import { ArchitectureWallsStraightWallNode } from './straight-wall.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureWallsStraightWallNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      centerline: undefined,
    } as any;
    const params = {
      height: 3000,
      thickness: 200,
      justification: 'center',
    } as any;

    const result = await ArchitectureWallsStraightWallNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
