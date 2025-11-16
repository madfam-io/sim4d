import { describe, it, expect } from 'vitest';
import { FabricationLaserFocusCompensationNode } from './focus-compensation.node';
import { createTestContext } from '../test-utils';

describe('FabricationLaserFocusCompensationNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      surface: undefined,
    } as any;
    const params = {
      focalLength: 50,
      beamDivergence: 2,
    } as any;

    const result = await FabricationLaserFocusCompensationNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
