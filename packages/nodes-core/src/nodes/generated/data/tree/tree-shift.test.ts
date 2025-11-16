import { describe, it, expect } from 'vitest';
import { DataTreeTreeShiftNode } from './tree-shift.node';
import { createTestContext } from '../test-utils';

describe('DataTreeTreeShiftNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      tree: undefined,
      offset: undefined,
    } as any;
    const params = {} as any;

    const result = await DataTreeTreeShiftNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
