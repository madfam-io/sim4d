import { describe, it, expect } from 'vitest';
import { ArchitectureStairsStairBalustradeNode } from './stair-balustrade.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureStairsStairBalustradeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      stairSide: undefined,
    } as any;
    const params = {
      style: 'vertical',
      spacing: 100,
    } as any;

    const result = await ArchitectureStairsStairBalustradeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
