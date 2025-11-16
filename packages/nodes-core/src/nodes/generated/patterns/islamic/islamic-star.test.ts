import { describe, it, expect } from 'vitest';
import { PatternsIslamicIslamicStarNode } from './islamic-star.node';
import { createTestContext } from '../test-utils';

describe('PatternsIslamicIslamicStarNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      points: 8,
      innerRadius: 0.5,
      rotation: 0,
    } as any;

    const result = await PatternsIslamicIslamicStarNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
