import { describe, it, expect } from 'vitest';
import { ArchitectureWallsGreenWallNode } from './green-wall.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureWallsGreenWallNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      wallSurface: undefined,
    } as any;
    const params = {
      moduleSize: 600,
      irrigationType: 'drip',
    } as any;

    const result = await ArchitectureWallsGreenWallNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
