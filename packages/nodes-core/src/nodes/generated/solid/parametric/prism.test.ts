import { describe, it, expect } from 'vitest';
import { SolidParametricPrismNode } from './prism.node';
import { createTestContext } from '../test-utils';

describe('SolidParametricPrismNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      profile: undefined,
    } as any;
    const params = {
      height: 100,
      twist: 0,
      taper: 1,
    } as any;

    const result = await SolidParametricPrismNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
