import { describe, it, expect } from 'vitest';
import { ArchitectureWallsCompoundWallNode } from './compound-wall.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureWallsCompoundWallNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      path: undefined,
    } as any;
    const params = {
      layers: 3,
      layerThicknesses: '100,50,100',
      layerMaterials: 'brick,insulation,drywall',
    } as any;

    const result = await ArchitectureWallsCompoundWallNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
