import { describe, it, expect } from 'vitest';
import { AlgorithmicGeometryPointCloudProcessingNode } from './point-cloud-processing.node';
import { createTestContext } from '../test-utils';

describe('AlgorithmicGeometryPointCloudProcessingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      points: undefined,
    } as any;
    const params = {
      operation: 'filter',
      radius: 1,
      neighbors: 6,
    } as any;

    const result = await AlgorithmicGeometryPointCloudProcessingNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
