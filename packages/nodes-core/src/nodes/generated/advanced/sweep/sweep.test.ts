import { describe, it, expect } from 'vitest';
import { AdvancedSweepSweepNode } from './sweep.node';
import { createTestContext } from '../test-utils';

describe('AdvancedSweepSweepNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      profile: undefined,
      path: undefined,
    } as any;
    const params = {
      twistAngle: 0,
      scaleFactor: 1,
      keepOrientation: false,
      solid: true,
    } as any;

    const result = await AdvancedSweepSweepNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
