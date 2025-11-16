import { describe, it, expect } from 'vitest';
import { ArchitectureFloorsPedestalPaversNode } from './pedestal-pavers.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureFloorsPedestalPaversNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      area: undefined,
    } as any;
    const params = {
      paverSize: 600,
      pedestalHeight: 100,
    } as any;

    const result = await ArchitectureFloorsPedestalPaversNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
