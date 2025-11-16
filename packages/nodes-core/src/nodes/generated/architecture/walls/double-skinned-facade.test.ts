import { describe, it, expect } from 'vitest';
import { ArchitectureWallsDoubleSkinnedFacadeNode } from './double-skinned-facade.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureWallsDoubleSkinnedFacadeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      buildingFace: undefined,
    } as any;
    const params = {
      cavityWidth: 600,
      ventilationType: 'natural',
    } as any;

    const result = await ArchitectureWallsDoubleSkinnedFacadeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
