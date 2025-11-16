import { describe, it, expect } from 'vitest';
import { PatternsGeometricParquetDeformationNode } from './parquet-deformation.node';
import { createTestContext } from '../test-utils';

describe('PatternsGeometricParquetDeformationNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      baseTile: undefined,
    } as any;
    const params = {
      deformationType: 'radial',
      steps: 10,
    } as any;

    const result = await PatternsGeometricParquetDeformationNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
