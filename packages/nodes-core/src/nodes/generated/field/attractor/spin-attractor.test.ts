import { describe, it, expect } from 'vitest';
import { FieldAttractorSpinAttractorNode } from './spin-attractor.node';
import { createTestContext } from '../test-utils';

describe('FieldAttractorSpinAttractorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      strength: 1,
      radius: 100,
      axis: [0, 0, 1],
      decay: 0.5,
    } as any;

    const result = await FieldAttractorSpinAttractorNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
