import { describe, it, expect } from 'vitest';
import { ArchitectureWallsShearWallNode } from './shear-wall.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureWallsShearWallNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      wallOutline: undefined,
    } as any;
    const params = {
      thickness: 300,
      reinforcementRatio: 0.025,
    } as any;

    const result = await ArchitectureWallsShearWallNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
