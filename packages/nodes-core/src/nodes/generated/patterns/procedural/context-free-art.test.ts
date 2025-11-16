import { describe, it, expect } from 'vitest';
import { PatternsProceduralContextFreeArtNode } from './context-free-art.node';
import { createTestContext } from '../test-utils';

describe('PatternsProceduralContextFreeArtNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      canvas: undefined,
    } as any;
    const params = {
      rules: 'CIRCLE{},SQUARE{r 45}',
      depth: 10,
    } as any;

    const result = await PatternsProceduralContextFreeArtNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
