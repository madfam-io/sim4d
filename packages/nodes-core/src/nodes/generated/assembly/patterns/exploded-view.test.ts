import { describe, it, expect } from 'vitest';
import { AssemblyPatternsExplodedViewNode } from './exploded-view.node';
import { createTestContext } from '../test-utils';

describe('AssemblyPatternsExplodedViewNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      assembly: undefined,
    } as any;
    const params = {
      distance: 100,
      autoSpace: true,
    } as any;

    const result = await AssemblyPatternsExplodedViewNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
