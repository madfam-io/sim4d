import { describe, it, expect } from 'vitest';
import { AlgorithmicOptimizationGradientDescentNode } from './gradient-descent.node';
import { createTestContext } from '../test-utils';

describe('AlgorithmicOptimizationGradientDescentNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      objective: undefined,
      initialPoint: undefined,
    } as any;
    const params = {
      learningRate: 0.01,
      maxIterations: 1000,
      tolerance: 0.001,
      momentum: 0.9,
    } as any;

    const result = await AlgorithmicOptimizationGradientDescentNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
