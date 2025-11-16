import { describe, it, expect } from 'vitest';
import { FabricationRoboticsPalletizingPatternNode } from './palletizing-pattern.node';
import { createTestContext } from '../test-utils';

describe('FabricationRoboticsPalletizingPatternNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      boxSize: undefined,
      palletSize: undefined,
    } as any;
    const params = {
      pattern: 'interlocked',
      layersCount: 10,
    } as any;

    const result = await FabricationRoboticsPalletizingPatternNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
