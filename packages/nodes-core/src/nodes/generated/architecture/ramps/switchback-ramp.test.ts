import { describe, it, expect } from 'vitest';
import { ArchitectureRampsSwitchbackRampNode } from './switchback-ramp.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureRampsSwitchbackRampNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      startPoint: undefined,
      totalRise: undefined,
    } as any;
    const params = {
      runLength: 9000,
      landingSize: 1500,
    } as any;

    const result = await ArchitectureRampsSwitchbackRampNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
