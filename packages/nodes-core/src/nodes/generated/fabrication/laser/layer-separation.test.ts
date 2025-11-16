import { describe, it, expect } from 'vitest';
import { FabricationLaserLayerSeparationNode } from './layer-separation.node';
import { createTestContext } from '../test-utils';

describe('FabricationLaserLayerSeparationNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      drawing: undefined,
    } as any;
    const params = {
      separateBy: 'color',
    } as any;

    const result = await FabricationLaserLayerSeparationNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
