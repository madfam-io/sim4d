import { describe, it, expect } from 'vitest';
import { AssemblyPatternsSmartFastenersNode } from './smart-fasteners.node';
import { createTestContext } from '../test-utils';

describe('AssemblyPatternsSmartFastenersNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      holes: undefined,
    } as any;
    const params = {
      type: 'bolt',
      size: 10,
      autoSize: true,
    } as any;

    const result = await AssemblyPatternsSmartFastenersNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
