import { describe, it, expect } from 'vitest';
import { AlgorithmicOptimizationTopologyOptimizerNode } from './topology-optimizer.node';
import { createTestContext } from '../test-utils';

describe('AlgorithmicOptimizationTopologyOptimizerNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      designDomain: undefined,
      loads: undefined,
      supports: undefined,
    } as any;
    const params = {
      densityElements: 100,
      volumeFraction: 0.5,
      penalization: 3,
      filter: true,
    } as any;

    const result = await AlgorithmicOptimizationTopologyOptimizerNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
