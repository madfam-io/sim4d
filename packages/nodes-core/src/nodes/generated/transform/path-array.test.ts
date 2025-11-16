import { describe, it, expect } from 'vitest';
import { TransformPathArrayNode } from './path-array.node';
import { createTestContext } from '../test-utils';

describe('TransformPathArrayNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
      path: undefined,
    } as any;
    const params = {
      count: 10,
      alignToPath: true,
      spacing: 'equal',
      distance: 50,
      merge: false,
    } as any;

    const result = await TransformPathArrayNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
