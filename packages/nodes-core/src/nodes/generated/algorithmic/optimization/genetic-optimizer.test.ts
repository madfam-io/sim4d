import { describe, it, expect } from 'vitest';
import { AlgorithmicOptimizationGeneticOptimizerNode } from './genetic-optimizer.node';
import { createTestContext } from '../test-utils';

describe('AlgorithmicOptimizationGeneticOptimizerNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      objectives: undefined,
      bounds: undefined,
    } as any;
    const params = {
      populationSize: 100,
      generations: 50,
      mutationRate: 0.1,
      crossoverRate: 0.8,
      elitism: 0.1,
    } as any;

    const result = await AlgorithmicOptimizationGeneticOptimizerNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
