import { describe, it, expect } from 'vitest';
import { SolidPrimitivesRoundedBoxNode } from './rounded-box.node';
import { createTestContext } from '../test-utils';

describe('SolidPrimitivesRoundedBoxNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      width: 100,
      depth: 100,
      height: 100,
      radius: 10,
    } as any;

    const result = await SolidPrimitivesRoundedBoxNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
