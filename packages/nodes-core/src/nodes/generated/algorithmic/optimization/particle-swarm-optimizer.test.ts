import { describe, it, expect } from 'vitest';
import { AlgorithmicOptimizationParticleSwarmOptimizerNode } from './particle-swarm-optimizer.node';
import { createTestContext } from '../test-utils';

describe('AlgorithmicOptimizationParticleSwarmOptimizerNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      objective: undefined,
      bounds: undefined,
    } as any;
    const params = {
      swarmSize: 50,
      iterations: 100,
      inertia: 0.7,
      cognitive: 2,
      social: 2,
    } as any;

    const result = await AlgorithmicOptimizationParticleSwarmOptimizerNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
