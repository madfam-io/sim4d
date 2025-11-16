import { describe, it, expect } from 'vitest';
import { NeuralNetworkNode } from './neuralnetwork.node';
import { createTestContext } from './../../test-utils';

describe('NeuralNetworkNode', () => {
  it('should create NeuralNetwork', async () => {
    const context = createTestContext();
    const inputs = {
      trainingData: null,
      features: null,
      target: null,
    };
    const params = {
      hiddenLayers: '10,5',
      activation: 'relu',
      learningRate: 0.01,
      epochs: 100,
    };

    const result = await NeuralNetworkNode.evaluate(context, inputs, params);

    expect(result).toBeDefined();
    expect(result.model).toBeDefined();
    expect(result.loss).toBeDefined();
    expect(result.accuracy).toBeDefined();
    expect(result.predictions).toBeDefined();
  });
});
