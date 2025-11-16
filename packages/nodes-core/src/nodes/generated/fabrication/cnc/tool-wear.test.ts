import { describe, it, expect } from 'vitest';
import { FabricationCNCToolWearNode } from './tool-wear.node';
import { createTestContext } from '../test-utils';

describe('FabricationCNCToolWearNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      toolpath: undefined,
    } as any;
    const params = {
      material: 'steel',
      cuttingTime: 60,
    } as any;

    const result = await FabricationCNCToolWearNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
