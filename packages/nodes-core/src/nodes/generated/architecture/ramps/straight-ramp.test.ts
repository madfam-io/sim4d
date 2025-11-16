import { describe, it, expect } from 'vitest';
import { ArchitectureRampsStraightRampNode } from './straight-ramp.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureRampsStraightRampNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      startPoint: undefined,
      endPoint: undefined,
    } as any;
    const params = {
      slope: 0.083,
      width: 1200,
      handrails: true,
    } as any;

    const result = await ArchitectureRampsStraightRampNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
