import { describe, it, expect } from 'vitest';
import { FieldAttractorPointAttractorNode } from './point-attractor.node';
import { createTestContext } from '../test-utils';

describe('FieldAttractorPointAttractorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      points: undefined,
    } as any;
    const params = {
      strength: 1,
      radius: 100,
      falloff: 'quadratic',
    } as any;

    const result = await FieldAttractorPointAttractorNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
