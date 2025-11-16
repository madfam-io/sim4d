import { describe, it, expect } from 'vitest';
import { FieldAttractorSurfaceAttractorNode } from './surface-attractor.node';
import { createTestContext } from '../test-utils';

describe('FieldAttractorSurfaceAttractorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      surfaces: undefined,
    } as any;
    const params = {
      strength: 1,
      radius: 30,
      falloff: 'smooth',
    } as any;

    const result = await FieldAttractorSurfaceAttractorNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
