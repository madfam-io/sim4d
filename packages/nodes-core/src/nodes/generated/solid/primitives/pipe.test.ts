import { describe, it, expect } from 'vitest';
import { SolidPrimitivesPipeNode } from './pipe.node';
import { createTestContext } from '../test-utils';

describe('SolidPrimitivesPipeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      outerRadius: 50,
      innerRadius: 40,
      height: 100,
    } as any;

    const result = await SolidPrimitivesPipeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
