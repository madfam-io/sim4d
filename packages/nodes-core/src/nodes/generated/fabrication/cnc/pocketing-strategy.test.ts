import { describe, it, expect } from 'vitest';
import { FabricationCNCPocketingStrategyNode } from './pocketing-strategy.node';
import { createTestContext } from '../test-utils';

describe('FabricationCNCPocketingStrategyNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      pocket: undefined,
      depth: undefined,
    } as any;
    const params = {
      pattern: 'spiral',
      stepdown: 2,
      finishPass: true,
    } as any;

    const result = await FabricationCNCPocketingStrategyNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
