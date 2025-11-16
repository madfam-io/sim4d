import { describe, it, expect } from 'vitest';
import { PatternsGeometricGeodesicPatternNode } from './geodesic-pattern.node';
import { createTestContext } from '../test-utils';

describe('PatternsGeometricGeodesicPatternNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      sphere: undefined,
    } as any;
    const params = {
      frequency: 3,
      class: 'I',
    } as any;

    const result = await PatternsGeometricGeodesicPatternNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
