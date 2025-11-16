import { describe, it, expect } from 'vitest';
import { ArchitectureFloorsGreenRoofNode } from './green-roof.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureFloorsGreenRoofNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      roofSurface: undefined,
    } as any;
    const params = {
      type: 'extensive',
      soilDepth: 100,
    } as any;

    const result = await ArchitectureFloorsGreenRoofNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
