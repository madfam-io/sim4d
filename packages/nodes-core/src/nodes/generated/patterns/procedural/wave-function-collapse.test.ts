import { describe, it, expect } from 'vitest';
import { PatternsProceduralWaveFunctionCollapseNode } from './wave-function-collapse.node';
import { createTestContext } from '../test-utils';

describe('PatternsProceduralWaveFunctionCollapseNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      tileset: undefined,
    } as any;
    const params = {
      tilesetSize: 5,
      gridWidth: 20,
      gridHeight: 20,
    } as any;

    const result = await PatternsProceduralWaveFunctionCollapseNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
