import { describe, it, expect } from 'vitest';
import { FieldAttractorVortexAttractorNode } from './vortex-attractor.node';
import { createTestContext } from '../test-utils';

describe('FieldAttractorVortexAttractorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      axis: undefined,
    } as any;
    const params = {
      strength: 1,
      radius: 100,
      coreRadius: 10,
      height: 200,
    } as any;

    const result = await FieldAttractorVortexAttractorNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
