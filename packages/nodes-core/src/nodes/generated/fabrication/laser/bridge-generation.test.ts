import { describe, it, expect } from 'vitest';
import { FabricationLaserBridgeGenerationNode } from './bridge-generation.node';
import { createTestContext } from '../test-utils';

describe('FabricationLaserBridgeGenerationNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      cutPath: undefined,
    } as any;
    const params = {
      bridgeWidth: 2,
      bridgeCount: 4,
    } as any;

    const result = await FabricationLaserBridgeGenerationNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
