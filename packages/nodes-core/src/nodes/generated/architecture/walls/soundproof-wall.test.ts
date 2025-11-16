import { describe, it, expect } from 'vitest';
import { ArchitectureWallsSoundproofWallNode } from './soundproof-wall.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureWallsSoundproofWallNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      wallPath: undefined,
    } as any;
    const params = {
      stcRating: 50,
      massLayers: 2,
    } as any;

    const result = await ArchitectureWallsSoundproofWallNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
