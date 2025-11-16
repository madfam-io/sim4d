import { describe, it, expect } from 'vitest';
import { AdvancedLoftLoftNode } from './loft.node';
import { createTestContext } from '../test-utils';

describe('AdvancedLoftLoftNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      profiles: undefined,
    } as any;
    const params = {
      ruled: false,
      closed: false,
      solid: true,
      maxDegree: 3,
    } as any;

    const result = await AdvancedLoftLoftNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
