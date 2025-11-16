import { describe, it, expect } from 'vitest';
import { FabricationLaserLaserPathNode } from './laser-path.node';
import { createTestContext } from '../test-utils';

describe('FabricationLaserLaserPathNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      profiles: undefined,
    } as any;
    const params = {
      kerf: 0.15,
      cornerRadius: 0,
    } as any;

    const result = await FabricationLaserLaserPathNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
