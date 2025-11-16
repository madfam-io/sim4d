import { describe, it, expect } from 'vitest';
import { PatternsGeometricQuasiCrystalNode } from './quasi-crystal.node';
import { createTestContext } from '../test-utils';

describe('PatternsGeometricQuasiCrystalNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      boundary: undefined,
    } as any;
    const params = {
      symmetry: 5,
      waves: 4,
    } as any;

    const result = await PatternsGeometricQuasiCrystalNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
