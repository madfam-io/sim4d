import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringSpringsCompressionSpringNode } from './compression-spring.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringSpringsCompressionSpringNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      wireDiameter: 2,
      coilDiameter: 20,
      freeLength: 50,
      coils: 8,
      endType: 'closed',
    } as any;

    const result = await MechanicalEngineeringSpringsCompressionSpringNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
