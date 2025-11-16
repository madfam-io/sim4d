import { describe, it, expect } from 'vitest';
import { ArchitectureRampsCurbRampNode } from './curb-ramp.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureRampsCurbRampNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      curbLine: undefined,
    } as any;
    const params = {
      type: 'perpendicular',
      flareSlope: 0.1,
    } as any;

    const result = await ArchitectureRampsCurbRampNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
