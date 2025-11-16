import { describe, it, expect } from 'vitest';
import { DataTreeTreeStatisticsNode } from './tree-statistics.node';
import { createTestContext } from '../test-utils';

describe('DataTreeTreeStatisticsNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      tree: undefined,
    } as any;
    const params = {} as any;

    const result = await DataTreeTreeStatisticsNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
