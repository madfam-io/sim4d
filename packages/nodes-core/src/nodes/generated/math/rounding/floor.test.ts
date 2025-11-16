import { describe, it, expect } from 'vitest';
import { MathRoundingFloorNode } from './floor.node';
import { createTestContext } from '../test-utils';

describe('MathRoundingFloorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      value: undefined,
    } as any;
    const params = {} as any;

    const result = await MathRoundingFloorNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
