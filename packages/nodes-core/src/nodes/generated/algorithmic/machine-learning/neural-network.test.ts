import { describe, it, expect } from 'vitest';
import { AlgorithmicMachineLearningNeuralNetworkNode } from './neural-network.node';
import { createTestContext } from '../test-utils';

describe('AlgorithmicMachineLearningNeuralNetworkNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      trainingData: undefined,
      features: undefined,
      target: undefined,
    } as any;
    const params = {
      hiddenLayers: '10,5',
      activation: 'relu',
      learningRate: 0.01,
      epochs: 100,
    } as any;

    const result = await AlgorithmicMachineLearningNeuralNetworkNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
