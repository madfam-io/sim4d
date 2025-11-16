import { describe, it, expect } from 'vitest';
import { TransformAlignNode } from './align.node';
import { createTestContext } from '../test-utils';

describe('TransformAlignNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shapes: undefined,
    } as any;
    const params = {
      alignX: 'center',
      alignY: 'center',
      alignZ: 'none',
    } as any;

    const result = await TransformAlignNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
