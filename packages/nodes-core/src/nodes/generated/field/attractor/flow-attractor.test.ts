import { describe, it, expect } from 'vitest';
import { FieldAttractorFlowAttractorNode } from './flow-attractor.node';
import { createTestContext } from '../test-utils';

describe('FieldAttractorFlowAttractorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      velocity: 10,
      turbulence: 0.1,
      viscosity: 0.1,
    } as any;

    const result = await FieldAttractorFlowAttractorNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
