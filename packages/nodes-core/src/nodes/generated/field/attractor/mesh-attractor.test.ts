import { describe, it, expect } from 'vitest';
import { FieldAttractorMeshAttractorNode } from './mesh-attractor.node';
import { createTestContext } from '../test-utils';

describe('FieldAttractorMeshAttractorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      mesh: undefined,
    } as any;
    const params = {
      strength: 1,
      radius: 20,
      weightByArea: false,
    } as any;

    const result = await FieldAttractorMeshAttractorNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
