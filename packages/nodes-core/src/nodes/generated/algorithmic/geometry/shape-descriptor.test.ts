import { describe, it, expect } from 'vitest';
import { AlgorithmicGeometryShapeDescriptorNode } from './shape-descriptor.node';
import { createTestContext } from '../test-utils';

describe('AlgorithmicGeometryShapeDescriptorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
    } as any;
    const params = {
      descriptor: 'moments',
      resolution: 32,
      normalize: true,
    } as any;

    const result = await AlgorithmicGeometryShapeDescriptorNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
