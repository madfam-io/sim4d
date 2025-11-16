import { describe, it, expect } from 'vitest';
import { PatternsIslamicGirihTilingNode } from './girih-tiling.node';
import { createTestContext } from '../test-utils';

describe('PatternsIslamicGirihTilingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      type: 'pentagon',
      size: 10,
    } as any;

    const result = await PatternsIslamicGirihTilingNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
