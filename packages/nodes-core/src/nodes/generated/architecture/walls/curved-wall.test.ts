import { describe, it, expect } from 'vitest';
import { ArchitectureWallsCurvedWallNode } from './curved-wall.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureWallsCurvedWallNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      curve: undefined,
    } as any;
    const params = {
      height: 3000,
      thickness: 200,
      segments: 10,
    } as any;

    const result = await ArchitectureWallsCurvedWallNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
