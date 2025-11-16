import { describe, it, expect } from 'vitest';
import { AlgorithmicOptimizationSimulatedAnnealingNode } from './simulated-annealing.node';
import { createTestContext } from '../test-utils';

describe('AlgorithmicOptimizationSimulatedAnnealingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      objective: undefined,
      initialSolution: undefined,
    } as any;
    const params = {
      initialTemp: 1000,
      finalTemp: 0.1,
      coolingRate: 0.95,
      maxIterations: 1000,
    } as any;

    const result = await AlgorithmicOptimizationSimulatedAnnealingNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
