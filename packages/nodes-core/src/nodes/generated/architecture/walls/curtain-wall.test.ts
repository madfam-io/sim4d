import { describe, it, expect } from 'vitest';
import { ArchitectureWallsCurtainWallNode } from './curtain-wall.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureWallsCurtainWallNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      surface: undefined,
    } as any;
    const params = {
      gridU: 1500,
      gridV: 1500,
      mullionWidth: 50,
      mullionDepth: 100,
    } as any;

    const result = await ArchitectureWallsCurtainWallNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
