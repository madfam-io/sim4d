import { describe, it, expect } from 'vitest';
import { PatternsProceduralProceduralTextureNode } from './procedural-texture.node';
import { createTestContext } from '../test-utils';

describe('PatternsProceduralProceduralTextureNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      surface: undefined,
    } as any;
    const params = {
      type: 'wood',
      scale: 10,
      seed: 0,
    } as any;

    const result = await PatternsProceduralProceduralTextureNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
