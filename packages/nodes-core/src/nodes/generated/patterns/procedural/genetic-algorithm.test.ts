import { describe, it, expect } from 'vitest';
import { PatternsProceduralGeneticAlgorithmNode } from './genetic-algorithm.node';
import { createTestContext } from '../test-utils';

describe('PatternsProceduralGeneticAlgorithmNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      fitness: undefined,
    } as any;
    const params = {
      population: 50,
      generations: 100,
      mutationRate: 0.1,
    } as any;

    const result = await PatternsProceduralGeneticAlgorithmNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
