import { describe, it, expect } from 'vitest';
import { FabricationCNCScallopHeightNode } from './scallop-height.node';
import { createTestContext } from '../test-utils';

describe('FabricationCNCScallopHeightNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      surface: undefined,
    } as any;
    const params = {
      ballRadius: 3,
      stepover: 1,
    } as any;

    const result = await FabricationCNCScallopHeightNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
